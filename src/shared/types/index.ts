export type Tipo = 'venta' | 'gasto' | 'compra';
export type Estado = 'sin-datos' | 'positivo' | 'alerta' | 'critico';

export type Negocio = {
  id: string;
  nombre: string;
  rubro: string | null;
  emoji: string | null;
  capital_inicial: number;
  meta_diaria: number;
};
export type NegocioInput = {
  nombre: string;
  rubro: string | null;
  emoji: string;
  capital_inicial: number;
  meta_diaria: number;
};

export type Producto = {
  id: string;
  negocio_id: string;
  nombre: string;
  categoria: string | null;
  precio_venta: number;
  costo: number;
  stock: number;
  stock_minimo: number;
  foto_path: string | null;
  foto_url: string | null;
  created_at: string;
};
export type ProductoInput = {
  nombre: string;
  categoria: string | null;
  precio_venta: number;
  costo: number;
  stock: number;
  stock_minimo: number;
  foto_path: string | null;
};

export type Venta = {
  id: string;
  negocio_id: string;
  producto_id: string | null;
  producto_nombre: string;
  categoria: string | null;
  cantidad: number;
  precio_unitario: number;
  costo_unitario: number;
  total: number;
  fecha: string;
  created_at: string;
};

export type Jornada = {
  id: string;
  negocio_id: string;
  fecha: string;
  capital_inicio: number;
  cerrada: boolean;
};

export type Movimiento = {
  id: string;
  negocio_id: string;
  fecha: string;
  tipo: Tipo;
  concepto: string;
  cliente: string | null;
  monto: number;
  costo_directo: number | null;
  created_at: string;
};
export type MovimientoInput = {
  tipo: Tipo;
  concepto: string;
  cliente: string | null;
  monto: number;
  costo_directo: number | null;
};

export type Pulso = {
  estado: Estado;
  titulo: string;
  consejo: string;
  ventas: number;
  costoVentas: number;
  gastosOperativos: number;
  compras: number;
  resultadoOperativo: number | null;
  margenOperativo: number | null;
  diasConVentas: number;
  diasConActividad: number;
  cantidadMovimientos: number;
  ventasConCosto: number;
  ventasSinCosto: number;
  coberturaCosteo: number | null;
};