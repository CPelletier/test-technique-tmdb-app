// composables/useTmdb.ts
import type { TMDBApi } from '~/types/tmdb';

export function useTmdb(): TMDBApi {
  const nuxtApp = useNuxtApp();
  // Utilisation de type assertion pour indiquer à TypeScript que $tmdb existe
  return nuxtApp.$tmdb as TMDBApi;
}