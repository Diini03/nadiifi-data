import type { Dataset, Operation, CellValue } from './types';
import { applyOperation, operationLabel } from './operations';
import { isNullish } from './infer';

export const safeFormatting = (op: Operation) => ['trim', 'remove_extra_spaces'].includes(op.kind) || (op.kind === 'convert_type' && (op.to === 'float'));
export function previewOperations(before: Dataset, operations: Operation[]) {
  let after = before;
  for (const op of operations) after = applyOperation(after, op);
  const changes: { row: number; column: string; before: CellValue; after: CellValue }[] = [];
  before.rows.forEach((r, i) => Object.keys(r).forEach(column => {
    if (JSON.stringify(r[column]) !== JSON.stringify(after.rows[i]?.[column])) changes.push({row:i+1,column,before:r[column],after:after.rows[i]?.[column] ?? null});
  }));
  return { after, changes, operations };
}
export function applyApproved(before: Dataset, operations: Operation[]) {
  const { after, changes } = previewOperations(before, operations);
  const filled = operations.filter(o => o.kind === 'fill_null').reduce((n, o) => n + (o.kind === 'fill_null' ? before.rows.filter(r => isNullish(r[o.column])).length : 0), 0);
  return {...after, audit: [...(before.audit ?? []), {timestamp:Date.now(), labels:operations.map(operationLabel), operations, affectedRows:[...new Set(changes.map(c=>c.row))], cells:changes.length, filled, removed:Math.max(0,before.rows.length-after.rows.length)}]};
}
export function duplicateGroups(ds: Dataset) {
  const groups: {key:string; title:string; indices:number[]}[] = [];
  const exact = new Map<string, number[]>();
  ds.rows.forEach((r,i) => { const k = JSON.stringify(Object.keys(r).sort().map(c=>isNullish(r[c])?null:String(r[c]).trim().replace(/\s+/g,' ').toLowerCase())); exact.set(k,[...(exact.get(k)??[]),i]); });
  for (const [key,indices] of exact) if(indices.length>1) groups.push({key:`exact:${key}`,title:'Matching rows (spacing and case ignored)',indices});
  ds.columns.filter(c=>/(^|[ _])(id|order.?id|invoice.?no|record.?id)$|^(order|invoice|transaction)[ _](id|no|number)$/i.test(c.name)).forEach(c=>{
    const map=new Map<string,number[]>(); ds.rows.forEach((r,i)=>{if(isNullish(r[c.name]))return;const k=String(r[c.name]).trim().toLowerCase();map.set(k,[...(map.get(k)??[]),i]);});
    for(const [key,indices] of map) if(indices.length>1 && !groups.some(g=>JSON.stringify(g.indices)===JSON.stringify(indices))) groups.push({key:`key:${c.name}:${key}`,title:`Repeated ${c.name}: ${key} — may be legitimate line items`,indices});
  });
  return groups;
}
