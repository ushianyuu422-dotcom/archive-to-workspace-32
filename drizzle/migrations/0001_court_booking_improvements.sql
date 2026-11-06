create or replace function public.court_availability(p_from date, p_to date)
returns table (d date, slot text, status text)
language sql stable security definer set search_path = public as $$
  select x.d::date, s.slot,
    case
      when exists (select 1 from public.court_blocks b where b.block_date = x.d::date and (b.slot = s.slot or b.slot is null)) then 'blocked'
      when exists (select 1 from public.court_reservations r where r.res_date = x.d::date and r.slot = s.slot and r.status = 'approved' and r.user_id = auth.uid()) then 'mine'
      when exists (select 1 from public.court_reservations r where r.res_date = x.d::date and r.slot = s.slot and r.status = 'pending' and r.user_id = auth.uid()) then 'mine'
      when exists (select 1 from public.court_reservations r where r.res_date = x.d::date and r.slot = s.slot and r.status = 'approved') then 'taken'
      when exists (select 1 from public.court_reservations r where r.res_date = x.d::date and r.slot = s.slot and r.status = 'pending') then 'pending'
      else 'open'
    end
  from generate_series(p_from, least(p_to, p_from + 62), interval '1 day') as x(d)
  cross join (values ('06:00'),('08:00'),('10:00'),('13:00'),('15:00'),('18:00')) as s(slot)
$$;
grant execute on function public.court_availability(date, date) to anon, authenticated;

create policy "Reservations: admin insert" on public.court_reservations for insert to authenticated
  with check (public.is_admin());
create policy "Reservations: delete own history" on public.court_reservations for delete to authenticated
  using (auth.uid() = user_id and status in ('cancelled','rejected','completed'));