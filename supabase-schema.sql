-- CODEPOS MX · Esquema para menú público y panel privado
-- Ejecuta este archivo en Supabase > SQL Editor.
-- Importante: no desactives RLS y NUNCA pongas la service_role key en el navegador.

create extension if not exists pgcrypto;

create table if not exists public.menu_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.menu_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  note text not null default '',
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.menu_items (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.menu_categories(id) on delete restrict,
  name text not null,
  description text not null default '',
  price numeric(10,2) not null default 0 check (price >= 0),
  image_url text,
  tag text,
  sort_order integer not null default 0,
  is_available boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.site_settings (
  id integer primary key check (id = 1),
  business_name text not null default 'La Hacienda del Sabor',
  tagline text not null default 'SABORES QUE INVITAN A QUEDARSE',
  description text not null default '',
  updated_label text not null default 'MENÚ DIGITAL',
  visit_title text not null default 'El buen sabor se comparte.',
  visit_note text not null default 'Pregunta por los especiales del día.',
  disclaimer text not null default 'Los precios y la disponibilidad pueden cambiar.'
);

alter table public.menu_admins enable row level security;
alter table public.menu_categories enable row level security;
alter table public.menu_items enable row level security;
alter table public.site_settings enable row level security;

drop policy if exists "admin can read own admin record" on public.menu_admins;
create policy "admin can read own admin record" on public.menu_admins
for select to authenticated using (user_id = auth.uid());

drop policy if exists "public reads active categories" on public.menu_categories;
create policy "public reads active categories" on public.menu_categories
for select to anon, authenticated using (is_active = true);

drop policy if exists "admins manage categories" on public.menu_categories;
create policy "admins manage categories" on public.menu_categories
for all to authenticated
using (exists (select 1 from public.menu_admins a where a.user_id = auth.uid()))
with check (exists (select 1 from public.menu_admins a where a.user_id = auth.uid()));

drop policy if exists "public reads available items in active categories" on public.menu_items;
create policy "public reads available items in active categories" on public.menu_items
for select to anon, authenticated using (
  is_available = true and exists (
    select 1 from public.menu_categories c where c.id = category_id and c.is_active = true
  )
);

drop policy if exists "admins manage items" on public.menu_items;
create policy "admins manage items" on public.menu_items
for all to authenticated
using (exists (select 1 from public.menu_admins a where a.user_id = auth.uid()))
with check (exists (select 1 from public.menu_admins a where a.user_id = auth.uid()));

drop policy if exists "public reads site settings" on public.site_settings;
create policy "public reads site settings" on public.site_settings
for select to anon, authenticated using (id = 1);

drop policy if exists "admins manage site settings" on public.site_settings;
create policy "admins manage site settings" on public.site_settings
for all to authenticated
using (exists (select 1 from public.menu_admins a where a.user_id = auth.uid()))
with check (exists (select 1 from public.menu_admins a where a.user_id = auth.uid()));

-- Ajusta los textos de ejemplo desde el panel privado después de habilitar al administrador.
insert into public.site_settings (id) values (1) on conflict (id) do nothing;

-- Datos DEMO (inventados para probar el diseño; sustituir por el menú y precios reales).
insert into public.menu_categories (name, note, sort_order)
select v.name, v.note, v.sort_order
from (values
  ('Desayunos','PARA EMPEZAR EL DÍA',1),
  ('Entradas y sopas','AL CENTRO DE LA MESA',2),
  ('Antojitos mexicanos','RECETAS CON TRADICIÓN',3),
  ('Pizzas','PARA COMPARTIR',4),
  ('Carnes y platos fuertes','EL PLATO PRINCIPAL',5),
  ('Bebidas','ALGO PARA ACOMPAÑAR',6),
  ('Postres','UN DULCE FINAL',7)
) as v(name,note,sort_order)
where not exists (select 1 from public.menu_categories);

-- Si ya tienes categorías en la tabla, no duplica datos de ejemplo.
insert into public.menu_items (category_id,name,description,price,tag,sort_order)
select c.id,v.name,v.description,v.price,v.tag,v.sort_order
from (values
  ('Desayunos','Chilaquiles de la casa','Totopos en salsa verde o roja, crema, queso y cebolla.',135::numeric,'Favorito',1),
  ('Desayunos','Huevos al gusto','Acompañados de frijoles y tortillas.',115::numeric,'',2),
  ('Entradas y sopas','Sopa de tortilla','Caldo de jitomate, tortilla crujiente, aguacate y queso.',89::numeric,'',1),
  ('Antojitos mexicanos','Enchiladas tradicionales','Tortillas rellenas, salsa de la casa, crema y queso.',148::numeric,'Especialidad',1),
  ('Pizzas','Pizza de cuatro quesos','Mezcla de quesos sobre nuestra base horneada.',219::numeric,'Favorita',1),
  ('Carnes y platos fuertes','Arrachera a la parrilla','Arrachera con guarnición de temporada.',289::numeric,'Especialidad',1),
  ('Bebidas','Agua fresca del día','Pregunta por el sabor disponible.',42::numeric,'',1),
  ('Postres','Flan de la casa','Flan cremoso con caramelo.',75::numeric,'',1)
) as v(category_name,name,description,price,tag,sort_order)
join public.menu_categories c on c.name=v.category_name
where not exists (select 1 from public.menu_items);

-- Después de crear un usuario en Supabase Authentication, autorízalo así:
-- insert into public.menu_admins (user_id)
-- select id from auth.users where email = 'tu-correo-admin@ejemplo.com'
-- on conflict do nothing;
