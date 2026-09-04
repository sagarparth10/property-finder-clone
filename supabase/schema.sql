-- Property Nexus MVP tables for Supabase Postgres.
-- Apply in the SQL editor, or: supabase db query --linked -f supabase/schema.sql

create extension if not exists pgcrypto;

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  password text not null,
  name text not null,
  role text not null default 'user',
  phone text,
  territory text default 'Dubai',
  avatar text,
  preferences jsonb,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists properties (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  type text not null,
  price numeric not null,
  location text not null,
  latitude double precision not null default 25.2048,
  longitude double precision not null default 55.2708,
  bedrooms integer not null default 0,
  bathrooms integer not null default 0,
  area numeric not null default 0,
  furnished boolean not null default false,
  verified boolean not null default false,
  images text[] not null default '{}',
  amenities text[] not null default '{}',
  agent_id text not null,
  developer text,
  availability text not null default 'available',
  active boolean not null default true,
  floor_plan jsonb,
  agent jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  company text not null default '',
  first_name text not null,
  last_name text not null default '',
  title text not null default 'Buyer',
  email text not null,
  phone text not null default '',
  territory text not null default 'Dubai',
  region text not null default 'UAE',
  country text not null default 'AE',
  source text not null default 'portal',
  status text not null default 'new',
  estimated_amount numeric not null default 0,
  intent text not null default '',
  location_preference text not null default '',
  bedrooms integer not null default 0,
  property_id text,
  suggested_property_ids text[] not null default '{}',
  notes text,
  owner_user_id text not null default 'unassigned',
  claimed_at timestamptz,
  last_contacted_at timestamptz,
  transferred_from_user_id text,
  converted_opportunity_id text,
  converted_at timestamptz,
  buyer_user_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists opportunities (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  lead_id text,
  property_id text,
  stage text not null default 'discovery',
  amount numeric not null default 0,
  currency text not null default 'AED',
  probability integer not null default 10,
  owner_user_id text not null,
  source text not null default 'inquiry',
  next_step text not null default 'Qualify budget and viewing',
  contact_name text,
  contact_email text,
  lost_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists suggestions (
  id uuid primary key default gen_random_uuid(),
  property_id text not null,
  lead_id text not null,
  agent_id text not null,
  score numeric not null,
  reasons text[] not null default '{}',
  status text not null default 'new',
  kind text not null default 'listing_match',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (property_id, lead_id)
);

create index if not exists properties_active_idx on properties (active, created_at desc);
create index if not exists leads_owner_status_idx on leads (owner_user_id, status);
create index if not exists suggestions_agent_status_idx on suggestions (agent_id, status);

alter table users enable row level security;
alter table properties enable row level security;
alter table leads enable row level security;
alter table opportunities enable row level security;
alter table suggestions enable row level security;
