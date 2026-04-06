import { useState, useMemo } from 'react';
import { Plus, Pencil, Trash2, Search, CreditCard, Banknote, Building2, Landmark } from 'lucide-react';
import type { Pago, MetodoPago } from '../types';
import Modal from './Modal';

const METODOS: MetodoPago[] = ['efectivo', 'transferencia', 'cheque', 'tarjeta'];

function fmt(n: number) {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n);
}

const METODO_ICONS: Record<MetodoPago, React.ElementType> = {
  efectivo: Banknote,
  transferencia: Building2,
  cheque: Landmark,
  tarjeta: CreditCard,
};
const METODO_STYLES: Record<MetodoPago, string> = {
  efectivo: 'bg-green-100 text-green-700',
  transferencia: 'bg-blue-100 text-blue-700',
  cheque: 'bg-purple-100 text-purple-700',
  tarjeta: 'bg-pink-100 text-pink-700',
};

interface Props {
  pagos: Pago[];
  onAdd: (p: Omit<Pago, 'id'>) => void;
  onUpdate: (id: string, p: Partial<Pago>) => void;
  onDelete: (id: string) => void;
}

const empty: Omit<Pago, 'id'> = {
  fecha: new Date().toISOString().slice(0, 10),
  beneficiario: '',
  concepto: '',
  monto: 0,
  metodo: 'transferencia',
  comprobante: '',
  notas: '',
};

export default function Pagos({ pagos, onAdd, onUpdate, onDelete }: Props) {
  const [search, setSearch] = useState('');
  const [filterMetodo, setFilterMetodo] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Pago | null>(null);
  const [form, setForm] = useState<Omit<Pago, 'id'>>(empty);

  const filtered = useMemo(() => {
    let list = [...pagos].sort((a, b) => b.fecha.localeCompare(a.fecha));
    if (search) list = list.filter(p => p.beneficiario.toLowerCase().includes(search.toLowerCase()) || p.concepto.toLowerCase().includes(search.toLowerCase()));
    if (filterMetodo !== 'all') list = list.filter(p => p.metodo === filterMetodo);
    return list;
  }, [pagos, search, filterMetodo]);

  const total = useMemo(() => filtered.reduce((s, p) => s + p.monto, 0), [filtered]);

  const byMetodo = useMemo(() => {
    const r: Record<string, number> = {};
    pagos.forEach(p => { r[p.metodo] = (r[p.metodo] || 0) + p.monto; });
    return r;
  }, [pagos]);

  function openNew() { setEditing(null); setForm(empty); setShowModal(true); }
  function openEdit(p: Pago) { setEditing(p); setForm({ fecha: p.fecha, beneficiario: p.beneficiario, concepto: p.concepto, monto: p.monto, metodo: p.metodo, comprobante: p.comprobante, notas: p.notas }); setShowModal(true); }

  function handleSave() {
    if (!form.concepto || !form.monto) return;
    if (editing) { onUpdate(editing.id, form); } else { onAdd(form); }
    setShowModal(false);
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pagos</h1>
          <p className="text-sm text-gray-500 mt-0.5">Registro de pagos realizados</p>
        </div>
        <button onClick={openNew} className="flex items-center gap-2 bg-amber-700 hover:bg-amber-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          <Plus className="w-4 h-4" /> Registrar pago
        </button>
      </div>

      {/* By method summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {METODOS.map(m => {
          const Icon = METODO_ICONS[m];
          return (
            <div key={m} className={`rounded-lg border p-3 ${METODO_STYLES[m]} border-current/20`}>
              <div className="flex items-center gap-2 mb-1">
                <Icon className="w-4 h-4" />
                <span className="text-xs font-medium capitalize">{m}</span>
              </div>
              <div className="font-bold text-sm">{fmt(byMetodo[m] || 0)}</div>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar..." className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500" />
        </div>
        <select value={filterMetodo} onChange={e => setFilterMetodo(e.target.value)} className="text-sm border border-gray-200 rounded-lg px-2 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500">
          <option value="all">Todos los métodos</option>
          {METODOS.map(m => <option key={m}>{m}</option>)}
        </select>
      </div>

      {/* Total */}
      {filtered.length > 0 && (
        <div className="text-right text-sm text-gray-600">
          Total filtrado: <span className="font-bold text-gray-900">{fmt(total)}</span>
        </div>
      )}

      {/* List */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-12 text-center text-gray-400">
            <p className="text-sm">No hay pagos registrados</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Fecha</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Concepto</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600 hidden md:table-cell">Beneficiario</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600 hidden lg:table-cell">Comprobante</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-600">Método</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Monto</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(p => {
                  const Icon = METODO_ICONS[p.metodo];
                  return (
                    <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{p.fecha}</td>
                      <td className="px-4 py-3 font-medium text-gray-800">
                        {p.concepto}
                        {p.notas && <div className="text-xs text-gray-400 font-normal truncate max-w-xs">{p.notas}</div>}
                      </td>
                      <td className="px-4 py-3 text-gray-600 hidden md:table-cell">{p.beneficiario}</td>
                      <td className="px-4 py-3 text-gray-500 hidden lg:table-cell text-xs">{p.comprobante || '—'}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium capitalize ${METODO_STYLES[p.metodo]}`}>
                          <Icon className="w-3 h-3" />
                          {p.metodo}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-gray-900">{fmt(p.monto)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 justify-end">
                          <button onClick={() => openEdit(p)} className="p-1.5 text-gray-400 hover:text-amber-700 hover:bg-amber-50 rounded transition-colors">
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button onClick={() => { if (confirm('¿Eliminar este pago?')) onDelete(p.id); }} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors">
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

      <Modal open={showModal} onClose={() => setShowModal(false)} title={editing ? 'Editar pago' : 'Registrar pago'}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Fecha</label>
              <input type="date" value={form.fecha} onChange={e => setForm(f => ({ ...f, fecha: e.target.value }))} className="input" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Monto (ARS)</label>
              <input type="number" min="0" value={form.monto || ''} onChange={e => setForm(f => ({ ...f, monto: parseFloat(e.target.value) || 0 }))} className="input" placeholder="0" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Concepto *</label>
            <input value={form.concepto} onChange={e => setForm(f => ({ ...f, concepto: e.target.value }))} className="input" placeholder="Descripción del pago" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Beneficiario</label>
              <input value={form.beneficiario} onChange={e => setForm(f => ({ ...f, beneficiario: e.target.value }))} className="input" placeholder="A quién se le paga" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Método de pago</label>
              <select value={form.metodo} onChange={e => setForm(f => ({ ...f, metodo: e.target.value as MetodoPago }))} className="input">
                {METODOS.map(m => <option key={m}>{m}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">N° Comprobante / Transferencia</label>
            <input value={form.comprobante || ''} onChange={e => setForm(f => ({ ...f, comprobante: e.target.value }))} className="input" placeholder="Número de comprobante" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Notas</label>
            <textarea value={form.notas || ''} onChange={e => setForm(f => ({ ...f, notas: e.target.value }))} className="input" rows={2} placeholder="Notas adicionales..." />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">Cancelar</button>
            <button onClick={handleSave} disabled={!form.concepto} className="px-4 py-2 text-sm bg-amber-700 hover:bg-amber-800 text-white rounded-lg transition-colors disabled:opacity-50">
              {editing ? 'Guardar cambios' : 'Registrar pago'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
