import type { CellValue, Dataset } from './types';
import { classifyDataset } from './semantics';
import { coerceNumber, isNullish } from './infer';
import { parseDateSmart } from './dates';
import type { ChartSpec } from './recommend';
export function filterDataset(ds:Dataset,column:string,value:string):Dataset {
 return !column || !value ? ds : {...ds, rows:ds.rows.filter(r=>String(r[column]??'')===value)};
}
export function analyticalChart(ds:Dataset,dimension:string,measure:string,aggregation:'sum'|'avg'|'count'|'distinct',grain:'day'|'month'|'year',top:number,sort:'value'|'label'):ChartSpec {
 const cols=classifyDataset(ds), dim=cols.find(c=>c.name===dimension), m=cols.find(c=>c.name===measure);
 if((aggregation==='avg'||aggregation==='sum')&&!m?.isMeasure) throw new Error('Choose a numeric measure; identifiers cannot be averaged or summed.');
 if(aggregation==='sum'&&(!m?.isMeasure||m.role==='percentage'||m.role==='duration'||/price|score|rate|rating|age|gpa/i.test(measure))) throw new Error('This column cannot be summed; use average or distinct count.');
 const groups=new Map<string,{sum:number;count:number;values:Set<string>}>();let included=0;
 for(const row of ds.rows){
  if(isNullish(row[dimension]))continue;
  let label=String(row[dimension]);
  if(dim?.isTime){const date=parseDateSmart(row[dimension],false);if(!date)continue;label=date.slice(0,grain==='year'?4:grain==='month'?7:10);}
  const n=coerceNumber(row[measure]);if((aggregation==='avg'||aggregation==='sum')&&n===null)continue;
  const g=groups.get(label)??{sum:0,count:0,values:new Set<string>()};g.sum+=n??0;g.count++;if(!isNullish(row[measure]))g.values.add(JSON.stringify(row[measure]));groups.set(label,g);included++;
 }
 const value=(g:{sum:number;count:number;values:Set<string>})=>aggregation==='count'?g.count:aggregation==='distinct'?g.values.size:aggregation==='avg'?g.sum/g.count:g.sum;
 const entries=[...groups].sort((a,b)=>sort==='label'?a[0].localeCompare(b[0]):value(b[1])-value(a[1]));
 const selected=entries.slice(0,top), remainder=entries.slice(top);
 if(remainder.length){const rest={sum:0,count:0,values:new Set<string>()};for(const [,g] of remainder){rest.sum+=g.sum;rest.count+=g.count;g.values.forEach(v=>rest.values.add(v));}selected.push(['Other (remaining groups)',rest]);}
 return {id:'custom',kind:dim?.isTime?'line':'bar',title:`${aggregation==='count'?'Records':`${aggregation} ${measure}`} by ${dimension}`,subtitle:`${aggregation} · ${included} included / ${ds.rows.length-included} excluded · ${dim?.isTime?'UTC calendar '+grain:'top '+top+' + remainder'}`,why:'Calculated from the current approved values without silently merging categories.',confidence:1,dimension,measure,aggregation:aggregation==='distinct'?'count':aggregation,data:selected.map(([label,g])=>({label,value:aggregation==='count'?g.count:aggregation==='distinct'?g.values.size:aggregation==='avg'?g.sum/g.count:g.sum}))};
}
