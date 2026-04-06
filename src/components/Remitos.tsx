import { useState, useMemo } from 'react';
import { Plus, Pencil, Trash2, Search, ClipboardList, CheckCircle, Clock, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import type { Remito, EstadoRemito, ItemRemito } from '../types';
import Modal from './Modal';

const ESTADOS: EstadoRemito[] = ['pendiente', 'recibido', 'con_diferencias'];
const ESTADO_STYLES: Record<EstadoRemito, string> = {
  recibido: 'bg-green-100 text-green-700',
  pendiente: 'bg-yellow-100 text-yellow-700',
  con_diferencias: 'bg-red-100 text-red-700',
};
const ESTADO_ICONS: Record<EstadoRemito, React.ElementType> = {
  recibido: CheckCircle,
  pendiente: Clock,
  con_diferencias: AlertCircle,
};
const ESTADO_LABELS: Record<EstadoRemito, string> = {
  recibido: 'Recibido',
  pendiente: 'Pendiente',
  con_diferencias: 'Con diferencias',
};

interface Props {
  remitos: Remito[];
  onAdd: (r: Omit<Remito, 'id'>) => void;
  onUpdate: (id: string, r: Partial<Remito>) => void;
  onDelete: (id: string) => void;
}

const emptyItem = (): ItemRemito => ({ descripcion: '', cantidad: 0, unidad: 'ud', cantidadRecibida: undefined });

const emptyForm = (): Omit<Remito, 'id'> => ({
  numero: '',
  fecha: new Date().toISOString().slice(0, 10),
  proveedor: '',
  items: [emptyItem()],
  estado: 'pendiente',
  observaciones: '',
});

export default function Remitos({ remitos, onAdd, onUpdate, onDelete }: Props) {
  const [search, setSearch] = useState('');
  const [filterEstado, setFilterEstado] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Remito | null>(null);
  const [form, setForm] = useState<Omit<Remito, 'id'>>(emptyForm());
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let list = [...remitos].sort((a, b) => b.fecha.localeCompare(a.fecha));
    if (search) list = list.filter(r => r.numero.toLowerCase().includes(search.toLowerCase()) || r.proveedor.toLowerCase().includes(search.toLowerCase()));
    if (filterEstado !== 'all') list = list.filter(r => r.estado === filterEstado);
    return list;
  }, [remitos, search, filterEstado]);

  function openNew() { setEditing(null); setForm(emptyForm()); setShowModal(true); }
  function openEdit(r: Remito) {
    setEditing(r);
    setForm({ numero: r.numero, fecha: r.fecha, proveedor: r.proveedor, items: r.items.map(i => ({ ...i })), estado: r.estado, observaciones: r.observaciones, facturaId: r.facturaId });
    setShowModal(true);
  }

  function handleSave() {
    if (!form.numero || !form.proveedor) return;
    const items = form.items.filter(i => i.descripcion);
    if (editing) { onUpdate(editing.id, { ...form, items }); } else { onAdd({ ...form, items }); }
    setShowModal(false);
  }

  function addItem() { setForm(f => ({ ...f, items: [...f.items, emptyItem()] })); }
  function removeItem(i: number) { setForm(f => ({ ...f, items: f.items.filter((_, idx) => idx !== i) })); }
  function updateItem(i: number, key: keyof ItemRemito, value: string | number) {
    setForm(f => ({ ...f, items: f.items.map((item, idx) => idx === i ? { ...item, [key]: value } : item) }));
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Remitos</h1>
          <p className="text-sm text-gray-500 mt-0.5">Control de remitos y entrega de materiales</p>
        </div>
        <button onClick={openNew} className="flex items-center gap-2 bg-amber-700 hover:bg-amber-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          <Plus className="w-4 h-4" /> Nuevo remito
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        {ESTADOS.map(e => {
          const Icon = ESTADO_ICONS[e];
          const count = remitos.filter(r => r.estado === e).length;
          return (
            <div key={e} className={`rounded-lg border p-3 ${ESTADO_STYLES[e]} border-current/20`}>
              <div className="flex items-center gap-2 mb-1">
                <Icon className="w-4 h-4" />
                <span className="text-xs font-medium">{ESTADO_LABELS[e]}</span>
              </div>
              <div className="font-bold text-xl">{count}</div>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar remito..." className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500" />
        </div>
        <select value={filterEstado} onChange={e => setFilterEstado(e.target.value)} className="text-sm border border-gray-200 rounded-lg px-2 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500">
          <option value="all">Todos los estados</option>
          {ESTADOS.map(e => <option key={e} value={e}>{ESTADO_LABELS[e]}</option>)}
        </select>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 py-12 text-center text-gray-400">
          <ClipboardList className="w-10 h-10 mx-auto mb-2 opacity-40" />
          <p className="text-sm">No hay remitos registrados</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(r => {
            const Icon = ESTADO_ICONS[r.estado];
            const isExpanded = expandedId === r.id;
            return (
              <div key={r.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="flex items-center gap-3 px-4 py-3">
                  <button onClick={() => setExpandedId(isExpanded ? null : r.id)} className="p-1 text-gray-400 hover:text-gray-600">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                  <div className="flex-1 min-w-0 grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                    <div>
                      <div className="text-xs text-gray-400">Remito N°</div>
                      <div className="font-mono font-medium text-amber-700">{r.numero}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-400">Proveedor</div>
                      <div className="font-medium text-gray-800 truncate">{r.proveedor}</div>
                    </div>
                    <div className="hidden md:block">
                      <div className="text-xs text-gray-400">Fecha</div>
                      <div className="text-gray-600">{r.fecha}</div>
                    </div>
                    <div className="hidden md:block">
                      <div className="text-xs text-gray-400">Ítems</div>
                      <div className="text-gray-600">{r.items.length}</div>
                    </div>
                  </div>
                  <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${ESTADO_STYLES[r.estado]}`}>
                    <Icon className="w-3 h-3" />
                    <span className="hidden sm:inline">{ESTADO_LABELS[r.estado]}</span>
                  </span>
                  <div className="flex gap-1 shrink-0">
                    <button onClick={() => openEdit(r)} className="p-1.5 text-gray-400 hover:text-amber-700 hover:bg-amber-50 rounded transition-colors">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => { if (confirm('¿Eliminar este remito?')) onDelete(r.id); }} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-gray-100 px-4 pb-4">
                    <div className="mt-3 overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-gray-100">
                            <th className="text-left py-2 font-medium text-gray-500">Descripción</th>
                            <th className="text-right py-2 font-medium text-gray-500">Cant. pedida</th>
                            <th className="text-center py-2 font-medium text-gray-500">Unidad</th>
                            <th className="text-right py-2 font-medium text-gray-500">Cant. recibida</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {r.items.map((item, i) => {
                            const diff = item.cantidadRecibida !== undefined && item.cantidadRecibida !== item.cantidad;
                            return (
                              <tr key={i} className={diff ? 'bg-red-50' : ''}>
                                <td className="py-2 text-gray-800">{item.descripcion}</td>
                                <td className="py-2 text-right text-gray-600">{item.cantidad}</td>
                                <td className="py-2 text-center text-gray-500">{item.unidad}</td>
                                <td className={`py-2 text-right font-medium ${diff ? 'text-red-600' : 'text-green-600'}`}>
                                  {item.cantidadRecibida ?? '—'}
                                  {diff && <span className="text-xs ml-1">(diferencia)</span>}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                    {r.observaciones && (
                      <div className="mt-3 bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800">
                        <span className="font-medium">Observaciones: </span>{r.observaciones}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title={editing ? 'Editar remito' : 'Nuevo remito'} wide>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">N° Remito *</label>
              <input value={form.numero} onChange={e => setForm(f => ({ ...f, numero: e.target.value }))} className="input" placeholder="R-0001" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Fecha</label>
              <input type="date" value={form.fecha} onChange={e => setForm(f => ({ ...f, fecha: e.target.value }))} className="input" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Proveedor *</label>
              <input value={form.proveedor} onChange={e => setForm(f => ({ ...f, proveedor: e.target.value }))} className="input" placeholder="Nombre del proveedor" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Estado</label>
              <select value={form.estado} onChange={e => setForm(f => ({ ...f, estado: e.target.value as EstadoRemito }))} className="input">
                {ESTADOS.map(e => <option key={e} value={e}>{ESTADO_LABELS[e]}</option>)}
              </select>
            </div>
          </div>

          {/* Items */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium text-gray-600">Ítems del remito</label>
              <button onClick={addItem} className="text-xs text-amber-700 hover:text-amber-800 font-medium flex items-center gap-1">
                <Plus className="w-3 h-3" /> Agregar ítem
              </button>
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {form.items.map((item, i) => (
                <div key={i} className="grid grid-cols-12 gap-2 items-center">
                  <input value={item.descripcion} onChange={e => updateItem(i, 'descripcion', e.target.value)} className="input col-span-4" placeholder="Descripción" />
                  <input type="number" min="0" value={item.cantidad || ''} onChange={e => updateItem(i, 'cantidad', parseFloat(e.target.value) || 0)} className="input col-span-2" placeholder="Cant." />
                  <input value={item.unidad} onChange={e => updateItem(i, 'unidad', e.target.value)} className="input col-span-2" placeholder="Ud." />
                  <input type="number" min="0" value={item.cantidadRecibida ?? ''} onChange={e => updateItem(i, 'cantidadRecibida', e.target.value === '' ? undefined as any : parseFloat(e.target.value) || 0)} className="input col-span-3" placeholder="Recibido" />
                  <button onClick={() => removeItem(i)} className="col-span-1 text-gray-300 hover:text-red-500 transition-colors flex justify-center">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            <div className="text-xs text-gray-400 mt-1">Descripción · Cant. pedida · Unidad · Cant. recibida</div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Observaciones</label>
            <textarea value={form.observaciones || ''} onChange={e => setForm(f => ({ ...f, observaciones: e.target.value }))} className="input" rows={2} placeholder="Diferencias, daños, faltantes..." />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">Cancelar</button>
            <button onClick={handleSave} disabled={!form.numero || !form.proveedor} className="px-4 py-2 text-sm bg-amber-700 hover:bg-amber-800 text-white rounded-lg transition-colors disabled:opacity-50">
              {editing ? 'Guardar cambios' : 'Guardar remito'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
