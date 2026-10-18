-- Esquema de destino: no conectado al prototipo SQLite, no aplicado todavía.
-- Ejecutar en proyecto Supabase de desarrollo vacío tras revisión.
create extension if not exists btree_gist;
create schema if not exists app_private;
revoke all on schema app_private from public;

create table public.profiles (
 id uuid primary key references auth.users(id),
 display_name text not null,
 created_at timestamptz not null default now()
);
create table public.roles(id text primary key, description text not null);
create table public.permissions(id text primary key);
create table public.role_permissions(
 role_id text references public.roles(id),permission_id text references public.permissions(id),
 primary key(role_id,permission_id)
);
create table public.user_roles(
 user_id uuid references public.profiles(id),role_id text references public.roles(id),
 primary key(user_id,role_id)
);
insert into public.roles values
 ('student','Estudiante'),('doctor','Médico'),('psychologist','Psicólogo'),
 ('nurse','Enfermero'),('nutritionist','Nutricionista'),('dentist','Odontólogo'),
 ('social_worker','Trabajador social'),('dining','Personal de comedor'),
 ('gym','Encargado de gimnasio'),('sport_coordinator','Coordinador deportivo'),
 ('culture_coordinator','Coordinador cultural'),('wellness_coordinator','Responsable de bienestar'),
 ('quality','Responsable de calidad'),('technical','Administrador técnico');
insert into public.permissions values ('booking.create'),('quality.manage'),('dining.operate'),('gym.operate');
insert into public.role_permissions values
 ('student','booking.create'),('quality','quality.manage'),('dining','dining.operate'),('gym','gym.operate');

create function app_private.has_permission(wanted text) returns boolean
language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.user_roles ur join public.role_permissions rp on rp.role_id=ur.role_id
 where ur.user_id=auth.uid() and rp.permission_id=wanted);
$$;
revoke all on function app_private.has_permission(text) from public;
grant usage on schema app_private to authenticated;
grant execute on function app_private.has_permission(text) to authenticated;

create table public.services(
 id uuid primary key default gen_random_uuid(),name text not null,
 domain text not null check(domain in ('medical','psychology','campaign','dining','gym','activity','social'))
);
create table public.service_staff(
 service_id uuid references public.services(id),user_id uuid references public.profiles(id),
 primary key(service_id,user_id)
);
create table public.service_schedules(
 id uuid primary key default gen_random_uuid(),service_id uuid not null references public.services(id),
 staff_id uuid references public.profiles(id),starts_at timestamptz not null,ends_at timestamptz not null,
 capacity integer not null check(capacity>0),check(ends_at>starts_at),
 exclude using gist(staff_id with =,tstzrange(starts_at,ends_at,'[)') with &&) where(staff_id is not null)
);
create table public.appointments(
 id uuid primary key default gen_random_uuid(),schedule_id uuid not null references public.service_schedules(id),
 user_id uuid not null references public.profiles(id),request_id uuid not null unique,
 status text not null default 'CONFIRMADA' check(status in ('CONFIRMADA','EN_ESPERA','EN_ATENCION','FINALIZADA','CANCELADA','NO_ASISTIO','CONSUMIDA')),
 created_at timestamptz not null default now()
);
create unique index appointments_unique_active on public.appointments(schedule_id,user_id)
 where status not in ('CANCELADA','NO_ASISTIO');
create index appointments_user on public.appointments(user_id,created_at);
create index appointments_schedule on public.appointments(schedule_id,status);
create table public.appointment_status_history(
 id bigint generated always as identity primary key,appointment_id uuid not null references public.appointments(id),
 actor_id uuid references public.profiles(id),status text not null,created_at timestamptz not null default now()
);
create table public.audit_logs(
 id bigint generated always as identity primary key,actor_id uuid references public.profiles(id),
 action text not null,resource_id uuid not null,created_at timestamptz not null default now()
);
create table public.corrective_actions(
 id uuid primary key default gen_random_uuid(),title text not null,description text not null,
 owner_id uuid references public.profiles(id),due date not null,
 status text not null check(status in ('EN_CURSO','EN_VERIFICACION','CERRADA')),
 execution_evidence text,efficacy_evidence text,
 check(status<>'CERRADA' or (coalesce(length(execution_evidence),0)>=10 and coalesce(length(efficacy_evidence),0)>=10))
);

-- Ninguna tabla clínica se crea ni se expone en esta migración.
alter table public.profiles enable row level security;
alter table public.roles enable row level security;
alter table public.permissions enable row level security;
alter table public.role_permissions enable row level security;
alter table public.user_roles enable row level security;
alter table public.services enable row level security;
alter table public.service_staff enable row level security;
alter table public.service_schedules enable row level security;
alter table public.appointments enable row level security;
alter table public.appointment_status_history enable row level security;
alter table public.audit_logs enable row level security;
alter table public.corrective_actions enable row level security;
create policy profile_self on public.profiles for select to authenticated using(id=auth.uid());
create policy roles_read on public.roles for select to authenticated using(true);
create policy permissions_read on public.permissions for select to authenticated using(true);
create policy role_permissions_read on public.role_permissions for select to authenticated using(true);
create policy own_roles on public.user_roles for select to authenticated using(user_id=auth.uid());
create policy services_read on public.services for select to authenticated using(true);
create policy staff_self on public.service_staff for select to authenticated using(user_id=auth.uid());
create policy schedules_read on public.service_schedules for select to authenticated using(true);
create policy appointments_self on public.appointments for select to authenticated using(user_id=auth.uid());
create policy history_self on public.appointment_status_history for select to authenticated
 using(exists(select 1 from public.appointments a where a.id=appointment_id and a.user_id=auth.uid()));
create policy quality_read on public.corrective_actions for select to authenticated using(app_private.has_permission('quality.manage'));
-- Sin políticas de escritura directa: mutaciones a través de RPCs revisadas.
-- Reservar: bloqueo de usuario para impedir carreras entre horarios, después bloqueo de franja para cupos.
create function public.reserve_schedule(wanted_schedule uuid,idempotency_key uuid) returns uuid
language plpgsql security definer set search_path='' as $$
declare target public.service_schedules;existing public.appointments;result_id uuid;used integer;
begin
 if auth.uid() is null or not app_private.has_permission('booking.create') then raise exception 'No autorizado';end if;
 perform 1 from public.profiles where id=auth.uid() for update;
 select * into existing from public.appointments where request_id=idempotency_key;
 if found then
  if existing.user_id<>auth.uid() or existing.schedule_id<>wanted_schedule then raise exception 'Clave no autorizada';end if;
  return existing.id;
 end if;
 select * into target from public.service_schedules where id=wanted_schedule for update;
 if not found or target.starts_at<=now() then raise exception 'Horario no disponible';end if;
 select count(*) into used from public.appointments where schedule_id=target.id and status not in ('CANCELADA','NO_ASISTIO');
 if used>=target.capacity then raise exception 'Sin cupos';end if;
 if exists(select 1 from public.appointments a join public.service_schedules s on s.id=a.schedule_id
  where a.user_id=auth.uid() and a.status not in ('CANCELADA','NO_ASISTIO')
  and tstzrange(s.starts_at,s.ends_at,'[)') && tstzrange(target.starts_at,target.ends_at,'[)')) then raise exception 'Conflicto de horario';end if;
 insert into public.appointments(schedule_id,user_id,request_id) values(target.id,auth.uid(),idempotency_key) returning id into result_id;
 insert into public.appointment_status_history(appointment_id,actor_id,status) values(result_id,auth.uid(),'CONFIRMADA');
 insert into public.audit_logs(actor_id,action,resource_id) values(auth.uid(),'reserve',result_id);
 return result_id;
end;
$$;
revoke all on function public.reserve_schedule(uuid,uuid) from public;
grant execute on function public.reserve_schedule(uuid,uuid) to authenticated;
-- Pendiente: RPCs de cancelación, transición, producción, acciones correctivas;
-- dominios específicos, Storage privado, gestión de profesionales y pruebas RLS/concurrencia.
