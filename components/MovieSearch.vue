<!-- components/MovieSearch.vue -->
<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { useMoviesStore } from '~/stores/movies';
import { storeToRefs } from 'pinia';
import { useRouter, useRoute } from 'vue-router';

const moviesStore = useMoviesStore();
const { currentSearchQuery, searchMode } = storeToRefs(moviesStore);
const router = useRouter();
const route = useRoute();

// Initialiser avec la valeur actuelle
const searchQuery = ref(currentSearchQuery.value);

// Synchroniser avec le store si la recherche change ailleurs
watch(currentSearchQuery, (newQuery) => {
  searchQuery.value = newQuery;
});

// Récupérer la valeur de recherche depuis l'URL au chargement
onMounted(() => {
  if (route.query.search) {
    searchQuery.value = route.query.search as string;
    
    // Si on est sur la page d'accueil, lancer la recherche automatiquement
    if (route.path === '/') {
      moviesStore.searchMovies(searchQuery.value);
    }
  }
});

function handleSearch() {
  if (searchQuery.value.trim()) {
    // Si nous sommes sur une autre page que l'accueil, rediriger
    if (route.path !== '/') {
      router.push({
        path: '/',
        query: { search: searchQuery.value }
      });
    } else {
      // Si déjà sur l'accueil, juste mettre à jour l'URL et lancer la recherche
      router.replace({
        query: { search: searchQuery.value }
      });
      moviesStore.searchMovies(searchQuery.value);
    }
  } else if (searchMode.value) {
    // Si on efface une recherche, revenir à l'état précédent
    moviesStore.searchMovies('');
    // Supprimer le paramètre de recherche de l'URL
    router.replace({ path: route.path });
  }
}
</script>

<template>
  <div class="search-container">
    <div class="search-input-group">
      <v-text-field
        data-test="search-input"
        density="compact"
        variant="outlined"
        hide-details
        label="Rechercher un film..."
        v-model="searchQuery"
        @keyup.enter="handleSearch"
        prepend-inner-icon="mdi-magnify"
      >
      </v-text-field>
      <v-btn data-test="search-button" @click="handleSearch" class="search-button" color="blue-darken-1">Rechercher</v-btn>
    </div>
    <div v-if="searchMode" class="search-status">
      <p>Résultats pour: "{{ currentSearchQuery }}"</p>
      <v-btn 
        variant="text" 
        @click="() => { 
          moviesStore.searchMovies(''); 
          router.replace({ path: '/' });
        }" 
        class="clear-search"
      >
        Effacer la recherche
      </v-btn>
    </div>
  </div>
</template>
