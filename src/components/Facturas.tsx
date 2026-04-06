import { useState, useMemo, useRef } from 'react';
import { Plus, Pencil, Trash2, Search, FileText, Download, Eye, Upload } from 'lucide-react';
import type { Factura, EstadoFactura } from '../types';
import Modal from './Modal';

const ESTADOS: EstadoFactura[] = ['vigente', 'cancelada', 'vencida'];
const ESTADO_STYLES: Record<EstadoFactura, string> = {
  vigente: 'bg-green-100 text-green-700',
  cancelada: 'bg-gray-100 text-gray-600',
  vencida: 'bg-red-100 text-red-700',
};

function fmt(n: number) {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n);
}

interface Props {
  facturas: Factura[];
  onAdd: (f: Omit<Factura, 'id'>) => void;
  onUpdate: (id: string, f: Partial<Factura>) => void;
  onDelete: (id: string) => void;
}

const empty = (): Omit<Factura, 'id'> => ({
  numero: '',
  fecha: new Date().toISOString().slice(0, 10),
  proveedor: '',
  concepto: '',
  monto: 0,
  estado: 'vigente',
  vencimiento: '',
  notas: '',
});

export default function Facturas({ facturas, onAdd, onUpdate, onDelete }: Props) {
  const [search, setSearch] = useState('');
  const [filterEstado, setFilterEstado] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Factura | null>(null);
  const [form, setForm] = useState<Omit<Factura, 'id'>>(empty());
  const [viewingFile, setViewingFile] = useState<Factura | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    let list = [...facturas].sort((a, b) => b.fecha.localeCompare(a.fecha));
    if (search) list = list.filter(f => f.numero.toLowerCase().includes(search.toLowerCase()) || f.proveedor.toLowerCase().includes(search.toLowerCase()) || f.concepto.toLowerCase().includes(search.toLowerCase()));
    if (filterEstado !== 'all') list = list.filter(f => f.estado === filterEstado);
    return list;
  }, [facturas, search, filterEstado]);

  const total = useMemo(() => facturas.reduce((s, f) => s + f.monto, 0), [facturas]);

  function openNew() { setEditing(null); setForm(empty()); setShowModal(true); }
  function openEdit(f: Factura) {
    setEditing(f);
    setForm({ numero: f.numero, fecha: f.fecha, proveedor: f.proveedor, concepto: f.concepto, monto: f.monto, estado: f.estado, archivo: f.archivo, archivoNombre: f.archivoNombre, vencimiento: f.vencimiento, notas: f.notas });
    setShowModal(true);
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      setForm(f => ({ ...f, archivo: ev.target?.result as string, archivoNombre: file.name }));
    };
    reader.readAsDataURL(file);
  }

  function handleSave() {
    if (!form.numero || !form.proveedor) return;
    if (editing) { onUpdate(editing.id, form); } else { onAdd(form); }
    setShowModal(false);
  }

  function downloadFile(f: Factura) {
    if (!f.archivo) return;
    const a = document.createElement('a');
    a.href = f.archivo;
    a.download = f.archivoNombre || `factura-${f.numero}`;
    a.click();
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Facturas</h1>
          <p className="text-sm text-gray-500 mt-0.5">Archivo digital de facturas de la obra</p>
        </div>
        <button onClick={openNew} className="flex items-center gap-2 bg-amber-700 hover:bg-amber-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          <Plus className="w-4 h-4" /> Nueva factura
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-lg border border-gray-200 p-3 text-center">
          <div className="text-xs text-gray-500">Total facturas</div>
          <div className="font-bold text-gray-900 text-xl mt-0.5">{facturas.length}</div>
        </div>
        <div className="bg-blue-50 rounded-lg border border-blue-200 p-3 text-center">
          <div className="text-xs text-blue-600">Monto total</div>
          <div className="font-bold text-blue-700 text-sm mt-0.5">{fmt(total)}</div>
        </div>
        <div className="bg-green-50 rounded-lg border border-green-200 p-3 text-center">
          <div className="text-xs text-green-600">Con archivo</div>
          <div className="font-bold text-green-700 text-xl mt-0.5">{facturas.filter(f => f.archivo).length}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por número, proveedor..." className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500" />
        </div>
        <select value={filterEstado} onChange={e => setFilterEstado(e.target.value)} className="text-sm border border-gray-200 rounded-lg px-2 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500">
          <option value="all">Todos los estados</option>
          {ESTADOS.map(e => <option key={e}>{e}</option>)}
        </select>
      </div>

      {/* List */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-12 text-center text-gray-400">
            <FileText className="w-10 h-10 mx-auto mb-2 opacity-40" />
            <p className="text-sm">No hay facturas registradas</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-4 py-3 font-medium text-gray-600">N° Factura</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Fecha</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Proveedor</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600 hidden md:table-cell">Concepto</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Monto</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-600">Estado</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-600">Archivo</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(f => (
                  <tr key={f.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-mono text-amber-700 font-medium">{f.numero}</td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{f.fecha}</td>
                    <td className="px-4 py-3 font-medium text-gray-800">{f.proveedor}</td>
                    <td className="px-4 py-3 text-gray-600 hidden md:table-cell truncate max-w-xs">{f.concepto}</td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-900">{fmt(f.monto)}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ESTADO_STYLES[f.estado]}`}>{f.estado}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {f.archivo ? (
                        <div className="flex items-center justify-center gap-1">
                          <button onClick={() => setViewingFile(f)} className="p-1 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors" title="Ver archivo">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button onClick={() => downloadFile(f)} className="p-1 text-green-600 hover:text-green-700 hover:bg-green-50 rounded transition-colors" title="Descargar">
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-300">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 justify-end">
                        <button onClick={() => openEdit(f)} className="p-1.5 text-gray-400 hover:text-amber-700 hover:bg-amber-50 rounded transition-colors">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => { if (confirm('¿Eliminar esta factura?')) onDelete(f.id); }} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* File viewer modal */}
      {viewingFile && viewingFile.archivo && (
        <Modal open={!!viewingFile} onClose={() => setViewingFile(null)} title={`Factura ${viewingFile.numero} - ${viewingFile.proveedor}`} wide>
          <div className="space-y-3">
            {viewingFile.archivo.startsWith('data:image') ? (
              <img src={viewingFile.archivo} alt="Factura" className="w-full rounded-lg border border-gray-200" />
            ) : viewingFile.archivo.startsWith('data:application/pdf') ? (
              <iframe src={viewingFile.archivo} className="w-full h-96 rounded-lg border border-gray-200" title="Factura PDF" />
            ) : (
              <div className="text-center py-8 text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">Vista previa no disponible para este tipo de archivo</p>
                <p className="text-xs text-gray-400 mt-1">{viewingFile.archivoNombre}</p>
              </div>
            )}
            <div className="flex justify-end">
              <button onClick={() => downloadFile(viewingFile)} className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                <Download className="w-4 h-4" /> Descargar
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Add/Edit modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title={editing ? 'Editar factura' : 'Nueva factura'}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">N° Factura *</label>
              <input value={form.numero} onChange={e => setForm(f => ({ ...f, numero: e.target.value }))} className="input" placeholder="0001-00012345" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Fecha</label>
              <input type="date" value={form.fecha} onChange={e => setForm(f => ({ ...f, fecha: e.target.value }))} className="input" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Proveedor *</label>
            <input value={form.proveedor} onChange={e => setForm(f => ({ ...f, proveedor: e.target.value }))} className="input" placeholder="Nombre del proveedor" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Concepto</label>
            <input value={form.concepto} onChange={e => setForm(f => ({ ...f, concepto: e.target.value }))} className="input" placeholder="Descripción de lo facturado" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Monto (ARS)</label>
              <input type="number" min="0" value={form.monto || ''} onChange={e => setForm(f => ({ ...f, monto: parseFloat(e.target.value) || 0 }))} className="input" placeholder="0" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Estado</label>
              <select value={form.estado} onChange={e => setForm(f => ({ ...f, estado: e.target.value as EstadoFactura }))} className="input">
                {ESTADOS.map(e => <option key={e}>{e}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Vencimiento</label>
            <input type="date" value={form.vencimiento || ''} onChange={e => setForm(f => ({ ...f, vencimiento: e.target.value }))} className="input" />
          </div>

          {/* File upload */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Archivo (imagen o PDF)</label>
            <input ref={fileRef} type="file" accept="image/*,.pdf" onChange={handleFile} className="hidden" />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-gray-200 hover:border-amber-400 text-gray-500 hover:text-amber-700 rounded-lg p-4 text-sm transition-colors"
            >
              <Upload className="w-5 h-5" />
              {form.archivoNombre ? form.archivoNombre : 'Subir archivo de factura'}
            </button>
            {form.archivo && (
              <button type="button" onClick={() => setForm(f => ({ ...f, archivo: undefined, archivoNombre: undefined }))} className="text-xs text-red-500 hover:text-red-700 mt-1">
                Quitar archivo
              </button>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Notas</label>
            <textarea value={form.notas || ''} onChange={e => setForm(f => ({ ...f, notas: e.target.value }))} className="input" rows={2} placeholder="Notas adicionales..." />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">Cancelar</button>
            <button onClick={handleSave} disabled={!form.numero || !form.proveedor} className="px-4 py-2 text-sm bg-amber-700 hover:bg-amber-800 text-white rounded-lg transition-colors disabled:opacity-50">
              {editing ? 'Guardar cambios' : 'Guardar factura'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
