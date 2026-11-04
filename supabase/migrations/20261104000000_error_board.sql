-- 오류 신고 게시판: 회원가입 없이 닉네임과 숫자 비밀번호로 본인 신고를 확인한다
-- RLS를 쓰지 않으므로 Supabase API에 공개하지 않는 스키마에 두고, Next.js 서버만 접근한다.

create schema error_board;
revoke all on schema error_board from public, anon, authenticated;

-- 신고자: 회원가입 없이 닉네임과 숫자 비밀번호만 저장
create table error_board.reporters (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(btrim(name)) between 1 and 30),
  -- 공백·대소문자만 다른 닉네임 중복 방지
  name_key text generated always as (lower(btrim(name))) stored unique,
  password_hash text not null,      -- 원문 저장 안 함
  failed_attempts int not null default 0,
  locked_until timestamptz,
  created_at timestamptz not null default now()
);

-- 오류 신고
create table error_board.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null
    references error_board.reporters(id) on delete cascade,
  category text not null
    check (category in ('translation', 'drug_info', 'guide', 'feature', 'other')),

  -- 메인과 같은 식약처 검색에서 선택한 약
  item_seq text check (item_seq ~ '^[0-9]{1,20}$'),  -- 품목기준코드
  drug_name text check (char_length(drug_name) <= 200),  -- 신고 당시 제품명
  drug_company text check (char_length(drug_company) <= 200),  -- 신고 당시 업체명

  title text not null check (char_length(btrim(title)) between 1 and 100),
  body text not null check (char_length(btrim(body)) between 1 and 2000),
  status text not null default 'received'
    check (status in ('received', 'in_progress', 'resolved', 'declined')),
  admin_reply text check (char_length(admin_reply) <= 2000),
  resolved_at timestamptz,          -- 트리거가 기록
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- 코드와 제품명은 항상 함께 저장
  check ((item_seq is null) = (drug_name is null)),
  -- 약 관련 신고는 약 선택 필수
  check (category in ('feature', 'other') or item_seq is not null)
);
create index on error_board.reports (reporter_id, created_at desc);
create index on error_board.reports (created_at desc);
create index on error_board.reports (status, created_at desc);
create index on error_board.reports (item_seq);  -- 같은 약의 신고 모아 보기

-- 도배와 비밀번호 대입 방지 (IP 원문 저장 안 함)
create table error_board.rate_limits (
  key_hash text not null,           -- 비밀값으로 만든 IP와 동작의 HMAC
  window_start timestamptz not null,
  count int not null default 1,
  primary key (key_hash, window_start)
);

-- 상태 변경 시 수정·완료 시각 자동 기록
create function error_board.touch_report()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  if new.status in ('resolved', 'declined') and old.status not in ('resolved', 'declined') then
    new.resolved_at := now();
  elsif new.status not in ('resolved', 'declined') then
    new.resolved_at := null;
  end if;
  return new;
end;
$$;

revoke all on function error_board.touch_report() from public;

create trigger touch_report
  before update on error_board.reports
  for each row execute function error_board.touch_report();

-- 서버 전용 계정 (비밀번호는 이 파일에 쓰지 않고 SQL Editor에서 alter role로 설정)
create role board_server login noinherit;
grant usage on schema error_board to board_server;
grant select, insert, update on error_board.reporters to board_server;
grant select, insert on error_board.reports to board_server;  -- 상태와 답변은 운영자만 수정
grant select, insert, update, delete on error_board.rate_limits to board_server;
