# Barangay Wawa United — Professor-evaluation upgrade

Brief: keep green/gold theme + structure; real backend (no mock data); roles Admin / Resident (incl. Senior & PWD).

1. [ ] Database: profiles (normalized name+address), user_roles, service requests, court reservations + blocks, announcements, benefit releases, problem reports, notifications, services, settings, feature flags — RLS + grants + seed
2. [ ] Auth: email auth enabled; Google + Sign in with Lovable; signup collects Senior/PWD enrollment + document upload; profiles pending admin approval
3. [ ] Admin panel: accounts CRUD (approve/reject/deactivate/create/delete), queue (Active|Finished tabs, Rejected with reason), court (approve/reject/reschedule/block, no double booking), news CRUD, settings (fees/hours/service names), feature toggles, releases, problems
4. [ ] Resident: request submission with validation, my requests/cancel, court booking, my problems/reports, my releases, profile edit
5. [ ] Notifications: bell + unread count, notifications page, mark as read; notify on approvals/status changes/announcements
6. [ ] PDF reports (client-side jsPDF): queue, reservations, residents, releases, problems — date range + status filters, header/totals
7. [ ] Wire public pages to DB (home, services, announcements, court schedule) + "Temporarily unavailable" toggles
8. [ ] Design polish pass (spacing, buttons, forms, tables, mobile)
9. [ ] Tests for rules that matter (double-booking prevention, roles) + end-to-end verify in preview
