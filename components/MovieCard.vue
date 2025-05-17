<!-- components/MovieCard.vue -->
<script setup lang="ts">
import { ref } from 'vue';
import { useIntersectionObserver } from '@vueuse/core';
import type { Movie } from '~/types/tmdb';
import { generateSlug } from '~/utils/slug';

const props = defineProps<{
  movie: Movie;
  posterBaseUrl: string;
}>();

const router = useRouter();

// Pour le lazy loading des images
const cardElement = ref(null);
const isVisible = ref(false);
const imageLoaded = ref(false);

// Observer pour lazy loading
useIntersectionObserver(
  cardElement,
  ([{ isIntersecting }]) => {
    if (isIntersecting) {
      isVisible.value = true;
    }
  },
  { threshold: 0.1 }
);

// Gérer le chargement des images
function handleImageLoad() {
  imageLoaded.value = true;
}

function goToMovieDetails() {
  const slug = generateSlug(props.movie.title, props.movie.id);
  router.push(`/movie/${slug}`);
}

</script>

<template>
  <div ref="cardElement" class="movie-card cursor-pointer" @click="goToMovieDetails">
    <div class="movie-poster relative">
      <!-- Skeleton pendant le chargement de l'image -->
      <div 
        v-if="!imageLoaded" 
        class="skeleton-image absolute inset-0 bg-gray-200 animate-pulse"
      ></div>
      
      <!-- Image avec lazy loading -->
      <img 
        v-if="isVisible && movie.poster_path" 
        :src="`${posterBaseUrl}${movie.poster_path}`" 
        :alt="movie.title"
        class="w-full h-full object-cover transition-opacity duration-300"
        :class="{ 'opacity-0': !imageLoaded, 'opacity-100': imageLoaded }"
        @load="handleImageLoad"
        loading="lazy"
      />
      
      <div v-else-if="isVisible && !movie.poster_path" class="no-poster">
        <span>Pas d'affiche disponible</span>
      </div>
    </div>
    
    <div class="movie-content">
      <h3 class="movie-title">{{ movie.title }}</h3>
      <div class="movie-info">
        <span class="movie-year">{{ movie.release_date ? new Date(movie.release_date).getFullYear() : 'Date inconnue' }}</span>
        <span class="movie-rating">
          <span class="star">★</span>
          {{ movie.vote_average.toFixed(1) }}
        </span>
      </div>
      <p class="movie-overview">{{ movie.overview.slice(0, 120) }}{{ movie.overview.length > 120 ? '...' : '' }}</p>
    </div>
  </div>
</template>