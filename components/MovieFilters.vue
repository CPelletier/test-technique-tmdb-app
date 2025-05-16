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
    <v-alert
      v-if="searchMode"
      class="search-active-notice"
      density="compact"
      text="Les filtres sont désactivés pendant la recherche"
      type="warning"
    ></v-alert>
    
    <!-- Filtres de catégorie -->
    <div class="filter-group">
      <v-select
        label="Catégorie"
        v-model="localCategory"
        :items="categoryOptions"
        item-title="label"
        item-value="value"
        :disabled="searchMode"
        density="compact"
        variant="outlined"
        hide-details
        class="filter-select"
        @update:model-value="changeCategory"
      ></v-select>
    </div>
    
    <!-- Filtre de langue -->
    <div class="filter-group">
      <v-select
        label="Langue"
        v-model="languageFilter"
        :items="languageOptions"
        item-title="label"
        item-value="value"
        :disabled="searchMode"
        density="compact"
        variant="outlined"
        hide-details
        class="filter-select"
        @update:model-value="changeLanguage"
      ></v-select>
    </div>
  </div>
</template>