import { useState } from 'react';
import {
  LayoutDashboard,
  Receipt,
  CreditCard,
  Package,
  FileText,
  ClipboardList,
  Menu,
  X,
  HardHat,
  Download,
  Upload,
} from 'lucide-react';

type Section = 'dashboard' | 'gastos' | 'pagos' | 'acopio' | 'facturas' | 'remitos';

interface LayoutProps {
  current: Section;
  onNavigate: (s: Section) => void;
  onExport: () => void;
  onImport: () => void;
  children: React.ReactNode;
}

const NAV_ITEMS: { id: Section; label: string; icon: React.ElementType }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'gastos', label: 'Gastos', icon: Receipt },
  { id: 'pagos', label: 'Pagos', icon: CreditCard },
  { id: 'acopio', label: 'Acopio / Materiales', icon: Package },
  { id: 'facturas', label: 'Facturas', icon: FileText },
  { id: 'remitos', label: 'Remitos', icon: ClipboardList },
];

export default function Layout({ current, onNavigate, onExport, onImport, children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-amber-900 text-white flex flex-col transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 lg:static lg:flex`}
      >
        <div className="flex items-center gap-3 px-5 py-5 border-b border-amber-800">
          <HardHat className="w-8 h-8 text-amber-300 shrink-0" />
          <div>
            <div className="font-bold text-lg leading-tight">Mi Obra</div>
            <div className="text-xs text-amber-300 leading-tight">Gestión de Construcción</div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="ml-auto lg:hidden text-amber-300 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 py-4 overflow-y-auto">
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => { onNavigate(id); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-5 py-3 text-sm font-medium transition-colors ${
                current === id
                  ? 'bg-amber-700 text-white border-r-4 border-amber-300'
                  : 'text-amber-100 hover:bg-amber-800'
              }`}
            >
              <Icon className="w-5 h-5 shrink-0" />
              {label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-amber-800 flex flex-col gap-2">
          <button
            onClick={onExport}
            className="flex items-center gap-2 px-3 py-2 text-xs text-amber-200 hover:text-white hover:bg-amber-800 rounded transition-colors"
          >
            <Download className="w-4 h-4" />
            Exportar datos
          </button>
          <button
            onClick={onImport}
            className="flex items-center gap-2 px-3 py-2 text-xs text-amber-200 hover:text-white hover:bg-amber-800 rounded transition-colors"
          >
            <Upload className="w-4 h-4" />
            Importar datos
          </button>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar (mobile) */}
        <header className="lg:hidden flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-200 sticky top-0 z-20">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg text-gray-600 hover:bg-gray-100"
          >
            <Menu className="w-5 h-5" />
          </button>
          <HardHat className="w-6 h-6 text-amber-700" />
          <span className="font-bold text-gray-800">Mi Obra</span>
        </header>

        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

export type { Section };
