-- ============================================================
-- 修正クラブ福岡中央 出席管理アプリ — Supabase スキーマ
-- ============================================================

-- 1. teams（チーム）
create table teams (
  id            uuid primary key default gen_random_uuid(),
  name          text not null unique,
  password_hash text not null default '1234',
  is_admin      boolean not null default false,
  created_at    timestamptz not null default now()
);

-- 初期チームデータ（8チーム）
insert into teams (name, is_admin) values
  ('増田チーム', true),
  ('洋子チーム', false),
  ('中本チーム', false),
  ('田中チーム', false),
  ('山本チーム', false),
  ('小松チーム', false),
  ('佐藤チーム', false),
  ('鈴木チーム', false);

-- 2. members（会員）
create table members (
  id          uuid primary key default gen_random_uuid(),
  team_id     uuid not null references teams(id) on delete cascade,
  name        text not null,
  company     text,
  role        text not null default '準会員',
  is_active   boolean not null default true,
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now()
);

create index members_team_id_idx on members(team_id);

-- 3. attendance（出席記録）
create table attendance (
  id          uuid primary key default gen_random_uuid(),
  meeting_id  integer not null,
  member_id   uuid not null references members(id) on delete cascade,
  status      text not null default 'pending' check (status in ('present', 'absent', 'pending')),
  guest_count integer not null default 0,
  guest_names jsonb not null default '[]',
  paid        boolean not null default false,
  note        text,
  updated_at  timestamptz not null default now(),
  unique(meeting_id, member_id)
);

create index attendance_meeting_member_idx on attendance(meeting_id, member_id);
create index attendance_member_id_idx on attendance(member_id);

-- ============================================================
-- Row Level Security (RLS) — 全ての読み書きを許可（anon key使用）
-- ============================================================
alter table teams enable row level security;
alter table members enable row level security;
alter table attendance enable row level security;

-- teamsは読み取り専用（パスワード確認用）
create policy "teams_read" on teams for select using (true);
create policy "teams_update_own" on teams for update using (true);

-- membersは全操作許可（チーム認証はアプリ側で制御）
create policy "members_all" on members for all using (true);

-- attendanceは全操作許可
create policy "attendance_all" on attendance for all using (true);
