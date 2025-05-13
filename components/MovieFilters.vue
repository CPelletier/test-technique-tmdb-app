<!-- components/MovieFilters.vue -->
<script setup lang="ts">
import { ref, watch } from 'vue';
import { useMoviesStore } from '~/stores/movies';
import { storeToRefs } from 'pinia';
import type { UICategoryType } from '~/types/tmdb';

const moviesStore = useMoviesStore();
const { currentCategory, selectedLanguage, searchMode } = storeToRefs(moviesStore);

// Synchroniser avec le store
const localCategory = ref<UICategoryType>(currentCategory.value);
const languageFilter = ref(selectedLanguage.value);

// Surveiller les changements dans le store
watch(currentCategory, (newCategory) => {
  localCategory.value = newCategory;
});

watch(selectedLanguage, (newLanguage) => {
  languageFilter.value = newLanguage;
});

// Options pour les catégories
const categoryOptions = [
  { value: 'all', label: 'Tous les films' },
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

// Fonction pour changer de catégorie
function changeCategory(category: UICategoryType) {
  if (category === 'all') {
    moviesStore.fetchAllMovies(1, languageFilter.value);
  } else {
    moviesStore.fetchMoviesByCategory(category, 1, languageFilter.value);
  }
}

// Fonction pour changer de langue
function changeLanguage(language: string) {
  if (localCategory.value === 'all') {
    moviesStore.fetchAllMovies(1, language);
  } else {
    const category = localCategory.value as Exclude<UICategoryType, 'all'>;
    moviesStore.fetchMoviesByCategory(category, 1, language);
  }
}
</script>

<template>
  <div class="filters-container" :class="{ 'disabled': searchMode }">
    <!-- Message si en mode recherche -->
    <div v-if="searchMode" class="search-active-notice">
      <p>Les filtres sont désactivés pendant la recherche</p>
    </div>
    
    <!-- Filtres de catégorie -->
    <div class="filter-group">
      <label class="filter-label">Catégorie</label>
      <select 
        v-model="localCategory"
        @change="changeCategory(localCategory)"
        class="filter-select"
        :disabled="searchMode"
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
    <div class="filter-group">
      <label class="filter-label">Langue</label>
      <select 
        v-model="languageFilter"
        @change="changeLanguage(languageFilter)"
        class="filter-select"
        :disabled="searchMode"
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
  </div>
</template>