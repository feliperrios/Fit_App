-- FitApp Schema
-- Execute no SQL Editor do Supabase

create table if not exists profiles (
  id uuid primary key default gen_random_uuid(),
  nome text not null, email text unique not null,
  admin boolean not null default false,
  status text not null default 'active' check (status in ('active','blocked')),
  teste boolean not null default false, expira date,
  coach_nutri boolean not null default false, coach_trainer boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists peso_historico (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  data date not null, peso numeric(5,2) not null,
  created_at timestamptz not null default now()
);

create table if not exists dados_corporais (
  user_id uuid primary key references profiles(id) on delete cascade,
  idade text, sexo text, altura text
);

create table if not exists exercicios_biblioteca (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  nome text not null, grupo_muscular text not null,
  series_padrao int, reps_min int, reps_max int,
  descanso_padrao int not null default 60,
  created_at timestamptz not null default now()
);

create table if not exists exercicio_midia (
  id uuid primary key default gen_random_uuid(),
  exercicio_id uuid not null references exercicios_biblioteca(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  tipo text not null check (tipo in ('foto','video')), url text not null,
  created_at timestamptz not null default now()
);

create table if not exists treinos (
  id text not null, user_id uuid not null references profiles(id) on delete cascade,
  nome text not null default '', observacao text not null default '',
  primary key (user_id, id)
);

create table if not exists treino_exercicios (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  treino_grupo text not null,
  exercicio_biblioteca_id uuid references exercicios_biblioteca(id) on delete set null,
  nome text not null, grupo_muscular text not null,
  series_padrao int, reps_min int, reps_max int,
  descanso_padrao int not null default 60, ordem int not null default 0,
  foreign key (user_id, treino_grupo) references treinos(user_id, id) on delete cascade
);

create table if not exists series_registradas (
  id uuid primary key default gen_random_uuid(),
  treino_exercicio_id uuid not null references treino_exercicios(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  series int not null, reps int not null, carga numeric(6,2) not null,
  descanso int not null default 0, data date not null,
  created_at timestamptz not null default now()
);

create table if not exists dia_treino_map (
  user_id uuid not null references profiles(id) on delete cascade,
  dia text not null check (dia in ('seg','ter','qua','qui','sex','sab','dom')),
  treino_grupo text,
  primary key (user_id, dia)
);

create table if not exists treinos_concluidos (
  user_id uuid not null references profiles(id) on delete cascade,
  chave text not null, concluido boolean not null default true,
  primary key (user_id, chave)
);

create table if not exists refeicoes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  nome text not null, concluida boolean not null default false,
  ordem int not null default 0, created_at timestamptz not null default now()
);

create table if not exists refeicao_alimentos (
  id uuid primary key default gen_random_uuid(),
  refeicao_id uuid not null references refeicoes(id) on delete cascade,
  nome_taco text not null, gramas numeric(7,2) not null,
  fator_coccao numeric(5,3) not null default 1, medida_label text not null,
  kcal numeric(7,2) not null, proteina numeric(7,2) not null,
  carboidrato numeric(7,2) not null, gordura numeric(7,2) not null,
  ordem int not null default 0
);

create table if not exists dieta_obs (
  user_id uuid primary key references profiles(id) on delete cascade,
  obs text not null default ''
);
