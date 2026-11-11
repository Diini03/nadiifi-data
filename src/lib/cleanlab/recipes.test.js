import { test, expect } from 'bun:test';
import { profileDataset } from './profile';
import { applyApproved, previewOperations } from './review';
import { createRecipe, recipeCandidates, prepareRecipe } from './recipes';

test('recipes capture approved rules but never carry duplicate deletions or dropped columns', () => {
  const ds = profileDataset('original', [{City:' A ',Amount:10},{City:'B',Amount:null}],0);
  const approved = applyApproved(ds,[{kind:'trim',column:'City'},{kind:'delete_rows',indices:[1]}]);
  expect(recipeCandidates(approved)).toEqual([{kind:'trim',column:'City'}]);
  expect(recipeCandidates(ds)).toEqual([]);
  expect(()=>createRecipe('unsafe',[{kind:'delete_rows',indices:[1]}])).toThrow();
  expect(()=>createRecipe('unsafe',[{kind:'drop_column',column:'City'}])).toThrow();
});

test('mapping reuses ordered rules on new columns without altering the source before approval', () => {
  const ds = profileDataset('next', [{Region:'  male  '},{Region:' FEMALE '}],0);
  const recipe = createRecipe('Gender cleanup',[{kind:'trim',column:'Gender'},{kind:'uppercase',column:'Gender'}]);
  const prepared = prepareRecipe(ds, recipe, {Gender:'Region'}, [1,0]);
  expect(prepared.problems).toEqual([]);
  expect(previewOperations(ds, prepared.operations).after.rows).toEqual([{Region:'MALE'},{Region:'FEMALE'}]);
  expect(ds.rows[0].Region).toBe('  male  ');
  const approved = applyApproved(ds, prepared.operations);
  expect(approved.audit[0].operations.length).toBe(2);
  expect(approved.rows.length).toBe(2);
});

test('unmapped columns block reuse and skipped rules do not run', () => {
  const ds = profileDataset('next',[{City:' A '}],0);
  const recipe = createRecipe('cleanup',[{kind:'trim',column:'City'},{kind:'trim',column:'Missing'}]);
  expect(prepareRecipe(ds,recipe,{City:'City'},[0,1]).problems).toEqual(['Choose a destination column for Missing.']);
  expect(prepareRecipe(ds,recipe,{City:'City'},[0]).operations).toEqual([{kind:'trim',column:'City'}]);
  expect(prepareRecipe(ds,recipe,{City:'not-real'},[0]).problems.length).toBe(1);
});

test('statistical fills recalculate destination values rather than reuse old approved estimates', () => {
  const source = profileDataset('source',[{Amount:10},{Amount:20},{Amount:null}],0);
  const after = applyApproved(source,[{kind:'fill_null',column:'Amount',strategy:'mean',value:15}]);
  const rules = recipeCandidates(after);
  expect(rules[0].value).toBeUndefined();
  const target = profileDataset('target',[{Revenue:100},{Revenue:300},{Revenue:null}],0);
  const prepared = prepareRecipe(target,createRecipe('fill',rules),{Amount:'Revenue'},[0]);
  expect(prepared.operations[0].value).toBe(200);
  expect(previewOperations(target,prepared.operations).after.rows[2].Revenue).toBe(200);
  expect(target.rows[2].Revenue).toBe(null);
  const empty = profileDataset('empty',[{Revenue:null}],0);
  expect(prepareRecipe(empty,createRecipe('fill',rules),{Amount:'Revenue'},[0]).problems.length).toBe(1);
});

test('constant fills and explicit date order survive reuse', () => {
  const ds=profileDataset('new',[{Date:'03/04/2026',City:null}],0);
  const recipe=createRecipe('dates',[{kind:'parse_date',column:'Date',dayFirst:true},{kind:'fill_null',column:'City',strategy:'constant',value:'Unknown'}]);
  const prepared=prepareRecipe(ds,recipe,{Date:'Date',City:'City'},[0,1]);
  expect(previewOperations(ds,prepared.operations).after.rows[0]).toEqual({Date:'2026-04-03',City:'Unknown'});
});