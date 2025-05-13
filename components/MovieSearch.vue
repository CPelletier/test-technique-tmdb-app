<!-- components/MovieSearch.vue -->
<script setup lang="ts">
import { ref, watch } from 'vue';
import { useMoviesStore } from '~/stores/movies';
import { storeToRefs } from 'pinia';

const moviesStore = useMoviesStore();
const { currentSearchQuery, searchMode } = storeToRefs(moviesStore);

// Initialiser avec la valeur actuelle
const searchQuery = ref(currentSearchQuery.value);

// Synchroniser avec le store si la recherche change ailleurs
watch(currentSearchQuery, (newQuery) => {
  searchQuery.value = newQuery;
});

function handleSearch() {
  if (searchQuery.value.trim()) {
    moviesStore.searchMovies(searchQuery.value);
  } else if (searchMode.value) {
    // Si on efface une recherche, revenir à l'état précédent
    moviesStore.searchMovies('');
  }
}
</script>

<template>
  <div class="search-container">
    <label class="search-label">Rechercher</label>
    <div class="search-input-group">
      <input 
        v-model="searchQuery"
        @keyup.enter="handleSearch"
        type="text" 
        placeholder="Rechercher un film..." 
        class="search-input"
      />
      <button 
        @click="handleSearch"
        class="search-button"
      >
        Rechercher
      </button>
    </div>
    <div v-if="searchMode" class="search-status">
      <p>Résultats pour: "{{ currentSearchQuery }}"</p>
      <button @click="moviesStore.searchMovies('')" class="clear-search">
        Effacer la recherche
      </button>
    </div>
  </div>
</template>