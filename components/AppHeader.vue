<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router';
import MovieSearch from '~/components/MovieSearch.vue';

const router = useRouter();
// Fonction pour revenir à la page d'accueil
function goBack() {
  router.push('/');
}
</script>

<template>
  <header class="app-header">
    <div class="container">
      <h1 class="app-title" @click="goBack">
        <span class="app-title-highlight">TMDB</span> Movie App
      </h1>
      
      <MovieSearch />
    </div>
  </header>
</template>