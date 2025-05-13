<!-- components/MovieGrid.vue -->
<script setup lang="ts">
import { useMoviesStore } from '~/stores/movies';
import { storeToRefs } from 'pinia';
import MovieCard from '~/components/MovieCard.vue';
import SkeletonCard from '~/components/SkeletonCard.vue';

const moviesStore = useMoviesStore();
const { 
  filteredMovies, 
  isLoading, 
  posterBaseUrl,
  currentCategory,
  totalResults,
  searchMode,
  currentSearchQuery
} = storeToRefs(moviesStore);

// Options pour les catégories (pour l'affichage du titre)
const categoryOptions = [
  { value: 'all', label: 'Tous les films' },
  { value: 'popular', label: 'Populaires' },
  { value: 'top_rated', label: 'Mieux notés' },
  { value: 'upcoming', label: 'À venir' },
  { value: 'now_playing', label: 'En salles' }
];
</script>

<template>
  <div class="movies-section">
    <div class="section-header">
      <h2 class="section-title">
        <template v-if="searchMode">
          Résultats de recherche pour "{{ currentSearchQuery }}"
        </template>
        <template v-else>
          {{ categoryOptions.find(c => c.value === currentCategory)?.label }}
        </template>
        <span v-if="totalResults > 0" class="results-count">
          ({{ totalResults }} films)
        </span>
      </h2>
    </div>
    
    <div class="movie-grid">
      <!-- Squelettes pendant le chargement initial -->
      <template v-if="isLoading && filteredMovies.length === 0">
        <SkeletonCard v-for="i in 12" :key="`skeleton-${i}`" />
      </template>
      
      <!-- Affichage des films -->
      <template v-if="filteredMovies.length > 0">
        <MovieCard 
          v-for="movie in filteredMovies" 
          :key="movie.id" 
          :movie="movie"
          :poster-base-url="posterBaseUrl"
        />
      </template>
      
      <!-- Message si aucun film -->
      <div v-if="!isLoading && filteredMovies.length === 0" class="no-movies">
        <p>Aucun film disponible pour le moment.</p>
      </div>
    </div>
  </div>
</template>