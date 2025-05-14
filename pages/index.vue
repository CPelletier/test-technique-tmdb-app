<!-- pages/index.vue -->
<script setup lang="ts">
import { useMoviesStore } from '~/stores/movies';
import { storeToRefs } from 'pinia';
import MovieFilters from '~/components/MovieFilters.vue';
import MovieGrid from '~/components/MovieGrid.vue';
import InfiniteScroll from '~/components/InfiniteScroll.vue';

const moviesStore = useMoviesStore();
const { isLoading, error, hasMore } = storeToRefs(moviesStore);

// Fonction pour charger plus de films (pour le défilement infini)
function loadMore() {
  moviesStore.loadNextPage();
}

// Initialiser les films au chargement
onMounted(() => {
  moviesStore.fetchAllMovies(1, '');
});
</script>

<template>
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
</template>

<style lang="scss">
main.container {
  @apply mx-auto px-4 py-6 max-w-7xl flex-grow;
}
</style>