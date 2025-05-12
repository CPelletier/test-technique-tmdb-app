// components/MovieCard.vue
<script setup lang="ts">
import { defineProps } from 'vue';
import type { Movie } from '~/types/tmdb';

const props = defineProps<{
  movie: Movie;
  posterBaseUrl: string;
}>();
</script>

<template>
  <div class="movie-card">
    <div class="movie-poster">
      <img 
        v-if="movie.poster_path" 
        :src="`${posterBaseUrl}${movie.poster_path}`" 
        :alt="movie.title"
        class="w-full h-full object-cover transition-opacity duration-300"
        loading="lazy"
      />
      <div v-else class="no-poster">
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

<style lang="scss" scoped>
.movie-card {
  @apply bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-200;
  
  &:hover {
    @apply transform scale-[1.02];
  }
  
  .movie-poster {
    @apply h-64 bg-gray-200 relative;
    
    .no-poster {
      @apply flex items-center justify-center h-full text-gray-500;
    }
  }
  
  .movie-content {
    @apply p-4;
    
    .movie-title {
      @apply text-lg font-bold text-tmdb-dark mb-2 line-clamp-1;
    }
    
    .movie-info {
      @apply flex justify-between text-sm text-gray-600 mb-2;
      
      .movie-rating {
        @apply flex items-center;
        
        .star {
          @apply text-yellow-500 mr-1;
        }
      }
    }
    
    .movie-overview {
      @apply text-sm text-gray-700 line-clamp-3;
    }
  }
}
</style>