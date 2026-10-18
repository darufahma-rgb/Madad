-- Corong promosi Arena Imtihan: izinkan event 'arena' (detail play | share | cta) di funnel_events.
-- Jalankan sekali di Supabase SQL Editor. Aman dijalankan ulang. Sebelum dijalankan, event 'arena' ditolak tanpa
-- mengganggu apa pun (pencatatan funnel memang diam kalau gagal).
alter table public.funnel_events drop constraint if exists funnel_events_event_check;
alter table public.funnel_events
  add constraint funnel_events_event_check
  check (event in ('visit', 'view_gabung', 'view_join', 'view_ai_partner', 'paywall', 'click_pay', 'arena'));
