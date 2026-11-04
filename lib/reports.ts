/* =========================================================
 * 오류 신고 데이터 (서버 전용)
 *  - 비밀번호는 비밀값을 섞은 scrypt 해시로만 저장
 *  - 공개 목록은 닉네임·분류·제목·상태만 조회
 * ========================================================= */
import 'server-only';
import { createHmac, randomBytes, scrypt, timingSafeEqual } from 'node:crypto';
import { db } from '@/lib/db';
import type { MyReport, PublicReport, ReportCategory } from '@/lib/report-meta';

const SCRYPT = { N: 32768, r: 8, p: 1, maxmem: 64 * 1024 * 1024 };
const KEY_LENGTH = 32;
const MAX_FAILURES = 5;
const LOCK_MINUTES = 15;
export const PAGE_SIZE = 20;

export type AuthFailure = 'invalid' | 'locked' | 'weak';

export interface NewReport {
  category: ReportCategory;
  itemSeq: string | null;
  drugName: string | null;
  drugCompany: string | null;
  title: string;
  body: string;
}

function secret(): string {
  const s = process.env.REPORT_SECRET?.trim();
  if (!s) {
    throw new Error('REPORT_SECRET이 설정되지 않았습니다. (로컬: .env.local / Vercel: Settings → Environment Variables 추가 후 재배포)');
  }
  return s;
}

const hmac = (value: string) => createHmac('sha256', secret()).update(value).digest();

function derive(password: string, salt: Buffer): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(hmac(password), salt, KEY_LENGTH, SCRYPT, (err, key) => (err ? reject(err) : resolve(key)));
  });
}

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  return `scrypt$${salt.toString('base64')}$${(await derive(password, salt)).toString('base64')}`;
}

async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [, salt, hash] = stored.split('$');
  const expected = Buffer.from(hash, 'base64');
  const actual = await derive(password, Buffer.from(salt, 'base64'));
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

/** 같은 숫자 반복(111111)과 연속된 숫자(123456, 654321)는 새 비밀번호로 받지 않음 */
function isWeakPassword(password: string): boolean {
  const digits = [...password].map(Number);
  const steps = digits.slice(1).map((d, i) => d - digits[i]);
  return [0, 1, -1].some((step) => steps.every((s) => s === step));
}

/** IP별 시도 횟수를 세어 한도를 넘었는지 알려 줌 (IP 원문은 저장 안 함) */
export async function isOverLimit(action: string, ip: string, limit: number, windowMinutes: number): Promise<boolean> {
  const sql = db();
  const windowMs = windowMinutes * 60_000;
  const windowStart = new Date(Math.floor(Date.now() / windowMs) * windowMs);
  const [row] = await sql<{ count: number }[]>`
    insert into error_board.rate_limits (key_hash, window_start)
    values (${hmac(`${action}:${ip}`).toString('hex')}, ${windowStart})
    on conflict (key_hash, window_start) do update set count = error_board.rate_limits.count + 1
    returning count`;
  if (Math.random() < 0.01) {
    await sql`delete from error_board.rate_limits where window_start < now() - interval '1 day'`;
  }
  return row.count > limit;
}

interface ReporterRow {
  id: string;
  password_hash: string;
  failed_attempts: number;
  locked: boolean;
}

/** 닉네임과 비밀번호 확인. create면 처음 쓰는 닉네임을 등록함 */
async function authenticate(name: string, password: string, create: boolean): Promise<string | AuthFailure> {
  const sql = db();
  const find = () => sql<ReporterRow[]>`
    select id, password_hash, failed_attempts, coalesce(locked_until > now(), false) as locked
    from error_board.reporters
    where name_key = lower(btrim(${name}))`;

  let [reporter] = await find();
  if (!reporter) {
    if (!create) return 'invalid';
    if (isWeakPassword(password)) return 'weak';
    const [created] = await sql<{ id: string }[]>`
      insert into error_board.reporters (name, password_hash)
      values (${name}, ${await hashPassword(password)})
      on conflict (name_key) do nothing
      returning id`;
    if (created) return created.id;
    [reporter] = await find(); // 그사이 같은 닉네임이 등록됨
  }
  if (reporter.locked) return 'locked';

  if (!(await verifyPassword(password, reporter.password_hash))) {
    await sql`
      update error_board.reporters
      set failed_attempts = case when failed_attempts + 1 >= ${MAX_FAILURES} then 0 else failed_attempts + 1 end,
        locked_until = case when failed_attempts + 1 >= ${MAX_FAILURES}
          then now() + make_interval(mins => ${LOCK_MINUTES}) else locked_until end
      where id = ${reporter.id}`;
    return 'invalid';
  }
  if (reporter.failed_attempts > 0) {
    await sql`update error_board.reporters set failed_attempts = 0, locked_until = null where id = ${reporter.id}`;
  }
  return reporter.id;
}

const isFailure = (r: string): r is AuthFailure => r === 'invalid' || r === 'locked' || r === 'weak';

export async function createReport(name: string, password: string, report: NewReport): Promise<AuthFailure | null> {
  const reporterId = await authenticate(name, password, true);
  if (isFailure(reporterId)) return reporterId;
  await db()`
    insert into error_board.reports (reporter_id, category, item_seq, drug_name, drug_company, title, body)
    values (${reporterId}, ${report.category}, ${report.itemSeq}, ${report.drugName}, ${report.drugCompany}, ${report.title}, ${report.body})`;
  return null;
}

export async function findMyReports(name: string, password: string): Promise<MyReport[] | AuthFailure> {
  const reporterId = await authenticate(name, password, false);
  if (isFailure(reporterId)) return reporterId;
  const rows = await db()<MyReport[]>`
    select id, category, title, status, created_at as "createdAt", body, item_seq as "itemSeq",
      drug_name as "drugName", drug_company as "drugCompany", admin_reply as "adminReply", resolved_at as "resolvedAt"
    from error_board.reports
    where reporter_id = ${reporterId}
    order by created_at desc`;
  return [...rows];
}

/** 공개 목록: 본문·약 정보·답변은 조회하지 않고, 관리자가 숨긴 신고는 뺌 */
export async function listPublicReports(page: number): Promise<{ reports: PublicReport[]; total: number }> {
  const sql = db();
  const reports = await sql<PublicReport[]>`
    select r.id, p.name as nickname, r.category, r.title, r.status, r.created_at as "createdAt"
    from error_board.reports r
    join error_board.reporters p on p.id = r.reporter_id
    where r.hidden_at is null
    order by r.created_at desc
    limit ${PAGE_SIZE} offset ${(page - 1) * PAGE_SIZE}`;
  const [{ total }] = await sql<{ total: number }[]>`
    select count(*)::int as total from error_board.reports where hidden_at is null`;
  return { reports: [...reports], total };
}
