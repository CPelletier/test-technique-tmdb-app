<script setup lang="ts">
import MovieSearch from '~/components/MovieSearch.vue';
</script>

<template>
  <header class="app-header">
    <div class="container">
      <h1 class="app-title">
        <span class="app-title-highlight">TMDB</span> Movie App
      </h1>
      
      <MovieSearch />
    </div>
  </header>
</template>