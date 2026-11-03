import { useEffect, useRef, useState } from 'react';
import { get, set, del } from 'idb-keyval';
import type { Dataset } from '@/lib/cleanlab/types';
import { upsertSavedDataset } from './datasets';
import { createSaveQueue } from './saveQueue';
const serializedSave=createSaveQueue((v:{userId:string;ds:Dataset})=>upsertSavedDataset(v.userId,v.ds));
export type WorkspaceDraft = {dataset:Dataset; step:string; undo:Dataset[]};
export function useWorkspacePersistence(userId:string|undefined, dataset:Dataset|null, step:string, undo:Dataset[], restore:(draft:WorkspaceDraft)=>void) {
 const [status,setStatus]=useState('Local only'); const [ready,setReady]=useState(false); const revision=useRef(0);
 const queue=useRef(serializedSave);
 const restoreRef=useRef(restore); restoreRef.current=restore;
 useEffect(()=>{let live=true; get<WorkspaceDraft>('nadiifi:active-workflow').then(d=>{if(live&&d)restoreRef.current(d);}).finally(()=>{if(live)setReady(true);});return()=>{live=false;};},[]);
 const save=()=>{
  if(!dataset||!userId){setStatus('Local only');return;}
  const version=++revision.current;setStatus('Saving');
  queue.current({userId,ds:dataset}).then(()=>{if(version===revision.current)setStatus('Saved');}).catch(()=>{if(version===revision.current)setStatus('Save failed');});
 };
 useEffect(()=>{if(!ready)return;if(dataset) void set('nadiifi:active-workflow',{dataset,step,undo});else void del('nadiifi:active-workflow');},[dataset,step,undo,ready]);
 useEffect(()=>{if(ready)save();},[dataset,userId,ready]);
 return {status,retry:save};
}
