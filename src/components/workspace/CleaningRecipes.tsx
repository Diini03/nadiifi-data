import { useEffect, useMemo, useState } from 'react';
import { BookOpen, Save, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { operationLabel } from '@/lib/cleanlab/operations';
import { createRecipe, recipeCandidates, prepareRecipe, type CleaningRecipe } from '@/lib/cleanlab/recipes';
import { loadRecipes, saveRecipe, deleteRecipe } from '@/lib/cleanlab/recipeStorage';
import type { Dataset, Operation } from '@/lib/cleanlab/types';

export function CleaningRecipes({ dataset, owner, onPreview }: { dataset: Dataset; owner?: string; onPreview: (operations: Operation[]) => void }) {
  const [recipes, setRecipes] = useState<CleaningRecipe[]>([]);
  const [ready, setReady] = useState(false);
  const [saveOpen, setSaveOpen] = useState(false);
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveSelection, setSaveSelection] = useState<number[]>([]);
  const [active, setActive] = useState<CleaningRecipe | null>(null);
  const [selection, setSelection] = useState<number[]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [deleteTarget, setDeleteTarget] = useState<CleaningRecipe | null>(null);
  const candidates = useMemo(() => recipeCandidates(dataset), [dataset]);
  const prepared = useMemo(() => active ? prepareRecipe(dataset, active, mapping, selection) : null, [dataset, active, mapping, selection]);
  useEffect(() => {
    let live = true;
    setReady(false); setRecipes([]); setActive(null); setSaveOpen(false);
    loadRecipes(owner).then(value => { if (live) { setRecipes(value); setReady(true); } })
      .catch(() => toast.error('Could not load saved recipes.'));
    return () => { live = false; };
  }, [owner]);
  const toggle = (values: number[], index: number) => values.includes(index) ? values.filter(i => i !== index) : [...values, index];
  const openRecipe = (recipe: CleaningRecipe) => {
    setActive(recipe); setSelection(recipe.operations.map((_, i) => i));
    const initial: Record<string, string> = {};
    for (const op of recipe.operations) if ('column' in op && op.column) {
      initial[op.column] = dataset.columns.some(c => c.name === op.column) ? op.column : '';
    }
    setMapping(initial);
  };
  const save = async () => {
    setSaving(true);
    try {
      const recipe = createRecipe(name, candidates.filter((_, i) => saveSelection.includes(i)));
      await saveRecipe(recipe, owner);
      setRecipes(await loadRecipes(owner)); setSaveOpen(false);
      toast.success('Cleaning recipe saved in this browser');
    } catch (error) { toast.error(error instanceof Error ? error.message : 'Could not save recipe.'); }
    finally { setSaving(false); }
  };
  const remove = async () => {
    if (!deleteTarget) return;
    setSaving(true);
    try { await deleteRecipe(deleteTarget.id, owner); setRecipes(await loadRecipes(owner)); setDeleteTarget(null); }
    catch { toast.error('Could not delete recipe.'); }
    finally { setSaving(false); }
  };
  return <section aria-label="Cleaning recipes" className="border-b border-border pb-4">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-2"><BookOpen className="h-4 w-4 text-primary" /><h2 className="font-display text-lg font-semibold">Cleaning recipes</h2><span className="text-xs text-muted-foreground">This browser only</span></div>
      <Button variant="outline" size="sm" disabled={!ready || !candidates.length} onClick={() => { setName(`${dataset.name} cleanup`.slice(0,80)); setSaveSelection(candidates.map((_, i) => i)); setSaveOpen(true); }}><Save className="mr-2 h-4 w-4" />Save recipe</Button>
    </div>
    {!recipes.length && <p className="mt-2 text-sm text-muted-foreground">{ready ? 'No saved recipes' : 'Loading recipes…'}</p>}
    <div className="mt-3 grid gap-2 sm:grid-cols-2">
      {recipes.map(recipe => <div key={recipe.id} className="flex min-w-0 items-center gap-2 rounded-md border border-border bg-card p-3">
        <div className="min-w-0 flex-1"><h3 className="break-words text-sm font-medium">{recipe.name}</h3><p className="text-xs text-muted-foreground">{recipe.operations.length} rules · {new Date(recipe.createdAt).toLocaleDateString()}</p></div>
        <Button size="sm" variant="outline" onClick={() => openRecipe(recipe)}>Use recipe</Button>
        <Button size="icon" variant="ghost" aria-label={`Delete recipe ${recipe.name}`} title="Delete recipe" onClick={() => setDeleteTarget(recipe)}><Trash2 className="h-4 w-4" /></Button>
      </div>)}
    </div>
    <Dialog open={saveOpen} onOpenChange={open => { if (!saving) setSaveOpen(open); }}><DialogContent className="max-h-[85dvh] overflow-y-auto"><DialogHeader><DialogTitle>Save cleaning recipe</DialogTitle><DialogDescription>Approved rules only. Row deletions and dropped columns are excluded. Saved rules may contain your custom labels and fill constants.</DialogDescription></DialogHeader>
      <Label htmlFor="recipe-name">Recipe name</Label><Input id="recipe-name" maxLength={80} value={name} onChange={e => setName(e.target.value)} />
      <div className="space-y-3">{candidates.map((op, i) => <label key={i} className="flex items-start gap-3 text-sm"><Checkbox aria-label={`Save rule ${i + 1}`} checked={saveSelection.includes(i)} onCheckedChange={() => setSaveSelection(values => toggle(values, i))} /><span>{i+1}. {operationLabel(op)}{op.kind === 'fill_null' && op.strategy !== 'constant' && <span className="block text-xs text-muted-foreground">Recalculated from each new file; still an estimate.</span>}</span></label>)}</div>
      <div className="flex justify-end gap-2"><Button variant="outline" disabled={saving} onClick={() => setSaveOpen(false)}>Cancel</Button><Button onClick={save} disabled={saving || !name.trim() || !saveSelection.length}>{saving ? 'Saving…' : 'Save recipe'}</Button></div>
    </DialogContent></Dialog>
    <Dialog open={!!active} onOpenChange={open => { if (!open) setActive(null); }}><DialogContent className="max-h-[85dvh] overflow-y-auto"><DialogHeader><DialogTitle>Use {active?.name}</DialogTitle><DialogDescription>Choose rules and destination columns. Fills are estimates; dates retain the recipe’s date-order choice.</DialogDescription></DialogHeader>
      <div className="space-y-3">{Object.keys(mapping).map(column => <div key={column} className="grid items-center gap-2 sm:grid-cols-2"><Label className="break-words">{column}</Label><Select value={mapping[column] || '__unmapped__'} onValueChange={value => setMapping(m => ({...m, [column]: value === '__unmapped__' ? '' : value}))}><SelectTrigger aria-label={`Map ${column}`}><SelectValue /></SelectTrigger><SelectContent><SelectItem value="__unmapped__">Choose a column</SelectItem>{dataset.columns.map(c => <SelectItem key={c.name} value={c.name}>{c.name}</SelectItem>)}</SelectContent></Select></div>)}</div>
      <div className="space-y-3 border-t border-border pt-3">{active?.operations.map((op, i) => <label key={i} className="flex items-start gap-3 text-sm"><Checkbox checked={selection.includes(i)} aria-label={`Use rule ${i+1}`} onCheckedChange={() => setSelection(values => toggle(values, i))} /><span>{i+1}. {operationLabel(op)}</span></label>)}</div>
      {!!prepared?.problems.length && <ul role="alert" className="space-y-1 text-sm text-destructive">{prepared.problems.map(problem => <li key={problem}>{problem}</li>)}</ul>}
      <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setActive(null)}>Cancel</Button><Button disabled={!prepared?.operations.length || !!prepared.problems.length} onClick={() => { if (prepared && !prepared.problems.length) { onPreview(prepared.operations); setActive(null); } }}>Preview recipe</Button></div>
    </DialogContent></Dialog>
    <Dialog open={!!deleteTarget} onOpenChange={open => { if (!saving && !open) setDeleteTarget(null); }}><DialogContent><DialogHeader><DialogTitle>Delete recipe?</DialogTitle><DialogDescription>Remove “{deleteTarget?.name}” from this browser? Your datasets will not change.</DialogDescription></DialogHeader><div className="flex justify-end gap-2"><Button variant="outline" disabled={saving} onClick={() => setDeleteTarget(null)}>Cancel</Button><Button variant="destructive" disabled={saving} onClick={remove}>Delete recipe</Button></div></DialogContent></Dialog>
  </section>;
}