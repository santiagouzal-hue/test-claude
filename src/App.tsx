import { useState, useRef } from 'react';
import Layout, { type Section } from './components/Layout';
import Dashboard from './components/Dashboard';
import Gastos from './components/Gastos';
import Pagos from './components/Pagos';
import Acopio from './components/Acopio';
import Facturas from './components/Facturas';
import Remitos from './components/Remitos';
import { useStore } from './store/useStore';
import './index.css';

export default function App() {
  const [section, setSection] = useState<Section>('dashboard');
  const store = useStore();
  const importRef = useRef<HTMLInputElement>(null);

  function handleImport() {
    importRef.current?.click();
  }

  function handleImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const ok = store.importData(ev.target?.result as string);
      if (ok) {
        alert('Datos importados correctamente.');
      } else {
        alert('Error al importar el archivo. Verificá que sea un backup válido.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  return (
    <>
      <input ref={importRef} type="file" accept=".json" onChange={handleImportFile} className="hidden" />
      <Layout current={section} onNavigate={setSection} onExport={store.exportData} onImport={handleImport}>
        {section === 'dashboard' && (
          <Dashboard state={store.state} onNavigate={(s) => setSection(s as Section)} />
        )}
        {section === 'gastos' && (
          <Gastos
            gastos={store.state.gastos}
            onAdd={store.addGasto}
            onUpdate={store.updateGasto}
            onDelete={store.deleteGasto}
          />
        )}
        {section === 'pagos' && (
          <Pagos
            pagos={store.state.pagos}
            onAdd={store.addPago}
            onUpdate={store.updatePago}
            onDelete={store.deletePago}
          />
        )}
        {section === 'acopio' && (
          <Acopio
            materiales={store.state.materiales}
            onAdd={store.addMaterial}
            onUpdate={store.updateMaterial}
            onDelete={store.deleteMaterial}
          />
        )}
        {section === 'facturas' && (
          <Facturas
            facturas={store.state.facturas}
            onAdd={store.addFactura}
            onUpdate={store.updateFactura}
            onDelete={store.deleteFactura}
          />
        )}
        {section === 'remitos' && (
          <Remitos
            remitos={store.state.remitos}
            onAdd={store.addRemito}
            onUpdate={store.updateRemito}
            onDelete={store.deleteRemito}
          />
        )}
      </Layout>
    </>
  );
}
