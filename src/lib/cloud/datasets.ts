import { supabase } from "@/integrations/supabase/client";
import type { Dataset } from "@/lib/cleanlab/types";

export interface SavedDatasetRow {
  id: string;
  name: string;
  file_size: number;
  row_count: number;
  column_count: number;
  updated_at: string;
  created_at: string;
}

export async function listSavedDatasets(): Promise<SavedDatasetRow[]> {
  const { data, error } = await supabase
    .from("saved_datasets")
    .select("id,name,file_size,row_count,column_count,updated_at,created_at")
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as SavedDatasetRow[];
}

export async function loadSavedDataset(id: string): Promise<Dataset | null> {
  const { data, error } = await supabase
    .from("saved_datasets")
    .select("payload")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return (data?.payload as unknown as Dataset) ?? null;
}

export async function upsertSavedDataset(userId: string, ds: Dataset): Promise<void> {
  const { error } = await supabase.from("saved_datasets").upsert(
    {
      id: ds.id,
      user_id: userId,
      name: ds.name,
      file_size: ds.fileSize,
      row_count: ds.rows.length,
      column_count: ds.columns.length,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      payload: ds as any,
    },
    { onConflict: "id" },
  );
  if (error) throw error;
}

export async function deleteSavedDataset(id: string): Promise<void> {
  const { error } = await supabase.from("saved_datasets").delete().eq("id", id);
  if (error) throw error;
}
