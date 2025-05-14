import type { UICategoryType } from '~/types/tmdb';

export function isApiCategory(category: UICategoryType): category is Exclude<UICategoryType, 'all'> {
  return category !== 'all';
}

export function getCategoryLabel(category: UICategoryType, options: Array<{ value: string, label: string }>): string {
  return options.find(c => c.value === category)?.label || 'Films';
}