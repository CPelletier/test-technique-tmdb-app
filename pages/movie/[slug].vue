<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useMoviesStore } from '~/stores/movies';
import { storeToRefs } from 'pinia';
import { getIdFromSlug } from '~/utils/slug';

const route = useRoute();
const router = useRouter();
const moviesStore = useMoviesStore();

// Récupérer les données nécessaires depuis le store
const { currentMovie, isLoadingMovie, movieError, posterBaseUrl } = storeToRefs(moviesStore);

// Récupérer l'ID du film à partir du slug
const slug = route.params.slug as string;
const movieId = getIdFromSlug(slug);

// Charger les détails du film au montage du composant
onMounted(async () => {
  if (!movieId || isNaN(movieId)) {
    // Rediriger vers la page d'accueil si l'ID n'est pas valide
    router.push('/');
    return;
  }
  
  await moviesStore.fetchMovieDetails(movieId);
});

// Formater la date de sortie
const formattedReleaseDate = computed(() => {
  if (!currentMovie.value?.release_date) return 'Date inconnue';
  
  return new Date(currentMovie.value.release_date).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
});

// Obtenir le réalisateur du film
const director = computed(() => {
  if (!currentMovie.value?.credits) return null;
  
  return currentMovie.value.credits.crew.find(person => person.job === 'Director');
});

// Obtenir les principaux acteurs
const mainCast = computed(() => {
  if (!currentMovie.value?.credits) return [];
  
  // Retourner les 5 premiers acteurs par ordre d'apparition
  return currentMovie.value.credits.cast
    .sort((a, b) => a.order - b.order)
    .slice(0, 5);
});

// Fonction pour revenir à la page d'accueil
function goBack() {
  router.push('/');
}

useHead(() => ({
  title: currentMovie.value ? `${currentMovie.value.title} - TMDB Movie App` : 'Chargement du film - TMDB Movie App',
  meta: [
    {
      name: 'description',
      content: currentMovie.value?.overview 
        ? `${currentMovie.value.overview.substring(0, 150)}...` 
        : 'Découvrez ce film sur TMDB Movie App'
    }
  ]
}));
</script>

<template>
  <main class="movie-details-container">
    <!-- Bouton de retour -->
    <v-btn prepend-icon="mdi-arrow-left" @click="goBack" color="blue-darken-1">Retour aux film</v-btn>
    
    <!-- Affichage du chargement -->
    <div v-if="isLoadingMovie" class="loading-container">
      <div class="skeleton-poster"></div>
      <div class="skeleton-content">
        <div class="skeleton-title"></div>
        <div class="skeleton-text"></div>
        <div class="skeleton-text"></div>
      </div>
    </div>
    
    <!-- Affichage des erreurs -->
    <div v-else-if="movieError" class="error-message">
      {{ movieError }}
    </div>
    
    <!-- Affichage des détails du film -->
    <div v-else-if="currentMovie" class="movie-details">
      <!-- Section principale avec l'affiche et les informations générales -->
      <div class="movie-hero">
        <!-- Fond flou avec l'image de fond du film -->
        <!-- <div 
          v-if="currentMovie.backdrop_path" 
          class="movie-backdrop" 
          :style="`background-image: url(https://image.tmdb.org/t/p/w1280${currentMovie.backdrop_path})`"
        ></div>
        <div v-else class="movie-backdrop-fallback"></div> -->
        
        <!-- Conteneur pour l'affiche -->
        <div class="movie-poster-container">
          <img 
            v-if="currentMovie.poster_path" 
            :src="`${posterBaseUrl}${currentMovie.poster_path}`" 
            :alt="currentMovie.title"
            class="movie-poster"
            :id="`movie-poster-${currentMovie.id}`"
          />
          <div v-else class="no-poster">
            <span>Pas d'affiche disponible</span>
          </div>
        </div>
        
        <!-- En-tête avec le titre et les métadonnées -->

        <div class="movie-header">
          <h1 class="movie-title">{{ currentMovie.title }}</h1>
          
          <div class="movie-meta">
            <span class="movie-year">{{ formattedReleaseDate }}</span>
            <span v-if="currentMovie.runtime" class="movie-runtime">
              {{ Math.floor(currentMovie.runtime / 60) }}h{{ currentMovie.runtime % 60 }}min
            </span>
          </div>
          
          <!-- Note et nombre de votes -->
          <div class="movie-rating">
            <div class="rating-value">
              <span class="star">★</span>
              {{ currentMovie.vote_average.toFixed(1) }}/10
            </div>
            <div class="rating-count">
              {{ currentMovie.vote_count }} votes
            </div>
          </div>
          
          <!-- Genres du film -->
          <div class="movie-genres">
            <span 
              v-for="genre in currentMovie.genres" 
              :key="genre.id" 
              class="genre-tag"
            >
              {{ genre.name }}
            </span>
          </div>
        </div>
      </div>
      
      <!-- Contenu principal avec synopsis, réalisateur et casting -->
      <div class="movie-main-content">
        <!-- Synopsis -->
        <div class="movie-overview">
          <h2 class="section-title">Synopsis</h2>
          <p v-if="currentMovie.overview">{{ currentMovie.overview }}</p>
          <p v-else class="no-content">Pas de synopsis disponible.</p>

          <div class="movie-credits">
            <!-- Réalisateur -->
            <div class="movie-director">
              <h2 class="section-title">Réalisateur</h2>
              <div v-if="director" class="credit-item">
                <img 
                  v-if="director.profile_path" 
                  :src="`https://image.tmdb.org/t/p/w185${director.profile_path}`" 
                  :alt="director.name"
                  class="credit-image"
                />
                <div v-else class="no-profile-image">
                  <span>{{ director.name.charAt(0) }}</span>
                </div>
                <div class="credit-info">
                  <p class="credit-name">{{ director.name }}</p>
                  <p class="credit-role">Réalisateur</p>
                </div>
              </div>
              <p v-else class="no-content">Réalisateur inconnu</p>
            </div>
            
            <!-- Acteurs principaux -->
            <div class="movie-cast">
              <h2 class="section-title">Têtes d'affiche</h2>
              <div v-if="mainCast.length > 0" class="cast-list">
                <div 
                  v-for="actor in mainCast" 
                  :key="actor.id" 
                  class="credit-item"
                >
                  <img 
                    v-if="actor.profile_path" 
                    :src="`https://image.tmdb.org/t/p/w185${actor.profile_path}`" 
                    :alt="actor.name"
                    class="credit-image"
                  />
                  <div v-else class="no-profile-image">
                    <span>{{ actor.name.charAt(0) }}</span>
                  </div>
                  <div class="credit-info">
                    <p class="credit-name">{{ actor.name }}</p>
                    <p class="credit-role">{{ actor.character }}</p>
                  </div>
                </div>
              </div>
              <p v-else class="no-content">Aucun acteur listé</p>
            </div>
          </div>
        </div>

        <div class="movie-comments-container">
          <MovieComments :movie-id="movieId" />
        </div>
      </div>
    </div>
    
    <!-- Film non trouvé -->
    <div v-else class="not-found">
      <h2>Film non trouvé</h2>
      <p>Désolé, nous n'avons pas pu trouver le film demandé.</p>
      <v-btn @click="goBack" class="back-button">
        Retourner à la liste des films
      </v-btn>
    </div>
  </main>
</template>