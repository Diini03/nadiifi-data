import type { Dataset, Operation } from './types';
import { applyOperation } from './operations';

export interface CleaningRecipe {
  id: string;
  name: string;
  createdAt: number;
  operations: Operation[];
}

/** Row positions and destructive decisions must never carry into a different file. */
export function reusableOperation(op: Operation): boolean {
  return ['trim', 'remove_extra_spaces', 'lowercase', 'uppercase', 'titlecase',
    'convert_type', 'replace', 'standardize_categories', 'map_values', 'parse_date', 'fill_null'].includes(op.kind);
}

export function recipeCandidates(dataset: Dataset): Operation[] {
  return (dataset.audit ?? []).flatMap(entry => entry.operations).filter(reusableOperation).map(op => {
    // Estimates belong to the destination dataset, never to a previous file.
    if (op.kind === 'fill_null' && op.strategy !== 'constant') {
      return { kind: op.kind, column: op.column, strategy: op.strategy };
    }
    return structuredClone(op);
  });
}

export function createRecipe(name: string, operations: Operation[]): CleaningRecipe {
  const cleanName = name.trim();
  if (!cleanName || cleanName.length > 80) throw new Error('Use a recipe name between 1 and 80 characters.');
  if (!operations.length || operations.some(op => !reusableOperation(op))) {
    throw new Error('Choose reusable cleaning rules; row and column deletion cannot be saved.');
  }
  return { id: crypto.randomUUID(), name: cleanName, createdAt: Date.now(), operations: structuredClone(operations) };
}

export function prepareRecipe(dataset: Dataset, recipe: CleaningRecipe, mapping: Record<string, string>, selected: number[]) {
  const columns = new Set(dataset.columns.map(c => c.name));
  const operations: Operation[] = [];
  const problems: string[] = [];
  let working = dataset;
  for (const index of [...new Set(selected)].sort((a, b) => a - b)) {
    const source = recipe.operations[index];
    if (!source || !reusableOperation(source) || !('column' in source) || !source.column) {
      problems.push('This rule cannot be reused.');
      continue;
    }
    const column = mapping[source.column];
    if (!column || !columns.has(column)) {
      problems.push(`Choose a destination column for ${source.column}.`);
      continue;
    }
    let op = { ...structuredClone(source), column } as Operation;
    if (op.kind === 'fill_null' && op.strategy !== 'constant') {
      const stats = working.columns.find(c => c.name === column)?.stats;
      const value = op.strategy === 'mean' ? stats?.mean : op.strategy === 'median' ? stats?.median : stats?.mode;
      if (value === undefined || value === null) {
        problems.push(`Cannot calculate ${op.strategy} for ${column}; skip this rule or choose another column.`);
        continue;
      }
      op = { ...op, value };
    }
    operations.push(op);
    working = applyOperation(working, op);
  }
  return { operations, problems: [...new Set(problems)] };
}