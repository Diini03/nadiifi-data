import { useState } from 'react';
import type { Dataset } from '@/lib/cleanlab/types';
import { classifyDataset } from '@/lib/cleanlab/semantics';
import { analyticalChart } from '@/lib/cleanlab/analytical';
import { SpecChart } from '@/components/charts/SmartCharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
function Choice({label,value,items,onChange}:{label:string;value:string;items:string[];onChange:(s:string)=>void}){return <div><p className="mb-1 text-xs text-muted-foreground">{label}</p><Select value={value} onValueChange={onChange}><SelectTrigger aria-label={label}><SelectValue/></SelectTrigger><SelectContent>{items.map(i=><SelectItem key={i} value={i}>{i}</SelectItem>)}</SelectContent></Select></div>}
export function ChartExplorer({dataset}:{dataset:Dataset}){
 const columns=classifyDataset(dataset), dims=columns.filter(c=>c.isDimension||c.isTime), measures=columns.filter(c=>c.isMeasure||c.role==='identifier');
 const [dimension,setDimension]=useState(dims[0]?.name??''),[measure,setMeasure]=useState(measures[0]?.name??''),[agg,setAgg]=useState('count'),[grain,setGrain]=useState('month'),[top,setTop]=useState('10'),[sort,setSort]=useState('value');
 if(!dims.length)return null;
 let spec;let error;try{spec=analyticalChart(dataset,dimension,measure,agg as 'sum'|'avg'|'count'|'distinct',grain as 'day'|'month'|'year',Number(top),sort as 'label'|'value');}catch(e){error=e instanceof Error?e.message:'Choose another aggregation';}
 return <section className="space-y-4 border-t border-border pt-5"><h2 className="font-display text-lg font-semibold">Explore a comparison</h2><div className="grid gap-3 sm:grid-cols-3"><Choice label="Dimension" value={dimension} items={dims.map(c=>c.name)} onChange={setDimension}/>{measures.length>0&&<Choice label="Measure" value={measure} items={measures.map(c=>c.name)} onChange={setMeasure}/>}<Choice label="Aggregation" value={agg} items={['count','distinct','avg','sum']} onChange={setAgg}/><Choice label="Date grain" value={grain} items={['day','month','year']} onChange={setGrain}/><Choice label="Top categories" value={top} items={['5','10','20']} onChange={setTop}/><Choice label="Sort" value={sort} items={['value','label']} onChange={setSort}/></div>{error&&<p className="text-sm text-destructive">{error}</p>}{spec&&<><h3 className="font-semibold">{spec.title}</h3><p className="text-xs text-muted-foreground">{spec.subtitle}</p><SpecChart spec={spec}/></>}</section>;
}
