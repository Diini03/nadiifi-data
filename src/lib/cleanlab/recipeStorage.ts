import { get, update } from 'idb-keyval';
import type { CleaningRecipe } from './recipes';

const key = (owner?: string) => `nadiifi:cleaning-recipes:${owner ?? 'guest'}`;
export const loadRecipes = (owner?: string) => get<CleaningRecipe[]>(key(owner)).then(value => value ?? []);
export const saveRecipe = (recipe: CleaningRecipe, owner?: string) =>
  update<CleaningRecipe[]>(key(owner), value => [...(value ?? []), recipe]);
export const deleteRecipe = (id: string, owner?: string) =>
  update<CleaningRecipe[]>(key(owner), value => (value ?? []).filter(recipe => recipe.id !== id));