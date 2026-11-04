-- 오류 신고 관리자: 로그인은 Supabase Auth, 권한은 admins 목록으로 확인한다
-- 도배 신고는 삭제하지 않고 숨긴다. 숨긴 신고는 공개 목록에서만 빠지고 작성자는 계속 볼 수 있다.

-- 관리자
create table error_board.admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (char_length(btrim(display_name)) between 1 and 30),
  created_at timestamptz not null default now()
);

-- 신고: 처리자와 숨김 정보 추가
alter table error_board.reports
  add column handled_by uuid references error_board.admins(user_id) on delete set null,
  add column hidden_at timestamptz,
  add column hidden_reason text check (char_length(hidden_reason) <= 300),
  add check ((hidden_at is null) = (hidden_reason is null));

create index on error_board.reports (created_at desc) where hidden_at is null;

-- 처리 이력 (추가와 조회만 가능)
create table error_board.report_events (
  id bigint generated always as identity primary key,
  report_id uuid references error_board.reports(id) on delete set null,
  admin_id uuid references error_board.admins(user_id) on delete set null,
  admin_name text not null,
  action text not null
    check (action in ('status_changed', 'replied', 'hidden', 'unhidden')),
  from_status text,
  to_status text,
  admin_reply text,
  hidden_reason text,
  created_at timestamptz not null default now()
);
create index on error_board.report_events (report_id, created_at desc);

-- 서버 계정 권한: 처리 관련 칸만 수정 가능, 관리자 지정은 SQL Editor에서만
grant select on error_board.admins to board_server;
grant update (status, admin_reply, handled_by, hidden_at, hidden_reason)
  on error_board.reports to board_server;
grant select, insert on error_board.report_events to board_server;
