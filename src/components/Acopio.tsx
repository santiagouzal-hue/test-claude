import { useState, useMemo } from 'react';
import { Plus, Pencil, Trash2, Search, Package } from 'lucide-react';
import type { Material } from '../types';
import Modal from './Modal';

const CATEGORIAS = ['Cemento y yeso', 'Hierro y acero', 'Ladrillos y bloques', 'Madera', 'Pintura', 'Sanitarios', 'Electricidad', 'Cerámicos y revestimientos', 'Impermeabilizantes', 'Otros'];
const UNIDADES = ['kg', 'tn', 'lt', 'ml', 'm2', 'm3', 'ud', 'bolsa', 'caja', 'par', 'rollo', 'paquete'];

function fmt(n: number) {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n);
}

interface Props {
  materiales: Material[];
  onAdd: (m: Omit<Material, 'id'>) => void;
  onUpdate: (id: string, m: Partial<Material>) => void;
  onDelete: (id: string) => void;
}

const emptyForm = (): Omit<Material, 'id'> => ({
  nombre: '',
  categoria: 'Cemento y yeso',
  cantidad: 0,
  unidad: 'kg',
  precioUnitario: 0,
  precioTotal: 0,
  proveedor: '',
  fechaIngreso: new Date().toISOString().slice(0, 10),
  ubicacion: '',
  notas: '',
});

export default function Acopio({ materiales, onAdd, onUpdate, onDelete }: Props) {
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Material | null>(null);
  const [form, setForm] = useState<Omit<Material, 'id'>>(emptyForm());

  const filtered = useMemo(() => {
    let list = [...materiales].sort((a, b) => b.fechaIngreso.localeCompare(a.fechaIngreso));
    if (search) list = list.filter(m => m.nombre.toLowerCase().includes(search.toLowerCase()) || m.proveedor.toLowerCase().includes(search.toLowerCase()));
    if (filterCat !== 'all') list = list.filter(m => m.categoria === filterCat);
    return list;
  }, [materiales, search, filterCat]);

  const totalInvertido = useMemo(() => materiales.reduce((s, m) => s + m.precioTotal, 0), [materiales]);

  function updatePrecioTotal(f: Omit<Material, 'id'>) {
    return { ...f, precioTotal: f.cantidad * f.precioUnitario };
  }

  function openNew() { setEditing(null); setForm(emptyForm()); setShowModal(true); }
  function openEdit(m: Material) {
    setEditing(m);
    setForm({ nombre: m.nombre, categoria: m.categoria, cantidad: m.cantidad, unidad: m.unidad, precioUnitario: m.precioUnitario, precioTotal: m.precioTotal, proveedor: m.proveedor, fechaIngreso: m.fechaIngreso, ubicacion: m.ubicacion, notas: m.notas });
    setShowModal(true);
  }

  function handleSave() {
    if (!form.nombre) return;
    const data = updatePrecioTotal(form);
    if (editing) { onUpdate(editing.id, data); } else { onAdd(data); }
    setShowModal(false);
  }

  function setField<K extends keyof typeof form>(key: K, value: typeof form[K]) {
    setForm(f => {
      const next = { ...f, [key]: value };
      if (key === 'cantidad' || key === 'precioUnitario') {
        next.precioTotal = (key === 'cantidad' ? (value as number) : f.cantidad) * (key === 'precioUnitario' ? (value as number) : f.precioUnitario);
      }
      return next;
    });
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Acopio / Materiales</h1>
          <p className="text-sm text-gray-500 mt-0.5">Inventario de materiales de la obra</p>
        </div>
        <button onClick={openNew} className="flex items-center gap-2 bg-amber-700 hover:bg-amber-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          <Plus className="w-4 h-4" /> Agregar material
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        <div className="bg-white rounded-lg border border-gray-200 p-3 text-center">
          <div className="text-xs text-gray-500">Ítems registrados</div>
          <div className="font-bold text-gray-900 text-xl mt-0.5">{materiales.length}</div>
        </div>
        <div className="bg-amber-50 rounded-lg border border-amber-200 p-3 text-center">
          <div className="text-xs text-amber-600">Total invertido</div>
          <div className="font-bold text-amber-700 text-sm mt-0.5">{fmt(totalInvertido)}</div>
        </div>
        <div className="bg-blue-50 rounded-lg border border-blue-200 p-3 text-center col-span-2 lg:col-span-1">
          <div className="text-xs text-blue-600">Categorías</div>
          <div className="font-bold text-blue-700 text-xl mt-0.5">{new Set(materiales.map(m => m.categoria)).size}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar material..." className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500" />
        </div>
        <select value={filterCat} onChange={e => setFilterCat(e.target.value)} className="text-sm border border-gray-200 rounded-lg px-2 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500">
          <option value="all">Todas las categorías</option>
          {CATEGORIAS.map(c => <option key={c}>{c}</option>)}
        </select>
      </div>

      {/* Grid of cards */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 py-12 text-center text-gray-400">
          <Package className="w-10 h-10 mx-auto mb-2 opacity-40" />
          <p className="text-sm">No hay materiales registrados</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(m => (
            <div key={m.id} className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="min-w-0">
                  <div className="font-semibold text-gray-800 truncate">{m.nombre}</div>
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full mt-1 inline-block">{m.categoria}</span>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => openEdit(m)} className="p-1.5 text-gray-400 hover:text-amber-700 hover:bg-amber-50 rounded transition-colors">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => { if (confirm('¿Eliminar este material?')) onDelete(m.id); }} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Cantidad</span>
                  <span className="font-medium">{m.cantidad} {m.unidad}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Precio unit.</span>
                  <span className="font-medium">{fmt(m.precioUnitario)}/{m.unidad}</span>
                </div>
                <div className="flex justify-between border-t border-gray-100 pt-1.5">
                  <span className="text-gray-600 font-medium">Total</span>
                  <span className="font-bold text-gray-900">{fmt(m.precioTotal)}</span>
                </div>
                {m.proveedor && (
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Proveedor</span>
                    <span className="text-gray-600">{m.proveedor}</span>
                  </div>
                )}
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Ingreso</span>
                  <span className="text-gray-600">{m.fechaIngreso}</span>
                </div>
                {m.ubicacion && (
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Ubicación</span>
                    <span className="text-gray-600">{m.ubicacion}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={showModal} onClose={() => setShowModal(false)} title={editing ? 'Editar material' : 'Agregar material'}>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Nombre del material *</label>
            <input value={form.nombre} onChange={e => setField('nombre', e.target.value)} className="input" placeholder="Ej: Cemento Portland" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Categoría</label>
              <select value={form.categoria} onChange={e => setField('categoria', e.target.value)} className="input">
                {CATEGORIAS.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Fecha de ingreso</label>
              <input type="date" value={form.fechaIngreso} onChange={e => setField('fechaIngreso', e.target.value)} className="input" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Cantidad</label>
              <input type="number" min="0" value={form.cantidad || ''} onChange={e => setField('cantidad', parseFloat(e.target.value) || 0)} className="input" placeholder="0" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Unidad</label>
              <select value={form.unidad} onChange={e => setField('unidad', e.target.value)} className="input">
                {UNIDADES.map(u => <option key={u}>{u}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Precio unit. ($)</label>
              <input type="number" min="0" value={form.precioUnitario || ''} onChange={e => setField('precioUnitario', parseFloat(e.target.value) || 0)} className="input" placeholder="0" />
            </div>
          </div>
          {form.cantidad > 0 && form.precioUnitario > 0 && (
            <div className="bg-amber-50 rounded-lg p-3 text-sm">
              <span className="text-amber-700 font-medium">Total calculado: {fmt(form.precioTotal)}</span>
            </div>
          )}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Proveedor</label>
            <input value={form.proveedor} onChange={e => setField('proveedor', e.target.value)} className="input" placeholder="Nombre del proveedor" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Ubicación / Depósito</label>
              <input value={form.ubicacion || ''} onChange={e => setField('ubicacion', e.target.value)} className="input" placeholder="Dónde está almacenado" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Notas</label>
              <input value={form.notas || ''} onChange={e => setField('notas', e.target.value)} className="input" placeholder="Notas" />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">Cancelar</button>
            <button onClick={handleSave} disabled={!form.nombre} className="px-4 py-2 text-sm bg-amber-700 hover:bg-amber-800 text-white rounded-lg transition-colors disabled:opacity-50">
              {editing ? 'Guardar cambios' : 'Agregar'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
