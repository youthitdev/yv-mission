-- =====================================================================
-- TMI 프로젝트 "발견미션" 페이지 - Supabase 스키마
-- =====================================================================
-- 실행 순서: Supabase 프로젝트 SQL Editor에서 이 파일 전체를 실행하세요.
-- 전제: Supabase Auth를 사용하며, 카카오 로그인은 Auth > Providers > Kakao
--      (Custom OAuth / OIDC) 로 등록되어 있다고 가정합니다.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 0. 공통: updated_at 자동 갱신 트리거 함수
-- ---------------------------------------------------------------------
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- ---------------------------------------------------------------------
-- 1. profiles: 카카오 로그인 사용자 프로필
-- ---------------------------------------------------------------------
create table if not exists profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  kakao_id text unique,
  nickname text not null default '이름없음',
  avatar_url text,
  phone text,
  is_admin boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_profiles_updated_at
  before update on profiles
  for each row execute function set_updated_at();

-- 신규 유저 가입 시 profiles 자동 생성
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, kakao_id, nickname, avatar_url)
  values (
    new.id,
    new.raw_user_meta_data ->> 'provider_id',
    coalesce(new.raw_user_meta_data ->> 'name', new.raw_user_meta_data ->> 'nickname', '이름없음'),
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists trg_on_auth_user_created on auth.users;
create trigger trg_on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ---------------------------------------------------------------------
-- 2. projects: 기수(시즌) 단위 설정
-- ---------------------------------------------------------------------
create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,                          -- 예: "2026 이화정 TMI 3기"
  start_date date not null,
  end_date date not null,
  max_mission int not null default 5,          -- 한 유저가 진행 기간 동안 뽑을 수 있는 미션 수
  interval_seconds int not null default 345600, -- 미션 1개당 열려있는 시간 (4일 = 345600초)
  pass_cnt int not null default 1,             -- 미션패스 사용 가능 횟수
  use_category boolean not null default true,  -- 카테고리 기능 사용 여부
  is_public boolean not null default true,     -- 참여자에게 공개 여부
  is_closed boolean not null default false,    -- 마감 여부 (마감 시 신규 참여/뽑기 불가)
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_projects_updated_at
  before update on projects
  for each row execute function set_updated_at();

-- ---------------------------------------------------------------------
-- 3. project_members: 유저 <-> 기수 참여 + 패스 사용 현황
-- ---------------------------------------------------------------------
create table if not exists project_members (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects (id) on delete cascade,
  user_id uuid not null references profiles (id) on delete cascade,
  pass_used_cnt int not null default 0,        -- 지금까지 사용한 미션패스 횟수
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected')), -- 관리자 승인 상태
  approved_at timestamptz,
  joined_at timestamptz not null default now(),
  unique (project_id, user_id)
);

-- ---------------------------------------------------------------------
-- 4. mission_categories: 혼자 / 함께 / 이동 / 새로움 / 관찰
-- ---------------------------------------------------------------------
create table if not exists mission_categories (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,       -- 'alone' | 'together' | 'move' | 'new' | 'observe'
  label text not null,             -- '혼자' | '함께' | '이동' | '새로움' | '관찰'
  icon text,                       -- 아이콘 파일명/이모지 등
  sort_order int not null default 0
);

insert into mission_categories (code, label, sort_order) values
  ('alone', '혼자', 1),
  ('together', '함께', 2),
  ('move', '이동', 3),
  ('new', '새로움', 4),
  ('observe', '관찰', 5)
on conflict (code) do nothing;

-- ---------------------------------------------------------------------
-- 5. missions: 기수별 미션 풀 (기본 50개)
-- ---------------------------------------------------------------------
create table if not exists missions (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects (id) on delete cascade,
  category_id uuid references mission_categories (id),
  no int not null,                  -- 관리 편의를 위한 미션 번호 (Mission 1~50)
  title text not null,
  description text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (project_id, no)
);

create trigger trg_missions_updated_at
  before update on missions
  for each row execute function set_updated_at();

-- ---------------------------------------------------------------------
-- 6. user_mission_progress: 유저가 뽑은 미션 이력/현재 진행 상태
-- ---------------------------------------------------------------------
create table if not exists user_mission_progress (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects (id) on delete cascade,
  user_id uuid not null references profiles (id) on delete cascade,
  mission_id uuid not null references missions (id),
  status text not null default 'active',  -- 'active' | 'completed' | 'passed' | 'expired'
  assigned_at timestamptz not null default now(),
  expires_at timestamptz not null,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_ump_user_project on user_mission_progress (user_id, project_id);
create index if not exists idx_ump_status on user_mission_progress (status);

-- =====================================================================
-- 7. RPC: draw_mission - 랜덤 미션 뽑기
--    - 현재 활성(active) 미션이 있고 아직 만료 전이면 에러
--    - 기수 마감(is_closed) 이거나 참여 기간이 아니면 에러
--    - max_mission 개수를 이미 다 뽑았으면 에러
--    - 아직 뽑지 않은 미션 중 랜덤으로 1개 선택하여 배정
-- =====================================================================
create or replace function draw_mission(p_project_id uuid)
returns user_mission_progress
language plpgsql
security definer
as $$
declare
  v_user_id uuid := auth.uid();
  v_project projects;
  v_active_count int;
  v_drawn_count int;
  v_mission missions;
  v_result user_mission_progress;
begin
  if v_user_id is null then
    raise exception '로그인이 필요합니다.';
  end if;

  select * into v_project from projects where id = p_project_id;
  if v_project is null then
    raise exception '존재하지 않는 프로젝트입니다.';
  end if;
  if v_project.is_closed then
    raise exception '마감된 기수입니다.';
  end if;
  if now()::date < v_project.start_date or now()::date > v_project.end_date then
    raise exception '진행 기간이 아닙니다.';
  end if;

  -- 참여 승인 여부 확인 (join_project로 신청 후 admin이 승인해야 뽑기 가능)
  declare
    v_member project_members;
  begin
    select * into v_member from project_members
    where project_id = p_project_id and user_id = v_user_id;
    if v_member is null or v_member.status = 'pending' then
      raise exception '관리자 승인 후 미션을 뽑을 수 있습니다.';
    end if;
    if v_member.status = 'rejected' then
      raise exception '참여가 승인되지 않았습니다.';
    end if;
  end;

  -- 현재 활성 미션이 있는지 확인 (만료 안 됨)
  select count(*) into v_active_count
  from user_mission_progress
  where project_id = p_project_id and user_id = v_user_id
    and status = 'active' and expires_at > now();
  if v_active_count > 0 then
    raise exception '이미 진행 중인 미션이 있습니다.';
  end if;

  -- 지금까지 뽑은 총 개수 확인
  select count(*) into v_drawn_count
  from user_mission_progress
  where project_id = p_project_id and user_id = v_user_id;
  if v_drawn_count >= v_project.max_mission then
    raise exception '모든 미션을 완료했습니다.';
  end if;

  -- 만료된 active 미션들은 expired 처리
  update user_mission_progress
  set status = 'expired'
  where project_id = p_project_id and user_id = v_user_id
    and status = 'active' and expires_at <= now();

  -- 아직 뽑지 않은 미션 중 랜덤 선택
  select * into v_mission
  from missions
  where project_id = p_project_id and is_active = true
    and id not in (
      select mission_id from user_mission_progress
      where project_id = p_project_id and user_id = v_user_id
    )
  order by random()
  limit 1;

  if v_mission is null then
    raise exception '더 이상 뽑을 수 있는 미션이 없습니다.';
  end if;

  insert into user_mission_progress (project_id, user_id, mission_id, status, assigned_at, expires_at)
  values (p_project_id, v_user_id, v_mission.id, 'active', now(), now() + make_interval(secs => v_project.interval_seconds))
  returning * into v_result;

  return v_result;
end;
$$;

-- =====================================================================
-- 8. RPC: use_mission_pass - 미션패스 사용 (현재 미션 즉시 재추첨)
-- =====================================================================
create or replace function use_mission_pass(p_project_id uuid)
returns user_mission_progress
language plpgsql
security definer
as $$
declare
  v_user_id uuid := auth.uid();
  v_project projects;
  v_member project_members;
  v_current user_mission_progress;
  v_mission missions;
  v_result user_mission_progress;
begin
  if v_user_id is null then
    raise exception '로그인이 필요합니다.';
  end if;

  select * into v_project from projects where id = p_project_id;
  if v_project is null then
    raise exception '존재하지 않는 프로젝트입니다.';
  end if;

  select * into v_member from project_members
  where project_id = p_project_id and user_id = v_user_id;
  if v_member is null then
    raise exception '참여 중인 기수가 아닙니다.';
  end if;
  if v_member.pass_used_cnt >= v_project.pass_cnt then
    raise exception '미션패스를 모두 사용했습니다.';
  end if;

  select * into v_current from user_mission_progress
  where project_id = p_project_id and user_id = v_user_id
    and status = 'active' and expires_at > now()
  order by assigned_at desc limit 1;
  if v_current is null then
    raise exception '진행 중인 미션이 없습니다.';
  end if;

  -- 새 미션 랜덤 선택 (현재 미션 포함, 지금까지 뽑은 미션 제외)
  select * into v_mission
  from missions
  where project_id = p_project_id and is_active = true
    and id not in (
      select mission_id from user_mission_progress
      where project_id = p_project_id and user_id = v_user_id
        and status <> 'passed'
    )
  order by random()
  limit 1;

  if v_mission is null then
    raise exception '더 이상 뽑을 수 있는 미션이 없습니다.';
  end if;

  update user_mission_progress
  set status = 'passed'
  where id = v_current.id;

  update project_members
  set pass_used_cnt = pass_used_cnt + 1
  where id = v_member.id;

  insert into user_mission_progress (project_id, user_id, mission_id, status, assigned_at, expires_at)
  values (p_project_id, v_user_id, v_mission.id, 'active', now(), now() + make_interval(secs => v_project.interval_seconds))
  returning * into v_result;

  return v_result;
end;
$$;

-- =====================================================================
-- 8-1. RPC: draw_mission_in_category - 카테고리 지정 뽑기
--    홈에서 카테고리 타일 클릭 -> 카드 목록에서 카드 선택 -> 그 카테고리
--    안에서만 랜덤 배정 (미션선택 화면이 곧 뽑기 화면이 되는 흐름)
-- =====================================================================
create or replace function draw_mission_in_category(p_project_id uuid, p_category_code text)
returns user_mission_progress
language plpgsql
security definer
as $$
declare
  v_user_id uuid := auth.uid();
  v_project projects;
  v_member project_members;
  v_active_count int;
  v_drawn_count int;
  v_mission missions;
  v_result user_mission_progress;
begin
  if v_user_id is null then
    raise exception '로그인이 필요합니다.';
  end if;

  select * into v_project from projects where id = p_project_id;
  if v_project is null then
    raise exception '존재하지 않는 프로젝트입니다.';
  end if;
  if v_project.is_closed then
    raise exception '마감된 기수입니다.';
  end if;
  if now()::date < v_project.start_date or now()::date > v_project.end_date then
    raise exception '진행 기간이 아닙니다.';
  end if;

  select * into v_member from project_members
  where project_id = p_project_id and user_id = v_user_id;
  if v_member is null or v_member.status = 'pending' then
    raise exception '관리자 승인 후 미션을 뽑을 수 있습니다.';
  end if;
  if v_member.status = 'rejected' then
    raise exception '참여가 승인되지 않았습니다.';
  end if;

  select count(*) into v_active_count
  from user_mission_progress
  where project_id = p_project_id and user_id = v_user_id
    and status = 'active' and expires_at > now();
  if v_active_count > 0 then
    raise exception '이미 진행 중인 미션이 있습니다.';
  end if;

  select count(*) into v_drawn_count
  from user_mission_progress
  where project_id = p_project_id and user_id = v_user_id;
  if v_drawn_count >= v_project.max_mission then
    raise exception '모든 미션을 완료했습니다.';
  end if;

  update user_mission_progress
  set status = 'expired'
  where project_id = p_project_id and user_id = v_user_id
    and status = 'active' and expires_at <= now();

  select m.* into v_mission
  from missions m
  join mission_categories mc on mc.id = m.category_id
  where m.project_id = p_project_id and m.is_active = true
    and mc.code = p_category_code
    and m.id not in (
      select mission_id from user_mission_progress
      where project_id = p_project_id and user_id = v_user_id
    )
  order by random()
  limit 1;

  if v_mission is null then
    raise exception '이 카테고리에는 더 이상 뽑을 수 있는 미션이 없습니다.';
  end if;

  insert into user_mission_progress (project_id, user_id, mission_id, status, assigned_at, expires_at)
  values (p_project_id, v_user_id, v_mission.id, 'active', now(), now() + make_interval(secs => v_project.interval_seconds))
  returning * into v_result;

  return v_result;
end;
$$;

-- =====================================================================
-- 8-2. RPC: join_project / approve_member - 참가자 승인 플로우
--    - join_project: 유저가 기수에 "참여 신청"(pending 멤버십 생성)
--    - approve_member: admin이 신청자를 승인(approved)/거절(rejected)
--    - draw_mission* RPC들은 status='approved'인 참가자만 통과시킴
-- =====================================================================
create or replace function join_project(p_project_id uuid)
returns project_members
language plpgsql
security definer
as $$
declare
  v_user_id uuid := auth.uid();
  v_project projects;
  v_result project_members;
begin
  if v_user_id is null then
    raise exception '로그인이 필요합니다.';
  end if;

  select * into v_project from projects where id = p_project_id;
  if v_project is null then
    raise exception '존재하지 않는 프로젝트입니다.';
  end if;

  insert into project_members (project_id, user_id, status)
  values (p_project_id, v_user_id, 'pending')
  on conflict (project_id, user_id) do nothing;

  select * into v_result from project_members
  where project_id = p_project_id and user_id = v_user_id;

  return v_result;
end;
$$;

create or replace function approve_member(p_member_id uuid, p_status text)
returns project_members
language plpgsql
security definer
as $$
declare
  v_result project_members;
begin
  if not is_admin() then
    raise exception '권한이 없습니다.';
  end if;
  if p_status not in ('approved', 'rejected', 'pending') then
    raise exception '잘못된 상태값입니다.';
  end if;

  update project_members
  set status = p_status,
      approved_at = case when p_status = 'approved' then now() else approved_at end
  where id = p_member_id
  returning * into v_result;

  if v_result is null then
    raise exception '존재하지 않는 참가자입니다.';
  end if;

  return v_result;
end;
$$;

-- =====================================================================
-- 8-3. RPC: admin_add_member - 관리자가 참가자를 기수에 직접 추가
--    (참가자 관리 탭에서 사용. 유저는 로그인만으로 자동 등록되지 않음)
-- =====================================================================
create or replace function admin_add_member(p_project_id uuid, p_user_id uuid, p_status text default 'pending')
returns project_members
language plpgsql
security definer
as $$
declare
  v_result project_members;
begin
  if not is_admin() then
    raise exception '권한이 없습니다.';
  end if;
  if p_status not in ('pending', 'approved', 'rejected') then
    raise exception '잘못된 상태값입니다.';
  end if;

  insert into project_members (project_id, user_id, status, approved_at)
  values (p_project_id, p_user_id, p_status, case when p_status = 'approved' then now() else null end)
  on conflict (project_id, user_id) do update
    set status = excluded.status,
        approved_at = case when excluded.status = 'approved' then now() else project_members.approved_at end
  returning * into v_result;

  return v_result;
end;
$$;

-- =====================================================================
-- 9. RPC: complete_mission - 현재 미션 완료 처리
-- =====================================================================
create or replace function complete_mission(p_progress_id uuid)
returns user_mission_progress
language plpgsql
security definer
as $$
declare
  v_user_id uuid := auth.uid();
  v_result user_mission_progress;
begin
  update user_mission_progress
  set status = 'completed', completed_at = now()
  where id = p_progress_id and user_id = v_user_id and status = 'active'
  returning * into v_result;

  if v_result is null then
    raise exception '완료 처리할 수 없는 미션입니다.';
  end if;
  return v_result;
end;
$$;

-- =====================================================================
-- 10. Row Level Security
-- =====================================================================
alter table profiles enable row level security;
alter table projects enable row level security;
alter table project_members enable row level security;
alter table mission_categories enable row level security;
alter table missions enable row level security;
alter table user_mission_progress enable row level security;

-- 관리자 여부를 안전하게 확인하는 함수 (RLS 우회, 재귀 방지)
create or replace function is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select coalesce((select p.is_admin from profiles p where p.id = auth.uid()), false);
$$;

-- profiles: 본인 것만 읽기/수정, admin은 전체 읽기
create policy "profiles_select_own_or_admin" on profiles
  for select using (
    id = auth.uid() or is_admin()
  );
create policy "profiles_update_own" on profiles
  for update using (id = auth.uid());

-- projects: 공개된 것은 누구나 조회, admin은 전체 관리
create policy "projects_select_public_or_admin" on projects
  for select using (
    is_public = true or is_admin()
  );
create policy "projects_admin_all" on projects
  for all using (is_admin())
  with check (is_admin());

-- mission_categories: 전체 공개
create policy "categories_select_all" on mission_categories
  for select using (true);

-- missions: 로그인한 유저는 공개된 기수의 미션을 볼 수 있음 (앞면 잠금 카드 표시를 위해)
-- 실제 텍스트를 화면에 보여줄지는 프론트엔드에서 유저 본인이 뽑은 적 있는지로 다시 걸러줌
create policy "missions_select_member_or_admin" on missions
  for select using (
    exists (select 1 from projects p where p.id = missions.project_id and p.is_public = true)
    or exists (
      select 1 from project_members m
      where m.project_id = missions.project_id and m.user_id = auth.uid()
    )
    or is_admin()
  );
create policy "missions_admin_all" on missions
  for all using (is_admin())
  with check (is_admin());

-- project_members: 본인 것만 + admin
create policy "members_select_own_or_admin" on project_members
  for select using (
    user_id = auth.uid() or is_admin()
  );

-- user_mission_progress: 본인 것만 + admin
create policy "ump_select_own_or_admin" on user_mission_progress
  for select using (
    user_id = auth.uid() or is_admin()
  );

-- user_mission_progress: admin만 삭제 가능 (참여자 기록 초기화/오작 수정용)
create policy "ump_delete_admin" on user_mission_progress
  for delete using (is_admin());

-- project_members: admin만 참가자를 기수에서 완전히 제거 가능
create policy "members_delete_admin" on project_members
  for delete using (is_admin());

-- =====================================================================
-- 참고: 실제 뽑기/패스/완료 로직은 RPC(draw_mission/use_mission_pass/
-- complete_mission)를 통해서만 수행되며, 이 함수들은 security definer로
-- 실행되어 위 RLS 정책과 무관하게 검증 로직을 직접 수행합니다.
-- 클라이언트에서 user_mission_progress 테이블에 직접 insert/update 하는
-- 코드는 작성하지 마세요.
-- =====================================================================
