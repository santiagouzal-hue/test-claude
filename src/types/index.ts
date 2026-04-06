export type CategoriaGasto =
  | 'Materiales'
  | 'Mano de obra'
  | 'Herramientas'
  | 'Servicios'
  | 'Honorarios'
  | 'Imprevistos'
  | 'Otros';

export type EstadoPago = 'pendiente' | 'pagado' | 'vencido';
export type MetodoPago = 'efectivo' | 'transferencia' | 'cheque' | 'tarjeta';
export type EstadoRemito = 'pendiente' | 'recibido' | 'con_diferencias';
export type EstadoFactura = 'vigente' | 'cancelada' | 'vencida';

export interface Gasto {
  id: string;
  fecha: string;
  descripcion: string;
  categoria: CategoriaGasto;
  monto: number;
  proveedor: string;
  estado: EstadoPago;
  remitoid?: string;
  facturaid?: string;
  notas?: string;
}

export interface Pago {
  id: string;
  fecha: string;
  beneficiario: string;
  concepto: string;
  monto: number;
  metodo: MetodoPago;
  comprobante?: string;
  gastoId?: string;
  notas?: string;
}

export interface ItemMaterial {
  nombre: string;
  cantidad: number;
  unidad: string;
  precioUnitario: number;
}

export interface Material {
  id: string;
  nombre: string;
  categoria: string;
  cantidad: number;
  unidad: string;
  precioUnitario: number;
  precioTotal: number;
  proveedor: string;
  fechaIngreso: string;
  ubicacion?: string;
  notas?: string;
}

export interface Factura {
  id: string;
  numero: string;
  fecha: string;
  proveedor: string;
  concepto: string;
  monto: number;
  archivo?: string; // base64
  archivoNombre?: string;
  estado: EstadoFactura;
  vencimiento?: string;
  notas?: string;
}

export interface ItemRemito {
  descripcion: string;
  cantidad: number;
  unidad: string;
  cantidadRecibida?: number;
}

export interface Remito {
  id: string;
  numero: string;
  fecha: string;
  proveedor: string;
  items: ItemRemito[];
  estado: EstadoRemito;
  facturaId?: string;
  observaciones?: string;
}

export interface Presupuesto {
  total: number;
  categorias: Record<CategoriaGasto, number>;
}

export interface AppState {
  gastos: Gasto[];
  pagos: Pago[];
  materiales: Material[];
  facturas: Factura[];
  remitos: Remito[];
  presupuesto: Presupuesto;
}
