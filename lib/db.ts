/* =========================================================
 * DB 연결 (서버 전용, board_server 계정)
 *  - 테이블에 RLS가 없으므로 공개 범위는 호출하는 서버 코드에서 지킨다
 * ========================================================= */
import 'server-only';
import postgres from 'postgres';

type Sql = ReturnType<typeof postgres>;

// 개발 중 코드가 다시 로드되어도 연결을 새로 만들지 않게 전역에 보관
const holder = globalThis as { yaksokSql?: Sql };

export function db(): Sql {
  if (holder.yaksokSql) return holder.yaksokSql;
  const url = process.env.DATABASE_URL?.trim();
  if (!url) {
    throw new Error('DATABASE_URL이 설정되지 않았습니다. (로컬: .env.local / Vercel: Settings → Environment Variables 추가 후 재배포)');
  }
  // Transaction pooler는 prepared statement를 지원하지 않음
  // 한 연결에 쿼리를 이어 보내면(pipeline) pooler에서 응답이 멈추므로 한 번에 하나씩만 보냄
  holder.yaksokSql = postgres(url, { prepare: false, max: 3, max_pipeline: 1, idle_timeout: 20, connect_timeout: 10 });
  return holder.yaksokSql;
}
