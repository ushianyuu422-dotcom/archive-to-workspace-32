create type public.app_role as enum ('admin','resident');
create type public.account_status as enum ('pending','approved','rejected','suspended');
create type public.request_status as enum ('pending','in_queue','processing','completed','rejected','cancelled');
create type public.reservation_status as enum ('pending','approved','rejected','cancelled','completed');
create type public.release_status as enum ('pending','approved','ready_for_release','released');
create type public.problem_status as enum ('submitted','under_review','in_progress','resolved','rejected');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role public.app_role not null,
  unique (user_id, role)
);

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select public.has_role(auth.uid(), 'admin')
$$;

create or replace function public.set_updated_at() returns trigger language plpgsql set search_path = public as $$
begin new.updated_at = now(); return new; end $$;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  first_name text not null default '',
  middle_name text not null default '',
  last_name text not null default '',
  birthdate date,
  sex text check (sex in ('male','female')),
  street text not null default '',
  purok text not null default '',
  barangay text not null default 'Wawa',
  contact_number text not null default '',
  status public.account_status not null default 'pending',
  rejection_reason text,
  is_senior boolean not null default false,
  is_pwd boolean not null default false,
  senior_id_number text,
  pwd_id_number text,
  pwd_disability_type text,
  document_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.profiles_protect_status() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if not public.has_role(auth.uid(), 'admin') then
    new.status := old.status;
    new.rejection_reason := old.rejection_reason;
  end if;
  return new;
end $$;
create trigger profiles_protect before update on public.profiles
  for each row execute function public.profiles_protect_status();

create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, first_name, last_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'first_name',''),
    coalesce(new.raw_user_meta_data->>'last_name','')
  );
  insert into public.user_roles (user_id, role)
  select new.id, case when not exists (select 1 from public.user_roles where role = 'admin')
    then 'admin'::public.app_role else 'resident'::public.app_role end;
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

create table public.site_settings (
  id int primary key default 1 check (id = 1),
  hall_address text not null default 'Barangay Hall, Wawa, Taguig City',
  office_hours text not null default 'Monday to Friday, 8:00 AM – 5:00 PM',
  office_email text not null default 'wawa.barangay@taguig.example.ph',
  office_phone text not null default '',
  facebook_url text not null default '',
  court_fee numeric(10,2) not null default 0,
  updated_at timestamptz not null default now()
);
create table public.services (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  description text not null default '',
  requirements jsonb not null default '[]'::jsonb,
  fee numeric(10,2) not null default 0,
  enabled boolean not null default true,
  sort int not null default 0
);
create table public.feature_flags (
  key text primary key,
  label text not null,
  enabled boolean not null default true,
  sort int not null default 0
);

create table public.service_requests (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  user_id uuid not null references public.profiles(id) on delete cascade,
  service_id uuid not null references public.services(id),
  first_name text not null,
  middle_name text not null default '',
  last_name text not null,
  street text not null,
  purok text not null,
  barangay text not null,
  contact_number text not null,
  details text not null default '',
  status public.request_status not null default 'pending',
  rejection_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index service_requests_user_idx on public.service_requests(user_id, created_at desc);
create index service_requests_status_idx on public.service_requests(status, created_at desc);

create table public.court_reservations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  res_date date not null,
  slot text not null,
  purpose text not null,
  contact_number text not null,
  status public.reservation_status not null default 'pending',
  rejection_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index court_res_active_slot_uq on public.court_reservations (res_date, slot)
  where status in ('pending','approved');
create table public.court_blocks (
  id uuid primary key default gen_random_uuid(),
  block_date date not null,
  slot text,
  reason text not null default 'Barangay activity',
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);
create unique index court_blocks_uq on public.court_blocks (block_date, coalesce(slot,''));

create table public.announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  category text not null default 'Notices',
  image_path text,
  published boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.benefit_releases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  kind text not null check (kind in ('senior','pwd')),
  description text not null default '',
  status public.release_status not null default 'pending',
  date_released date,
  released_by text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.problem_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  category text not null,
  description text not null,
  street text not null default '',
  purok text not null default '',
  barangay text not null default 'Wawa',
  photo_path text,
  status public.problem_status not null default 'submitted',
  admin_reply text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  body text not null default '',
  link text,
  read boolean not null default false,
  created_at timestamptz not null default now()
);
create index notifications_user_idx on public.notifications(user_id, created_at desc);

do $$
declare t text;
begin
  foreach t in array array['profiles','site_settings','service_requests','court_reservations','announcements','benefit_releases','problem_reports'] loop
    execute format('create trigger %I_set_updated before update on public.%I for each row execute function public.set_updated_at()', t, t);
  end loop;
end $$;

grant select, update on public.profiles to authenticated;
grant select on public.user_roles to authenticated;
grant select on public.site_settings to anon, authenticated;
grant update on public.site_settings to authenticated;
grant select on public.services to anon, authenticated;
grant update, insert, delete on public.services to authenticated;
grant select on public.feature_flags to anon, authenticated;
grant update on public.feature_flags to authenticated;
grant select, insert, update, delete on public.service_requests to authenticated;
grant select, insert, update, delete on public.court_reservations to authenticated;
grant select, insert, update, delete on public.court_blocks to authenticated;
grant select on public.announcements to anon, authenticated;
grant select, insert, update, delete on public.announcements to authenticated;
grant select, insert, update, delete on public.benefit_releases to authenticated;
grant select, insert, update, delete on public.problem_reports to authenticated;
grant select, insert, update on public.notifications to authenticated;
grant all on all tables in schema public to service_role;

alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.site_settings enable row level security;
alter table public.services enable row level security;
alter table public.feature_flags enable row level security;
alter table public.service_requests enable row level security;
alter table public.court_reservations enable row level security;
alter table public.court_blocks enable row level security;
alter table public.announcements enable row level security;
alter table public.benefit_releases enable row level security;
alter table public.problem_reports enable row level security;
alter table public.notifications enable row level security;

create policy "Profiles: read own or admin" on public.profiles for select to authenticated
  using (auth.uid() = id or public.is_admin());
create policy "Profiles: update own or admin" on public.profiles for update to authenticated
  using (auth.uid() = id or public.is_admin()) with check (auth.uid() = id or public.is_admin());
create policy "User roles: read own or admin" on public.user_roles for select to authenticated
  using (auth.uid() = user_id or public.is_admin());
create policy "Settings: public read" on public.site_settings for select to anon, authenticated using (true);
create policy "Settings: admin update" on public.site_settings for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Services: public read" on public.services for select to anon, authenticated using (true);
create policy "Services: admin write" on public.services for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Flags: public read" on public.feature_flags for select to anon, authenticated using (true);
create policy "Flags: admin update" on public.feature_flags for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Requests: insert own" on public.service_requests for insert to authenticated with check (auth.uid() = user_id);
create policy "Requests: read own or admin" on public.service_requests for select to authenticated using (auth.uid() = user_id or public.is_admin());
create policy "Requests: update own (pending) or admin" on public.service_requests for update to authenticated
  using ((auth.uid() = user_id and status = 'pending') or public.is_admin())
  with check ((auth.uid() = user_id and status in ('pending','cancelled')) or public.is_admin());
create policy "Requests: admin delete" on public.service_requests for delete to authenticated using (public.is_admin());
create policy "Reservations: insert own" on public.court_reservations for insert to authenticated
  with check (auth.uid() = user_id and res_date >= current_date);
create policy "Reservations: read own or admin" on public.court_reservations for select to authenticated using (auth.uid() = user_id or public.is_admin());
create policy "Reservations: update own (pending) or admin" on public.court_reservations for update to authenticated
  using ((auth.uid() = user_id and status = 'pending') or public.is_admin())
  with check ((auth.uid() = user_id and status in ('pending','cancelled')) or public.is_admin());
create policy "Reservations: admin delete" on public.court_reservations for delete to authenticated using (public.is_admin());
create policy "Blocks: authenticated read" on public.court_blocks for select to authenticated using (true);
create policy "Blocks: admin write" on public.court_blocks for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Announcements: public read published" on public.announcements for select to anon, authenticated
  using (published = true or public.is_admin());
create policy "Announcements: admin write" on public.announcements for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Releases: read own or admin" on public.benefit_releases for select to authenticated using (auth.uid() = user_id or public.is_admin());
create policy "Releases: admin write" on public.benefit_releases for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Problems: insert own" on public.problem_reports for insert to authenticated with check (auth.uid() = user_id);
create policy "Problems: read own or admin" on public.problem_reports for select to authenticated using (auth.uid() = user_id or public.is_admin());
create policy "Problems: admin update" on public.problem_reports for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Problems: admin delete" on public.problem_reports for delete to authenticated using (public.is_admin());
create policy "Notifications: read own" on public.notifications for select to authenticated using (auth.uid() = user_id);
create policy "Notifications: update own" on public.notifications for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Notifications: admin insert" on public.notifications for insert to authenticated with check (public.is_admin());

create policy "Uploads: own folder insert" on storage.objects for insert to authenticated
  with check (bucket_id = 'uploads' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "Uploads: own folder or admin read" on storage.objects for select to authenticated
  using (bucket_id = 'uploads' and ((storage.foldername(name))[1] = auth.uid()::text or public.has_role(auth.uid(), 'admin')));
create policy "Uploads: own folder update" on storage.objects for update to authenticated
  using (bucket_id = 'uploads' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'uploads' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "Uploads: own folder delete" on storage.objects for delete to authenticated
  using (bucket_id = 'uploads' and (storage.foldername(name))[1] = auth.uid()::text);

insert into public.site_settings (id) values (1) on conflict do nothing;
insert into public.feature_flags (key, label, sort) values
  ('queueing','Service requests (queueing)',1),
  ('court_booking','Court reservation',2),
  ('pwd_services','PWD & Senior services',3),
  ('news','News & announcements',4),
  ('problems','Problem reports',5)
  on conflict (key) do nothing;
insert into public.services (code, name, description, requirements, fee, sort) values
  ('CLR','Barangay Clearance','Proof of good standing and residency — commonly needed for jobs, school, and permits.','["Valid ID","Community Tax Certificate (cedula)"]'::jsonb,50,1),
  ('IND','Barangay Indigency Certificate','Certifies financial hardship for medical, scholarship, or legal aid applications.','["Valid ID","Proof of residence"]'::jsonb,0,2),
  ('BIZ','Barangay Business Clearance','Required before applying for a business permit with Taguig City.','["Valid ID","Proof of business address","Cedula"]'::jsonb,100,3),
  ('CED','Community Tax Certificate (Cedula)','Issued for individuals and businesses, required for many city transactions.','["Valid ID"]'::jsonb,30,4),
  ('PID','Barangay ID','Photo ID for residents of Wawa, accepted for local transactions.','["Valid ID","Proof of residency","1x1 photo"]'::jsonb,30,5),
  ('JOB','First-Time Jobseeker Voucher','Free barangay clearance and cedula for first-time job seekers under RA 11261.','["Valid ID","Barangay residency"]'::jsonb,0,6),
  ('CPB','Complaint / Incident Report','File a blotter or report a concern for the barangay to act on.','["Valid ID","Details of the incident"]'::jsonb,0,7)
  on conflict (code) do nothing;
insert into public.announcements (title, body, category, published, published_at) values
  ('Welcome to the new Barangay Wawa website','This site brings our services online: request barangay documents, track your requests, find PWD guides, and reserve the multi-purpose court. Create your resident account to get started.','Notices',true,now()),
  ('Senior citizens and PWDs: register online','Senior and PWD residents can now register through the website with their ID numbers and supporting documents. Approved members can follow their benefit releases here.','Health',true,now());

create or replace function public.court_slot_status(p_date date, p_slot text)
returns text
language sql
stable
security definer
set search_path = public
as $$
  select case
    when exists (
      select 1 from public.court_blocks b
      where b.block_date = p_date and (b.slot = p_slot or b.slot is null)
    ) then 'blocked'
    when exists (
      select 1 from public.court_reservations r
      where r.res_date = p_date and r.slot = p_slot and r.status in ('pending','approved')
    ) then
      case when exists (
        select 1 from public.court_reservations r2
        where r2.res_date = p_date and r2.slot = p_slot
          and r2.status in ('pending','approved') and r2.user_id = auth.uid()
      ) then 'mine' else 'taken' end
    else 'open'
  end
$$;

grant execute on function public.court_slot_status(date, text) to authenticated;