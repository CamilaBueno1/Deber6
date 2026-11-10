begin;

alter table public.sales
  add column if not exists categoria text;

update public.sales s
set categoria = p.categoria
from public.products p
where s.producto_id = p.id
  and s.categoria is null
  and p.categoria is not null;

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

commit;
