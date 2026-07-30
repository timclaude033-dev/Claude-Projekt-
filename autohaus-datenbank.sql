-- ═══════════════════════════════════════════════════════════════
--  AUTOHAUS LEAD-SYSTEM · Datenbank
--  Walter Workflows
--
--  Einmal pro Autohaus ausfuehren. Danach nie wieder anfassen.
--  Laeuft auf jedem PostgreSQL ab Version 12 — Supabase, Neon,
--  Railway oder eine eigene Instanz.
--
--  In Supabase:  SQL Editor  →  einfuegen  →  Run
-- ═══════════════════════════════════════════════════════════════


-- ───────────────────────────────────────────────────────────────
--  1 · Fahrzeugbestand
-- ───────────────────────────────────────────────────────────────
create table if not exists fahrzeuge (
  fahrzeug_id    text primary key,
  marke          text not null default '',
  modell         text not null default '',
  variante       text not null default '',
  erstzulassung  text not null default '',
  kilometer      integer,
  kraftstoff     text not null default '',
  getriebe       text not null default '',
  leistung       text not null default '',
  preis          numeric(10,2),
  farbe          text not null default '',
  ausstattung    text not null default '',
  status         text not null default 'verfuegbar',
  standort       text not null default '',
  angelegt       timestamptz not null default now(),
  aktualisiert   timestamptz not null default now()
);

comment on column fahrzeuge.status is
  'verfuegbar = wird angeboten · reserviert = wird angeboten mit Hinweis · verkauft = wird ignoriert';

create index if not exists fahrzeuge_status_idx on fahrzeuge (status);


-- ───────────────────────────────────────────────────────────────
--  2 · Leads
-- ───────────────────────────────────────────────────────────────
create table if not exists leads (
  lead_id            text primary key,
  eingang            timestamptz not null default now(),
  quelle             text not null default '',
  name               text not null default '',
  email              text not null default '',
  telefon            text not null default '',
  nachricht          text not null default '',

  -- von der KI erkannt
  fahrzeug           text not null default '',
  fahrzeug_id        text,
  kaufabsicht        text not null default 'unklar',
  inzahlungnahme     boolean not null default false,
  inzahlung_fahrzeug text not null default '',
  dringlichkeit      text not null default 'unklar',
  finanzierung       boolean not null default false,
  score              integer not null default 0,
  zusammenfassung    text not null default '',

  -- Zuordnung und Stand
  verkaeufer         text not null default '',
  verkaeufer_email   text not null default '',
  status             text not null default 'neu',
  sequenz            text not null default 'laeuft',

  -- Steuerung der Nachfass-Kette
  nachfass_stufe     integer not null default 0,
  letzter_kontakt    timestamptz,
  naechster_schritt  text not null default '',

  -- Probefahrt
  termin             timestamptz,
  termin_bestaetigt  boolean not null default false,
  erinnert_am        date,

  notiz              text not null default '',
  aktualisiert       timestamptz not null default now()
);

comment on column leads.status is
  'neu · kontaktiert · nachgefasst · termin · geantwortet · gewonnen · verloren · archiviert';
comment on column leads.sequenz is
  'laeuft = wird nachgefasst · gestoppt = keine automatische Mail mehr';
comment on column leads.nachfass_stufe is
  'Hoechste bereits versendete Nachfass-Stufe (0, 2, 5, 10). Verhindert Doppelversand.';

create index if not exists leads_email_idx    on leads (lower(email));
create index if not exists leads_status_idx   on leads (status);
create index if not exists leads_sequenz_idx  on leads (sequenz);
create index if not exists leads_eingang_idx  on leads (eingang desc);
create index if not exists leads_termin_idx   on leads (termin) where termin is not null;


-- ───────────────────────────────────────────────────────────────
--  3 · Verlauf — jeder Schritt wird protokolliert
-- ───────────────────────────────────────────────────────────────
create table if not exists verlauf (
  id        bigserial primary key,
  lead_id   text not null references leads (lead_id) on delete cascade,
  zeitpunkt timestamptz not null default now(),
  art       text not null,
  text      text not null default ''
);

comment on column verlauf.art is
  'anfrage · antwort · nachfass · termin · erinnerung · kundenantwort · archiv · notiz';

create index if not exists verlauf_lead_idx on verlauf (lead_id, zeitpunkt desc);


-- ───────────────────────────────────────────────────────────────
--  4 · aktualisiert-Zeitstempel automatisch pflegen
-- ───────────────────────────────────────────────────────────────
create or replace function setze_aktualisiert() returns trigger as $$
begin
  new.aktualisiert = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists leads_aktualisiert on leads;
create trigger leads_aktualisiert before update on leads
  for each row execute function setze_aktualisiert();

drop trigger if exists fahrzeuge_aktualisiert on fahrzeuge;
create trigger fahrzeuge_aktualisiert before update on fahrzeuge
  for each row execute function setze_aktualisiert();


-- ───────────────────────────────────────────────────────────────
--  5 · Kennzahlen fuer das Dashboard
-- ───────────────────────────────────────────────────────────────
create or replace view kennzahlen as
select
  (select count(*) from leads where eingang > now() - interval '24 hours')        as neu_24h,
  (select count(*) from leads where eingang > now() - interval '7 days')          as neu_7t,
  (select count(*) from leads where eingang > now() - interval '30 days')         as neu_30t,
  (select count(*) from leads
     where status in ('neu','kontaktiert','nachgefasst'))                          as offen,
  (select count(*) from leads
     where termin_bestaetigt and termin > now())                                   as termine,
  (select count(*) from leads where status = 'geantwortet')                        as antworten,
  (select count(*) from leads where status = 'gewonnen')                           as gewonnen,
  (select count(*) from leads
     where status in ('neu','kontaktiert','nachgefasst') and score >= 70)          as heiss,
  (select count(*) from fahrzeuge where status <> 'verkauft')                      as bestand,
  (select coalesce(round(avg(score)), 0) from leads
     where eingang > now() - interval '30 days')                                   as score_schnitt;


-- ───────────────────────────────────────────────────────────────
--  6 · Beispieldaten (loeschen, sobald der Bestand steht)
-- ───────────────────────────────────────────────────────────────
insert into fahrzeuge
  (fahrzeug_id, marke, modell, variante, erstzulassung, kilometer,
   kraftstoff, getriebe, leistung, preis, farbe, ausstattung, status, standort)
values
  ('F-101','BMW','320d','Touring M Sport','2021-04',48000,'Diesel','Automatik',
   '190 PS',29900,'Alpinweiss','Navi, LED, AHK, Sitzheizung','verfuegbar','Hauptbetrieb'),
  ('F-102','VW','Golf 8','Life','2022-01',22000,'Benzin','Schaltgetriebe',
   '130 PS',23900,'Grau','ACC, Klimaautomatik, PDC','verfuegbar','Filiale Nord')
on conflict (fahrzeug_id) do nothing;


-- ───────────────────────────────────────────────────────────────
--  Fertig. Zur Kontrolle:
-- ───────────────────────────────────────────────────────────────
select 'Tabellen angelegt' as ergebnis,
       (select count(*) from fahrzeuge) as fahrzeuge,
       (select count(*) from leads)     as leads;
