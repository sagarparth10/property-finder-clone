-- Login-based AI Concierge chat history
-- Apply: paste into Supabase SQL editor, or run against the linked project.

create table if not exists chat_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  title text not null default 'New chat',
  language text not null default 'en',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists chat_messages (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references chat_sessions(id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamptz not null default now()
);

create index if not exists chat_sessions_user_updated_idx on chat_sessions (user_id, updated_at desc);
create index if not exists chat_messages_session_created_idx on chat_messages (session_id, created_at asc);

alter table chat_sessions enable row level security;
alter table chat_messages enable row level security;
