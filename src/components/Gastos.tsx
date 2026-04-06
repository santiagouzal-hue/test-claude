import { useState, useMemo } from 'react';
import { Plus, Pencil, Trash2, Search, Filter, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import type { Gasto, CategoriaGasto, EstadoPago } from '../types';
import Modal from './Modal';

const CATEGORIAS: CategoriaGasto[] = [
  'Materiales', 'Mano de obra', 'Herramientas', 'Servicios', 'Honorarios', 'Imprevistos', 'Otros',
];
const ESTADOS: EstadoPago[] = ['pendiente', 'pagado', 'vencido'];

function fmt(n: number) {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n);
}

interface Props {
  gastos: Gasto[];
  onAdd: (g: Omit<Gasto, 'id'>) => void;
  onUpdate: (id: string, g: Partial<Gasto>) => void;
  onDelete: (id: string) => void;
}

const empty: Omit<Gasto, 'id'> = {
  fecha: new Date().toISOString().slice(0, 10),
  descripcion: '',
  categoria: 'Materiales',
  monto: 0,
  proveedor: '',
  estado: 'pendiente',
  notas: '',
};

const STATUS_STYLES: Record<EstadoPago, string> = {
  pagado: 'bg-green-100 text-green-700',
  pendiente: 'bg-yellow-100 text-yellow-700',
  vencido: 'bg-red-100 text-red-700',
};
const STATUS_ICONS: Record<EstadoPago, React.ElementType> = {
  pagado: CheckCircle,
  pendiente: Clock,
  vencido: AlertCircle,
};

export default function Gastos({ gastos, onAdd, onUpdate, onDelete }: Props) {
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState<string>('all');
  const [filterEstado, setFilterEstado] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Gasto | null>(null);
  const [form, setForm] = useState<Omit<Gasto, 'id'>>(empty);

  const filtered = useMemo(() => {
    let list = [...gastos].sort((a, b) => b.fecha.localeCompare(a.fecha));
    if (search) list = list.filter(g => g.descripcion.toLowerCase().includes(search.toLowerCase()) || g.proveedor.toLowerCase().includes(search.toLowerCase()));
    if (filterCat !== 'all') list = list.filter(g => g.categoria === filterCat);
    if (filterEstado !== 'all') list = list.filter(g => g.estado === filterEstado);
    return list;
  }, [gastos, search, filterCat, filterEstado]);

  const totals = useMemo(() => ({
    total: filtered.reduce((s, g) => s + g.monto, 0),
    pagado: filtered.filter(g => g.estado === 'pagado').reduce((s, g) => s + g.monto, 0),
    pendiente: filtered.filter(g => g.estado === 'pendiente').reduce((s, g) => s + g.monto, 0),
  }), [filtered]);

  function openNew() {
    setEditing(null);
    setForm(empty);
    setShowModal(true);
  }

  function openEdit(g: Gasto) {
    setEditing(g);
    setForm({ fecha: g.fecha, descripcion: g.descripcion, categoria: g.categoria, monto: g.monto, proveedor: g.proveedor, estado: g.estado, notas: g.notas });
    setShowModal(true);
  }

  function handleSave() {
    if (!form.descripcion || !form.monto) return;
    if (editing) {
      onUpdate(editing.id, form);
    } else {
      onAdd(form);
    }
    setShowModal(false);
  }

  function handleDelete(id: string) {
    if (confirm('¿Eliminar este gasto?')) onDelete(id);
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gastos</h1>
          <p className="text-sm text-gray-500 mt-0.5">Control de todos los gastos de la obra</p>
        </div>
        <button onClick={openNew} className="flex items-center gap-2 bg-amber-700 hover:bg-amber-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          <Plus className="w-4 h-4" /> Nuevo gasto
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-lg border border-gray-200 p-3 text-center">
          <div className="text-xs text-gray-500">Total</div>
          <div className="font-bold text-gray-900 text-sm mt-0.5">{fmt(totals.total)}</div>
        </div>
        <div className="bg-green-50 rounded-lg border border-green-200 p-3 text-center">
          <div className="text-xs text-green-600">Pagado</div>
          <div className="font-bold text-green-700 text-sm mt-0.5">{fmt(totals.pagado)}</div>
        </div>
        <div className="bg-yellow-50 rounded-lg border border-yellow-200 p-3 text-center">
          <div className="text-xs text-yellow-600">Pendiente</div>
          <div className="font-bold text-yellow-700 text-sm mt-0.5">{fmt(totals.pendiente)}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select value={filterCat} onChange={e => setFilterCat(e.target.value)} className="text-sm border border-gray-200 rounded-lg px-2 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500">
            <option value="all">Todas las categorías</option>
            {CATEGORIAS.map(c => <option key={c}>{c}</option>)}
          </select>
          <select value={filterEstado} onChange={e => setFilterEstado(e.target.value)} className="text-sm border border-gray-200 rounded-lg px-2 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500">
            <option value="all">Todos los estados</option>
            {ESTADOS.map(e => <option key={e}>{e}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-12 text-center text-gray-400">
            <p className="text-sm">No hay gastos registrados</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Fecha</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Descripción</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600 hidden md:table-cell">Categoría</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600 hidden lg:table-cell">Proveedor</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Monto</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-600">Estado</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(g => {
                  const Icon = STATUS_ICONS[g.estado];
                  return (
                    <tr key={g.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{g.fecha}</td>
                      <td className="px-4 py-3 font-medium text-gray-800">
                        {g.descripcion}
                        {g.notas && <div className="text-xs text-gray-400 font-normal truncate max-w-xs">{g.notas}</div>}
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{g.categoria}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-600 hidden lg:table-cell">{g.proveedor}</td>
                      <td className="px-4 py-3 text-right font-semibold text-gray-900">{fmt(g.monto)}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLES[g.estado]}`}>
                          <Icon className="w-3 h-3" />
                          {g.estado}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 justify-end">
                          <button onClick={() => openEdit(g)} className="p-1.5 text-gray-400 hover:text-amber-700 hover:bg-amber-50 rounded transition-colors">
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(g.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title={editing ? 'Editar gasto' : 'Nuevo gasto'}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Fecha">
              <input type="date" value={form.fecha} onChange={e => setForm(f => ({ ...f, fecha: e.target.value }))} className="input" />
            </Field>
            <Field label="Monto (ARS)">
              <input type="number" min="0" value={form.monto || ''} onChange={e => setForm(f => ({ ...f, monto: parseFloat(e.target.value) || 0 }))} className="input" placeholder="0" />
            </Field>
          </div>
          <Field label="Descripción *">
            <input value={form.descripcion} onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))} className="input" placeholder="Descripción del gasto" />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Categoría">
              <select value={form.categoria} onChange={e => setForm(f => ({ ...f, categoria: e.target.value as CategoriaGasto }))} className="input">
                {CATEGORIAS.map(c => <option key={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="Estado">
              <select value={form.estado} onChange={e => setForm(f => ({ ...f, estado: e.target.value as EstadoPago }))} className="input">
                {ESTADOS.map(e => <option key={e}>{e}</option>)}
              </select>
            </Field>
          </div>
          <Field label="Proveedor">
            <input value={form.proveedor} onChange={e => setForm(f => ({ ...f, proveedor: e.target.value }))} className="input" placeholder="Nombre del proveedor" />
          </Field>
          <Field label="Notas">
            <textarea value={form.notas || ''} onChange={e => setForm(f => ({ ...f, notas: e.target.value }))} className="input" rows={2} placeholder="Notas adicionales..." />
          </Field>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">Cancelar</button>
            <button onClick={handleSave} disabled={!form.descripcion} className="px-4 py-2 text-sm bg-amber-700 hover:bg-amber-800 text-white rounded-lg transition-colors disabled:opacity-50">
              {editing ? 'Guardar cambios' : 'Agregar gasto'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      {children}
    </div>
  );
}
