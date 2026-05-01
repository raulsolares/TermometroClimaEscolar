-- Initial Schema for Termómetro de Clima Escolar

-- 1. Table for children profiles
create table if not exists public.children (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  name text not null,
  age int,
  group_name text,
  created_at timestamp with time zone default now()
);

-- 2. Table for daily responses
create table if not exists public.responses (
  id uuid default gen_random_uuid() primary key,
  child_id uuid references public.children on delete cascade not null,
  date date default current_date,
  mood int check (mood in (1, 2, 3)), -- 1: Mal, 2: Neutral, 3: Bien
  played boolean not null,
  bullied boolean not null,
  event_type text,
  notes text,
  created_at timestamp with time zone default now(),
  -- Prevent multiple responses for the same child on the same day
  unique(child_id, date)
);

-- 3. Enable RLS
alter table public.children enable row level security;
alter table public.responses enable row level security;

-- 4. Policies for children
create policy "Users can view their own children" 
  on public.children for select 
  using (auth.uid() = user_id);

create policy "Users can insert their own children" 
  on public.children for insert 
  with check (auth.uid() = user_id);

create policy "Users can update their own children" 
  on public.children for update 
  using (auth.uid() = user_id);

create policy "Users can delete their own children" 
  on public.children for delete 
  using (auth.uid() = user_id);

-- 5. Policies for responses
create policy "Users can view responses of their children" 
  on public.responses for select 
  using (
    exists (
      select 1 from public.children 
      where id = public.responses.child_id and user_id = auth.uid()
    )
  );

create policy "Users can insert responses for their children" 
  on public.responses for insert 
  with check (
    exists (
      select 1 from public.children 
      where id = child_id and user_id = auth.uid()
    )
  );
