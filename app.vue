<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useMoviesStore } from '~/stores/movies';
import { storeToRefs } from 'pinia';
import AppHeader from '~/components/AppHeader.vue';
import AppFooter from '~/components/AppFooter.vue';
import MovieFilters from '~/components/MovieFilters.vue';
import MovieGrid from '~/components/MovieGrid.vue';
import InfiniteScroll from '~/components/InfiniteScroll.vue';
import type { UICategoryType } from '~/types/tmdb';

const moviesStore = useMoviesStore();
const { 
  filteredMovies, 
  isLoading, 
  error, 
  totalResults,
  hasMore
} = storeToRefs(moviesStore);

// Initialiser les films au chargement
onMounted(() => {
  moviesStore.fetchAllMovies(1, '');
});

// Fonction pour charger plus de films (pour le défilement infini)
function loadMore() {
  moviesStore.loadNextPage();
}
</script>

<template>
  <div class="app-container">
    <AppHeader />
    
    <main class="container">
      <MovieFilters />
      
      <!-- Message d'erreur -->
      <div v-if="error" class="error-message">
        {{ error }}
      </div>
      
      <!-- Grille de films -->
      <MovieGrid />
      
      <!-- Composant de défilement infini -->
      <InfiniteScroll 
        :load-more="loadMore" 
        :has-more="hasMore" 
        :loading="isLoading"
      />
    </main>
    
    <AppFooter />
  </div>
</template>