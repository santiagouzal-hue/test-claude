import { useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Package,
  FileText,
  AlertCircle,
  CheckCircle,
  Clock,
} from 'lucide-react';
import type { AppState } from '../types';

interface Props {
  state: AppState;
  onNavigate: (s: string) => void;
}

function fmt(n: number) {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n);
}

function pct(used: number, total: number) {
  if (!total) return 0;
  return Math.min(100, (used / total) * 100);
}

const CATEGORY_COLORS: Record<string, string> = {
  Materiales: 'bg-blue-500',
  'Mano de obra': 'bg-green-500',
  Herramientas: 'bg-yellow-500',
  Servicios: 'bg-purple-500',
  Honorarios: 'bg-pink-500',
  Imprevistos: 'bg-red-500',
  Otros: 'bg-gray-500',
};

export default function Dashboard({ state, onNavigate }: Props) {
  const stats = useMemo(() => {
    const totalGastos = state.gastos.reduce((s, g) => s + g.monto, 0);
    const gastosPagados = state.gastos.filter(g => g.estado === 'pagado').reduce((s, g) => s + g.monto, 0);
    const gastosPendientes = state.gastos.filter(g => g.estado === 'pendiente').reduce((s, g) => s + g.monto, 0);
    const totalMateriales = state.materiales.reduce((s, m) => s + m.precioTotal, 0);
    const porCategoria: Record<string, number> = {};
    state.gastos.forEach(g => {
      porCategoria[g.categoria] = (porCategoria[g.categoria] || 0) + g.monto;
    });
    const remitosConDif = state.remitos.filter(r => r.estado === 'con_diferencias').length;
    const remitosRecibidos = state.remitos.filter(r => r.estado === 'recibido').length;
    const remitosPendientes = state.remitos.filter(r => r.estado === 'pendiente').length;
    const facturasPendientes = state.facturas.filter(f => f.estado === 'vigente').length;

    const recentActivity = [
      ...state.gastos.slice(-3).map(g => ({ type: 'gasto' as const, item: g, date: g.fecha })),
      ...state.pagos.slice(-3).map(p => ({ type: 'pago' as const, item: p, date: p.fecha })),
    ].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);

    return {
      totalGastos,
      gastosPagados,
      gastosPendientes,
      totalMateriales,
      porCategoria,
      remitosConDif,
      remitosRecibidos,
      remitosPendientes,
      facturasPendientes,
      recentActivity,
    };
  }, [state]);

  const presupuestoTotal = state.presupuesto.total;
  const usedPct = pct(stats.totalGastos, presupuestoTotal);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-0.5">Resumen general de la obra</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Gastos"
          value={fmt(stats.totalGastos)}
          sub={presupuestoTotal ? `de ${fmt(presupuestoTotal)} presupuestado` : 'Sin presupuesto cargado'}
          icon={TrendingUp}
          color="amber"
        />
        <StatCard
          title="Pagado"
          value={fmt(stats.gastosPagados)}
          sub={`${state.gastos.filter(g => g.estado === 'pagado').length} gastos`}
          icon={CheckCircle}
          color="green"
        />
        <StatCard
          title="Pendiente de Pago"
          value={fmt(stats.gastosPendientes)}
          sub={`${state.gastos.filter(g => g.estado === 'pendiente').length} gastos`}
          icon={Clock}
          color="orange"
        />
        <StatCard
          title="Acopio / Materiales"
          value={fmt(stats.totalMateriales)}
          sub={`${state.materiales.length} ítems registrados`}
          icon={Package}
          color="blue"
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Budget progress */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-800 mb-4">Avance de Presupuesto</h2>
          {presupuestoTotal ? (
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Ejecutado</span>
                  <span className="font-medium">{usedPct.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all ${usedPct > 90 ? 'bg-red-500' : usedPct > 70 ? 'bg-amber-500' : 'bg-green-500'}`}
                    style={{ width: `${usedPct}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>{fmt(stats.totalGastos)}</span>
                  <span>{fmt(presupuestoTotal)}</span>
                </div>
              </div>
              <div className="pt-2 border-t border-gray-100">
                <div className="text-sm font-medium text-gray-700 mb-3">Por categoría</div>
                <div className="space-y-2">
                  {Object.entries(stats.porCategoria)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 5)
                    .map(([cat, val]) => (
                      <div key={cat} className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full shrink-0 ${CATEGORY_COLORS[cat] || 'bg-gray-400'}`} />
                        <span className="text-xs text-gray-600 flex-1 truncate">{cat}</span>
                        <span className="text-xs font-medium text-gray-800">{fmt(val)}</span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center py-6 text-gray-400">
              <TrendingDown className="w-10 h-10 mb-2" />
              <p className="text-sm">No hay presupuesto configurado</p>
              <p className="text-xs mt-1">Ingresá los gastos para ver el progreso</p>
            </div>
          )}
        </div>

        {/* Quick status */}
        <div className="space-y-4">
          {/* Remitos */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-gray-800">Remitos</h2>
              <button onClick={() => onNavigate('remitos')} className="text-xs text-amber-700 hover:underline">
                Ver todos
              </button>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <StatusBadge label="Pendientes" count={stats.remitosPendientes} color="yellow" />
              <StatusBadge label="Recibidos" count={stats.remitosRecibidos} color="green" />
              <StatusBadge label="Con diferencias" count={stats.remitosConDif} color="red" />
            </div>
          </div>

          {/* Facturas */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-gray-800">Facturas</h2>
              <button onClick={() => onNavigate('facturas')} className="text-xs text-amber-700 hover:underline">
                Ver todas
              </button>
            </div>
            <div className="flex items-center gap-3">
              <FileText className="w-8 h-8 text-blue-500" />
              <div>
                <div className="text-xl font-bold text-gray-800">{state.facturas.length}</div>
                <div className="text-xs text-gray-500">{stats.facturasPendientes} vigentes</div>
              </div>
            </div>
          </div>

          {/* Alerts */}
          {stats.remitosConDif > 0 && (
            <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-medium text-red-800">
                  {stats.remitosConDif} remito{stats.remitosConDif > 1 ? 's' : ''} con diferencias
                </div>
                <div className="text-xs text-red-600 mt-0.5">Revisá los remitos pendientes de aclaración.</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recent activity */}
      {stats.recentActivity.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-800 mb-4">Actividad Reciente</h2>
          <div className="space-y-3">
            {stats.recentActivity.map(({ type, item, date }) => (
              <div key={item.id} className="flex items-center gap-3 text-sm">
                <div
                  className={`w-2 h-2 rounded-full shrink-0 ${type === 'gasto' ? 'bg-amber-500' : 'bg-green-500'}`}
                />
                <span className="text-gray-500 shrink-0 text-xs w-24">{date}</span>
                <span className="text-gray-700 flex-1 truncate">
                  {type === 'gasto' ? (item as any).descripcion : (item as any).concepto}
                </span>
                <span className="font-medium text-gray-800 shrink-0">{fmt((item as any).monto)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({
  title, value, sub, icon: Icon, color,
}: {
  title: string; value: string; sub: string; icon: React.ElementType; color: string;
}) {
  const colors: Record<string, string> = {
    amber: 'bg-amber-100 text-amber-700',
    green: 'bg-green-100 text-green-700',
    orange: 'bg-orange-100 text-orange-700',
    blue: 'bg-blue-100 text-blue-700',
  };
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="text-xs text-gray-500 font-medium truncate">{title}</div>
          <div className="text-lg font-bold text-gray-900 mt-1 truncate">{value}</div>
          <div className="text-xs text-gray-400 mt-0.5 truncate">{sub}</div>
        </div>
        <div className={`p-2 rounded-lg shrink-0 ${colors[color] || colors.amber}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ label, count, color }: { label: string; count: number; color: string }) {
  const colors: Record<string, string> = {
    yellow: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    green: 'bg-green-50 text-green-700 border-green-200',
    red: 'bg-red-50 text-red-700 border-red-200',
  };
  return (
    <div className={`border rounded-lg p-2 text-center ${colors[color]}`}>
      <div className="text-lg font-bold">{count}</div>
      <div className="text-xs leading-tight">{label}</div>
    </div>
  );
}
