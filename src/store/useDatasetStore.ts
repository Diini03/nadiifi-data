import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { get as idbGet, set as idbSet, del as idbDel } from "idb-keyval";
import type { Dataset, HistoryEntry, Operation, ExportEntry } from "@/lib/cleanlab/types";
import { applyOperation, operationLabel } from "@/lib/cleanlab/operations";

interface DatasetMeta {
  id: string;
  name: string;
  fileSize: number;
  rows: number;
  columns: number;
  createdAt: number;
  updatedAt: number;
  favorite?: boolean;
  pinned?: boolean;
}

interface DatasetStore {
  datasets: DatasetMeta[];
  currentId: string | null;
  current: Dataset | null;
  history: HistoryEntry[];
  future: HistoryEntry[];
  exports: ExportEntry[];
  loading: boolean;

  loadDataset: (id: string) => Promise<void>;
  addDataset: (ds: Dataset) => Promise<void>;
  removeDataset: (id: string) => Promise<void>;
  applyOp: (op: Operation) => Promise<void>;
  undo: () => Promise<void>;
  redo: () => Promise<void>;
  toggleFavorite: (id: string) => void;
  togglePinned: (id: string) => void;
  logExport: (entry: Omit<ExportEntry, "id" | "timestamp">) => void;
  clearAll: () => Promise<void>;
}

const dsKey = (id: string) => `cleanlab:dataset:${id}`;
const histKey = (id: string) => `cleanlab:history:${id}`;
const snapshotKey = (id: string, step: number) => `cleanlab:snap:${id}:${step}`;

export const useDatasetStore = create<DatasetStore>()(
  persist(
    (set, get) => ({
      datasets: [],
      currentId: null,
      current: null,
      history: [],
      future: [],
      exports: [],
      loading: false,

      loadDataset: async (id) => {
        set({ loading: true });
        const ds = (await idbGet(dsKey(id))) as Dataset | undefined;
        const hist = ((await idbGet(histKey(id))) as HistoryEntry[]) ?? [];
        set({ current: ds ?? null, currentId: ds ? id : null, history: hist, future: [], loading: false });
      },

      addDataset: async (ds) => {
        await idbSet(dsKey(ds.id), ds);
        await idbSet(snapshotKey(ds.id, 0), ds);
        await idbSet(histKey(ds.id), []);
        const meta: DatasetMeta = {
          id: ds.id,
          name: ds.name,
          fileSize: ds.fileSize,
          rows: ds.rows.length,
          columns: ds.columns.length,
          createdAt: ds.createdAt,
          updatedAt: ds.updatedAt,
        };
        set((s) => ({
          datasets: [meta, ...s.datasets.filter((d) => d.id !== ds.id)],
          current: ds,
          currentId: ds.id,
          history: [],
          future: [],
        }));
      },

      removeDataset: async (id) => {
        await idbDel(dsKey(id));
        await idbDel(histKey(id));
        set((s) => ({
          datasets: s.datasets.filter((d) => d.id !== id),
          current: s.currentId === id ? null : s.current,
          currentId: s.currentId === id ? null : s.currentId,
          history: s.currentId === id ? [] : s.history,
          future: s.currentId === id ? [] : s.future,
        }));
      },

      applyOp: async (op) => {
        const { current, history } = get();
        if (!current) return;
        const rowsBefore = current.rows.length;
        const next = applyOperation(current, op);
        const entry: HistoryEntry = {
          id: crypto.randomUUID(),
          operation: op,
          label: operationLabel(op),
          timestamp: Date.now(),
          rowsBefore,
          rowsAfter: next.rows.length,
        };
        const nextHistory = [...history, entry];
        await idbSet(dsKey(next.id), next);
        await idbSet(snapshotKey(next.id, nextHistory.length), next);
        await idbSet(histKey(next.id), nextHistory);
        set((s) => ({
          current: next,
          history: nextHistory,
          future: [],
          datasets: s.datasets.map((d) =>
            d.id === next.id
              ? { ...d, rows: next.rows.length, columns: next.columns.length, updatedAt: next.updatedAt }
              : d,
          ),
        }));
      },

      undo: async () => {
        const { current, history, future } = get();
        if (!current || history.length === 0) return;
        const step = history.length - 1;
        const snap = (await idbGet(snapshotKey(current.id, step))) as Dataset | undefined;
        if (!snap) return;
        const last = history[history.length - 1];
        const nextHistory = history.slice(0, -1);
        await idbSet(dsKey(current.id), snap);
        await idbSet(histKey(current.id), nextHistory);
        set({ current: snap, history: nextHistory, future: [last, ...future] });
      },

      redo: async () => {
        const { current, history, future } = get();
        if (!current || future.length === 0) return;
        const [entry, ...rest] = future;
        const next = applyOperation(current, entry.operation);
        const nextHistory = [...history, entry];
        await idbSet(dsKey(next.id), next);
        await idbSet(snapshotKey(next.id, nextHistory.length), next);
        await idbSet(histKey(next.id), nextHistory);
        set({ current: next, history: nextHistory, future: rest });
      },

      toggleFavorite: (id) =>
        set((s) => ({
          datasets: s.datasets.map((d) => (d.id === id ? { ...d, favorite: !d.favorite } : d)),
        })),

      togglePinned: (id) =>
        set((s) => ({
          datasets: s.datasets.map((d) => (d.id === id ? { ...d, pinned: !d.pinned } : d)),
        })),

      logExport: (entry) =>
        set((s) => ({
          exports: [
            { ...entry, id: crypto.randomUUID(), timestamp: Date.now() },
            ...s.exports,
          ].slice(0, 100),
        })),

      clearAll: async () => {
        const { datasets } = get();
        await Promise.all(
          datasets.flatMap((d) => [idbDel(dsKey(d.id)), idbDel(histKey(d.id))]),
        );
        set({ datasets: [], current: null, currentId: null, history: [], future: [], exports: [] });
      },
    }),
    {
      name: "cleanlab-index",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ datasets: s.datasets, exports: s.exports }),
    },
  ),
);
