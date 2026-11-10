-- StockYa: ejecutar una sola vez en el SQL Editor de un proyecto Supabase nuevo.
-- Los usuarios autenticados solo pueden consultar y modificar sus propios negocios.

create table if not exists public.negocios (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  nombre text not null check (length(btrim(nombre)) > 0),
  rubro text,
  emoji text not null default 'storefront-outline',
  capital_inicial numeric(12, 2) not null default 0 check (capital_inicial >= 0),
  meta_diaria numeric(12, 2) not null default 100 check (meta_diaria >= 0),
  created_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  negocio_id uuid not null references public.negocios (id) on delete cascade,
  nombre text not null check (length(btrim(nombre)) > 0),
  categoria text,
  precio_venta numeric(12, 2) not null check (precio_venta >= 0),
  costo numeric(12, 2) not null default 0 check (costo >= 0),
  stock integer not null default 0 check (stock >= 0),
  stock_minimo integer not null default 0 check (stock_minimo >= 0),
  foto_path text,
  created_at timestamptz not null default now()
);

create table if not exists public.jornadas (
  id uuid primary key default gen_random_uuid(),
  negocio_id uuid not null references public.negocios (id) on delete cascade,
  fecha date not null,
  capital_inicio numeric(12, 2) not null default 0 check (capital_inicio >= 0),
  cerrada boolean not null default false,
  created_at timestamptz not null default now(),
  unique (negocio_id, fecha)
);

create table if not exists public.movimientos (
  id uuid primary key default gen_random_uuid(),
  negocio_id uuid not null references public.negocios (id) on delete cascade,
  fecha date not null default current_date,
  tipo text not null check (tipo in ('venta', 'gasto', 'compra')),
  concepto text not null check (length(btrim(concepto)) > 0),
  cliente text,
  monto numeric(12, 2) not null check (monto > 0),
  costo_directo numeric(12, 2) check (costo_directo is null or costo_directo >= 0),
  created_at timestamptz not null default now(),
  check (tipo = 'venta' or (cliente is null and costo_directo is null))
);

create table if not exists public.sales (
  id uuid primary key default gen_random_uuid(),
  negocio_id uuid not null references public.negocios (id) on delete cascade,
  producto_id uuid references public.products (id) on delete set null,
  producto_nombre text not null,
  categoria text,
  cantidad integer not null check (cantidad > 0),
  precio_unitario numeric(12, 2) not null check (precio_unitario >= 0),
  costo_unitario numeric(12, 2) not null check (costo_unitario >= 0),
  total numeric(12, 2) not null check (total >= 0),
  fecha date not null default current_date,
  created_at timestamptz not null default now()
);

alter table public.sales
  add column if not exists categoria text;

create index if not exists products_negocio_nombre_idx
  on public.products (negocio_id, nombre);
create index if not exists jornadas_negocio_fecha_idx
  on public.jornadas (negocio_id, fecha);
create index if not exists movimientos_negocio_fecha_idx
  on public.movimientos (negocio_id, fecha, created_at desc);
create index if not exists sales_negocio_fecha_idx
  on public.sales (negocio_id, fecha, created_at desc);

alter table public.negocios enable row level security;
alter table public.products enable row level security;
alter table public.jornadas enable row level security;
alter table public.movimientos enable row level security;
alter table public.sales enable row level security;

drop policy if exists "Users manage their businesses" on public.negocios;
create policy "Users manage their businesses"
  on public.negocios
  for all
  to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

drop policy if exists "Users manage their products" on public.products;
create policy "Users manage their products"
  on public.products
  for all
  to authenticated
  using (
    exists (
      select 1
      from public.negocios n
      where n.id = products.negocio_id
        and n.user_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1
      from public.negocios n
      where n.id = products.negocio_id
        and n.user_id = (select auth.uid())
    )
  );

drop policy if exists "Users manage their workdays" on public.jornadas;
create policy "Users manage their workdays"
  on public.jornadas
  for all
  to authenticated
  using (
    exists (
      select 1
      from public.negocios n
      where n.id = jornadas.negocio_id
        and n.user_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1
      from public.negocios n
      where n.id = jornadas.negocio_id
        and n.user_id = (select auth.uid())
    )
  );

drop policy if exists "Users manage their movements" on public.movimientos;
create policy "Users manage their movements"
  on public.movimientos
  for all
  to authenticated
  using (
    exists (
      select 1
      from public.negocios n
      where n.id = movimientos.negocio_id
        and n.user_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1
      from public.negocios n
      where n.id = movimientos.negocio_id
        and n.user_id = (select auth.uid())
    )
  );

drop policy if exists "Users read their sales" on public.sales;
create policy "Users read their sales"
  on public.sales
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.negocios n
      where n.id = sales.negocio_id
        and n.user_id = (select auth.uid())
    )
  );

grant usage on schema public to authenticated;
grant select, insert, update, delete
  on public.negocios, public.products, public.jornadas, public.movimientos
  to authenticated;
grant select on public.sales to authenticated;

create or replace function public.registrar_venta(
  p_producto_id uuid,
  p_cantidad integer,
  p_fecha date
)
returns public.sales
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_producto public.products%rowtype;
  v_venta public.sales%rowtype;
begin
  if auth.uid() is null then
    raise exception 'Debes iniciar sesión para registrar una venta.'
      using errcode = '28000';
  end if;

  if p_cantidad is null or p_cantidad <= 0 then
    raise exception 'La cantidad debe ser mayor que cero.'
      using errcode = '22023';
  end if;

  if p_fecha is null then
    raise exception 'La fecha de venta es obligatoria.'
      using errcode = '22023';
  end if;

  update public.products p
  set stock = p.stock - p_cantidad
  where p.id = p_producto_id
    and p.stock >= p_cantidad
    and exists (
      select 1
      from public.negocios n
      where n.id = p.negocio_id
        and n.user_id = auth.uid()
    )
  returning p.* into v_producto;

  if not found then
    raise exception 'El producto no existe, no te pertenece o no tiene stock suficiente.'
      using errcode = 'P0001';
  end if;

  insert into public.sales (
    negocio_id,
    producto_id,
    producto_nombre,
    categoria,
    cantidad,
    precio_unitario,
    costo_unitario,
    total,
    fecha
  )
  values (
    v_producto.negocio_id,
    v_producto.id,
    v_producto.nombre,
    v_producto.categoria,
    p_cantidad,
    v_producto.precio_venta,
    v_producto.costo,
    round(v_producto.precio_venta * p_cantidad, 2),
    p_fecha
  )
  returning * into v_venta;

  return v_venta;
end;
$$;

revoke all on function public.registrar_venta(uuid, integer, date) from public, anon;
grant execute on function public.registrar_venta(uuid, integer, date) to authenticated;

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'product-images',
  'product-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Business owners upload product images" on storage.objects;
create policy "Business owners upload product images"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'product-images'
    and exists (
      select 1
      from public.negocios n
      where n.id::text = (storage.foldername(name))[1]
        and n.user_id = (select auth.uid())
    )
  );

drop policy if exists "Business owners update product images" on storage.objects;
create policy "Business owners update product images"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'product-images'
    and exists (
      select 1
      from public.negocios n
      where n.id::text = (storage.foldername(name))[1]
        and n.user_id = (select auth.uid())
    )
  )
  with check (
    bucket_id = 'product-images'
    and exists (
      select 1
      from public.negocios n
      where n.id::text = (storage.foldername(name))[1]
        and n.user_id = (select auth.uid())
    )
  );

drop policy if exists "Business owners delete product images" on storage.objects;
create policy "Business owners delete product images"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'product-images'
    and exists (
      select 1
      from public.negocios n
      where n.id::text = (storage.foldername(name))[1]
        and n.user_id = (select auth.uid())
    )
  );
