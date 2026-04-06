import { useState, useEffect, useCallback } from 'react';
import type { AppState, Gasto, Pago, Material, Factura, Remito, Presupuesto } from '../types';

const STORAGE_KEY = 'obra-casa-data';

const defaultPresupuesto: Presupuesto = {
  total: 0,
  categorias: {
    Materiales: 0,
    'Mano de obra': 0,
    Herramientas: 0,
    Servicios: 0,
    Honorarios: 0,
    Imprevistos: 0,
    Otros: 0,
  },
};

const defaultState: AppState = {
  gastos: [],
  pagos: [],
  materiales: [],
  facturas: [],
  remitos: [],
  presupuesto: defaultPresupuesto,
};

function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState;
    const parsed = JSON.parse(raw);
    return {
      ...defaultState,
      ...parsed,
      presupuesto: { ...defaultPresupuesto, ...parsed.presupuesto },
    };
  } catch {
    return defaultState;
  }
}

function saveState(state: AppState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // storage full or unavailable
  }
}

function genId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

export function useStore() {
  const [state, setState] = useState<AppState>(loadState);

  useEffect(() => {
    saveState(state);
  }, [state]);

  const addGasto = useCallback((gasto: Omit<Gasto, 'id'>) => {
    setState(s => ({ ...s, gastos: [...s.gastos, { ...gasto, id: genId() }] }));
  }, []);

  const updateGasto = useCallback((id: string, gasto: Partial<Gasto>) => {
    setState(s => ({
      ...s,
      gastos: s.gastos.map(g => (g.id === id ? { ...g, ...gasto } : g)),
    }));
  }, []);

  const deleteGasto = useCallback((id: string) => {
    setState(s => ({ ...s, gastos: s.gastos.filter(g => g.id !== id) }));
  }, []);

  const addPago = useCallback((pago: Omit<Pago, 'id'>) => {
    setState(s => ({ ...s, pagos: [...s.pagos, { ...pago, id: genId() }] }));
  }, []);

  const updatePago = useCallback((id: string, pago: Partial<Pago>) => {
    setState(s => ({
      ...s,
      pagos: s.pagos.map(p => (p.id === id ? { ...p, ...pago } : p)),
    }));
  }, []);

  const deletePago = useCallback((id: string) => {
    setState(s => ({ ...s, pagos: s.pagos.filter(p => p.id !== id) }));
  }, []);

  const addMaterial = useCallback((material: Omit<Material, 'id'>) => {
    setState(s => ({ ...s, materiales: [...s.materiales, { ...material, id: genId() }] }));
  }, []);

  const updateMaterial = useCallback((id: string, material: Partial<Material>) => {
    setState(s => ({
      ...s,
      materiales: s.materiales.map(m => (m.id === id ? { ...m, ...material } : m)),
    }));
  }, []);

  const deleteMaterial = useCallback((id: string) => {
    setState(s => ({ ...s, materiales: s.materiales.filter(m => m.id !== id) }));
  }, []);

  const addFactura = useCallback((factura: Omit<Factura, 'id'>) => {
    setState(s => ({ ...s, facturas: [...s.facturas, { ...factura, id: genId() }] }));
  }, []);

  const updateFactura = useCallback((id: string, factura: Partial<Factura>) => {
    setState(s => ({
      ...s,
      facturas: s.facturas.map(f => (f.id === id ? { ...f, ...factura } : f)),
    }));
  }, []);

  const deleteFactura = useCallback((id: string) => {
    setState(s => ({ ...s, facturas: s.facturas.filter(f => f.id !== id) }));
  }, []);

  const addRemito = useCallback((remito: Omit<Remito, 'id'>) => {
    setState(s => ({ ...s, remitos: [...s.remitos, { ...remito, id: genId() }] }));
  }, []);

  const updateRemito = useCallback((id: string, remito: Partial<Remito>) => {
    setState(s => ({
      ...s,
      remitos: s.remitos.map(r => (r.id === id ? { ...r, ...remito } : r)),
    }));
  }, []);

  const deleteRemito = useCallback((id: string) => {
    setState(s => ({ ...s, remitos: s.remitos.filter(r => r.id !== id) }));
  }, []);

  const updatePresupuesto = useCallback((presupuesto: Presupuesto) => {
    setState(s => ({ ...s, presupuesto }));
  }, []);

  const exportData = useCallback(() => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `obra-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [state]);

  const importData = useCallback((data: string) => {
    try {
      const parsed = JSON.parse(data);
      setState({ ...defaultState, ...parsed, presupuesto: { ...defaultPresupuesto, ...parsed.presupuesto } });
      return true;
    } catch {
      return false;
    }
  }, []);

  return {
    state,
    addGasto, updateGasto, deleteGasto,
    addPago, updatePago, deletePago,
    addMaterial, updateMaterial, deleteMaterial,
    addFactura, updateFactura, deleteFactura,
    addRemito, updateRemito, deleteRemito,
    updatePresupuesto,
    exportData, importData,
  };
}
