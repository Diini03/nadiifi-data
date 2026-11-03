import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { Dataset, Operation } from '@/lib/cleanlab/types';
import { previewOperations } from '@/lib/cleanlab/review';
import { operationLabel } from '@/lib/cleanlab/operations';
export function ChangePreview({dataset, operations, onClose, onApprove}:{dataset:Dataset; operations:Operation[]; onClose:()=>void; onApprove:()=>void}) {
 const preview=previewOperations(dataset,operations);
 return <Dialog open onOpenChange={open=>!open&&onClose()}><DialogContent className="max-w-3xl max-h-[85dvh] overflow-auto"><DialogHeader><DialogTitle>Review proposed changes</DialogTitle></DialogHeader>
 <p className="text-sm text-muted-foreground">{preview.changes.length} cell changes · {Math.max(0,dataset.rows.length-preview.after.rows.length)} rows removed. Original values can be restored with Undo.</p>
 {operations.filter(op=>op.kind==="delete_rows").map((op,i)=>op.kind==="delete_rows"&&<p key={i} className="text-sm text-destructive">Delete rows: {op.indices.map(idx=>idx+1).join(", ")}</p>)}
 <ul className="text-sm">{operations.map((op,i)=><li key={i}>{operationLabel(op)}</li>)}</ul>
 <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr><th>Row</th><th>Column</th><th>Before</th><th>After</th></tr></thead><tbody>{preview.changes.slice(0,100).map((c,i)=><tr key={i} className="border-t border-border"><td>{c.row}</td><td>{c.column}</td><td className="p-2 font-mono">{String(c.before??'blank')}</td><td className="p-2 font-mono">{String(c.after??'blank')}</td></tr>)}</tbody></table></div>
 {preview.changes.length>100&&<p className="text-xs text-muted-foreground">First 100 changes shown; approval applies all {preview.changes.length} changes.</p>}
 <div className="flex justify-end gap-2"><Button variant="outline" onClick={onClose}>Cancel</Button><Button onClick={onApprove}>Approve changes</Button></div></DialogContent></Dialog>;
}
