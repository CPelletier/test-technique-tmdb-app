<template>
  <div class="app-container">
    <header class="app-header">
      <div class="container mx-auto px-4 py-6">
        <h1 class="text-2xl font-bold text-tmdb-dark mb-4">
          <span class="text-tmdb-light">TMDB</span> Movie App
        </h1>
        
        <div class="flex flex-col md:flex-row gap-4 mb-4">
          <!-- Filtres de catégorie -->
          <div class="filters-section">
            <label class="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
            <select 
              v-model="selectedCategory"
              @change="changeCategory(selectedCategory)"
              class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-tmdb-blue focus:border-tmdb-blue sm:text-sm rounded-md"
            >
              <option 
                v-for="option in categoryOptions" 
                :key="option.value" 
                :value="option.value"
              >
                {{ option.label }}
              </option>
            </select>
          </div>
          
          <!-- Filtre de langue -->
          <div class="filters-section">
            <label class="block text-sm font-medium text-gray-700 mb-1">Langue</label>
            <select 
              v-model="languageFilter"
              @change="changeLanguage(languageFilter)"
              class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-tmdb-blue focus:border-tmdb-blue sm:text-sm rounded-md"
            >
              <option 
                v-for="option in languageOptions" 
                :key="option.value" 
                :value="option.value"
              >
                {{ option.label }}
              </option>
            </select>
          </div>
          
          <!-- Barre de recherche -->
          <div class="search-section flex-grow">
            <label class="block text-sm font-medium text-gray-700 mb-1">Rechercher</label>
            <div class="flex">
              <input 
                v-model="searchQuery"
                @keyup.enter="handleSearch"
                type="text" 
                placeholder="Rechercher un film..." 
                class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-tmdb-blue focus:border-tmdb-blue sm:text-sm rounded-l-md"
              />
              <button 
                @click="handleSearch"
                class="mt-1 bg-tmdb-blue text-white px-4 rounded-r-md hover:bg-opacity-90"
              >
                Rechercher
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
    
    <main class="container mx-auto px-4 py-8">
      <div class="section-header mb-6 flex justify-between items-center">
        <h2 class="text-xl font-semibold">
          {{ searchQuery ? 'Résultats de recherche' : categoryOptions.find(c => c.value === currentCategory)?.label }}
          <span v-if="totalResults > 0" class="text-sm font-normal text-gray-500 ml-2">
            ({{ totalResults }} films)
          </span>
        </h2>
      </div>
      
      <!-- Message d'erreur -->
      <div v-if="error" class="error-message mb-6 p-4 bg-red-100 text-red-700 rounded">
        {{ error }}
      </div>
      
      <!-- Grille de films -->
      <div class="movie-grid">
        <!-- Squelettes pendant le chargement -->
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
        <div v-if="!isLoading && filteredMovies.length === 0 && !error" class="no-movies col-span-full py-12 text-center">
          <p class="text-lg text-gray-500">Aucun film disponible pour le moment.</p>
        </div>
      </div>
      
      <InfiniteScroll 
        :load-more="loadMore" 
        :has-more="hasMore" 
        :loading="isLoading"
      >
        <template #loading>
          <div class="skeleton-container grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 mt-6">
            <SkeletonCard v-for="i in 5" :key="`infinite-skeleton-${i}`" />
          </div>
        </template>
        <template #end>
          <div class="end-message py-8 text-center text-gray-500">
            Vous avez atteint la fin de la liste des films.
          </div>
        </template>
      </InfiniteScroll>
    </main>
    
    <footer class="app-footer">
      <div class="container mx-auto px-4 py-6 text-center text-sm text-gray-600">
        <p>Données fournies par <a href="https://www.themoviedb.org/" target="_blank" class="text-tmdb-blue hover:underline">The Movie Database (TMDB)</a></p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { useMoviesStore } from '~/stores/movies';
import { storeToRefs } from 'pinia';
import MovieCard from '~/components/MovieCard.vue';
import SkeletonCard from '~/components/SkeletonCard.vue';
import InfiniteScroll from '~/components/InfiniteScroll.vue';
import type { MovieCategory } from '~/types/tmdb';

const moviesStore = useMoviesStore();
const { 
  filteredMovies, 
  isLoading, 
  error, 
  posterBaseUrl, 
  currentCategory,
  totalResults,
  currentPage,
  totalPages,
  hasMore
} = storeToRefs(moviesStore);

const searchQuery = ref('');
const selectedCategory = ref<MovieCategory>('popular');
const languageFilter = ref('');

// Options pour les catégories
const categoryOptions = [
  { value: 'popular', label: 'Populaires' },
  { value: 'top_rated', label: 'Mieux notés' },
  { value: 'upcoming', label: 'À venir' },
  { value: 'now_playing', label: 'En salles' }
];

// Options pour les langues
const languageOptions = [
  { value: '', label: 'Toutes les langues' },
  { value: 'fr-FR', label: 'Français' },
  { value: 'en-US', label: 'Anglais' },
  { value: 'es-ES', label: 'Espagnol' },
  { value: 'de-DE', label: 'Allemand' },
  { value: 'it-IT', label: 'Italien' },
  { value: 'ja-JP', label: 'Japonais' }
];

// Charger les films dès le chargement de la page
onMounted(() => {
  moviesStore.fetchMoviesByCategory('popular', 1, languageFilter.value);
});

// Fonction pour changer de catégorie
function changeCategory(category: MovieCategory) {
  selectedCategory.value = category;
  searchQuery.value = ''; // Réinitialiser la recherche
  moviesStore.fetchMoviesByCategory(category, 1, languageFilter.value);
}

// Fonction pour changer de langue
function changeLanguage(language: string) {
  languageFilter.value = language;
  moviesStore.fetchMoviesByCategory(selectedCategory.value, 1, language);
}

// Fonction pour rechercher des films
function handleSearch() {
  if (searchQuery.value.trim()) {
    // Ici, vous pourriez implémenter la recherche avec pagination si nécessaire
    // Pour l'instant, nous allons simplement réinitialiser la recherche lorsqu'on change de catégorie
  } else {
    // Si la recherche est vide, réinitialiser pour afficher la catégorie actuelle
    moviesStore.fetchMoviesByCategory(selectedCategory.value, 1, languageFilter.value);
  }
}

// Fonction pour charger plus de films
function loadMore() {
  moviesStore.loadNextPage();
}

// Fonction pour charger toutes les pages disponibles
// function loadAllPages() {
//   moviesStore.fetchAllMovies(5); // Récupère 5 pages de films
// }
</script>

<style lang="scss">
body {
  @apply bg-gray-50;
  font-family: 'Inter', sans-serif;
}

.app-container {
  @apply min-h-screen flex flex-col;
  
  .app-header {
    @apply bg-white shadow-sm;
  }
  
  main {
    @apply flex-grow;
  }
  
  .movie-grid {
    @apply grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6;
  }
  
  .app-footer {
    @apply mt-auto bg-white border-t border-gray-200;
  }
}

/* Animation pour le fade-in des films */
.movie-card {
  @apply transition duration-500 ease-in-out opacity-0;
  animation: fadeIn 0.5s forwards;
}

@keyframes fadeIn {
  0% {
    opacity: 0;
    transform: translateY(10px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Décalage de l'animation pour créer un effet cascade */
@for $i from 1 through 20 {
  .movie-grid > *:nth-child(#{$i}) {
    animation-delay: #{$i * 0.05}s;
  }
}
</style>