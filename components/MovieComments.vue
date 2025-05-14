<!-- components/MovieComments.vue -->
<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useVuelidate } from '@vuelidate/core';
import { required, minLength, maxLength, helpers } from '@vuelidate/validators';
import Editor from '@tinymce/tinymce-vue';
import { commentService, type Comment as CommentType } from '~/services/commentService';

declare global {
  interface Window {
    tinymce: any;
  }
}

const props = defineProps<{
  movieId: number;
}>();

// État du formulaire
const formData = ref({
  username: '',
  message: '',
  rating: 5 // Valeur par défaut
});

// État des commentaires
const comments = ref<CommentType[]>([]);

// Configuration de TinyMCE avec configuration simplifiée
const editorConfig = {
  plugins: ['link', 'lists', 'emoticons'],
  toolbar: 'bold italic | bullist numlist | link emoticons',
  menubar: false,
  statusbar: false,
  element_format: 'html', // Utiliser le format HTML le plus simple
  entities: '160,nbsp', // Limiter les entités HTML
  entity_encoding: 'raw', // Minimiser l'encodage des entités
  forced_root_block: 'p', // Forcer l'utilisation de paragraphes
  height: 200,
  content_style: 'body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; font-size: 14px }',
};

// Fonction pour compter uniquement les caractères de texte (sans HTML)
function countTextCharacters(html: string): number {
  if (!html) return 0;
  
  // Créer un élément div temporaire
  const tempDiv = document.createElement('div');
  // Définir le HTML à l'intérieur
  tempDiv.innerHTML = html;
  // Récupérer uniquement le texte
  const textOnly = tempDiv.textContent || tempDiv.innerText || '';
  // Renvoyer la longueur du texte
  return textOnly.length;
}

// Création d'une valeur calculée pour afficher le nombre de caractères réel
const textCharacterCount = computed(() => {
  return countTextCharacters(formData.value.message);
});

// Règles de validation simplifiées (sans la validation alphanumérique pour le message)
const rules = computed(() => {
  const strictAlphaRegex = /^[a-zA-ZÀ-ÿ]+$/;
  
  return {
    username: { 
      required,
      minLength: minLength(3),
      maxLength: maxLength(50),
      alpha: helpers.withMessage('Le nom ne peut contenir que des lettres', helpers.regex(strictAlphaRegex))
    },
    message: { 
      required,
      // Validation personnalisée pour vérifier la longueur du texte réel
      minTextLength: helpers.withMessage(
        'Le message doit contenir au moins 3 caractères', 
        () => countTextCharacters(formData.value.message) >= 3
      ),
      maxTextLength: helpers.withMessage(
        'Le message ne peut pas dépasser 500 caractères', 
        () => countTextCharacters(formData.value.message) <= 500
      )
    },
    rating: { 
      required,
      between: helpers.withMessage('La note doit être entre 1 et 10', (value: number) => value >= 1 && value <= 10)
    }
  };
});

// Vuelidate setup
const v$ = useVuelidate(rules, formData);

// Charger les commentaires du localStorage au montage
onMounted(() => {
  loadComments();
  
  // Récupérer le nom d'utilisateur sauvegardé
  const savedUsername = localStorage.getItem('commentUsername');
  if (savedUsername) {
    formData.value.username = savedUsername;
  }
});

// Fonctions pour gérer les commentaires
function loadComments() {
  comments.value = commentService.getMovieComments(props.movieId);
}

function saveComment() {  

  v$.value.$touch();
  
  // Vérification manuelle des champs obligatoires
  if (!formData.value.username.trim()) {
    return;
  }
  
  if (!formData.value.message.trim()) {
    return;
  }
  
  if (formData.value.username.trim().length < 3) {
    return;
  }
  
  if (formData.value.message.trim().length < 3) {
    return;
  }
  
  // Ajout d'une vérification spéciale pour TinyMCE
  // Si TinyMCE génère une balise <p> vide comme "<p>&nbsp;</p>", on considère que c'est vide
  if (formData.value.message.replace(/<p>&nbsp;<\/p>|<p><br><\/p>|<p><\/p>/g, '').trim() === '') {
    return;
  }
  
  if (v$.value.$invalid) {
    return;
  }
  
  try {
    // Sauvegarder le nom d'utilisateur pour les futurs commentaires
    localStorage.setItem('commentUsername', formData.value.username);
    
    // Ajout du commentaire avec le service
    const newComment = commentService.addComment({
      username: formData.value.username,
      message: formData.value.message,
      rating: formData.value.rating,
      movieId: props.movieId
    });
    
    // Mettre à jour la liste locale
    loadComments();
    
    // Réinitialiser le formulaire
    resetForm();
    
  } catch (error) {
    console.error('Erreur lors de l\'enregistrement du commentaire:', error);
  }
}

function resetForm() {
  formData.value = {
    username: formData.value.username, // Conserver le nom d'utilisateur
    message: '',
    rating: 5
  };
  v$.value.$reset();
}

// Fonction pour formater la date
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Générer des étoiles pour la note
function generateStars(rating: number): string {
  return '★'.repeat(rating) + '☆'.repeat(10 - rating);
}
</script>

<template>
  <div class="comments-section">
    <!-- Titre de la section -->
    <h2 class="section-title">Commentaires</h2>
    
    <!-- Formulaire de commentaire -->
    <form @submit.prevent="saveComment" class="comment-form">
      <div class="form-group">
        <label for="username">Nom d'utilisateur</label>
        <input 
          id="username"
          v-model="formData.username"
          type="text"
          class="form-control"
          :class="{ 'is-invalid': v$.username.$error }"
        />
        <div v-if="v$.username.$error" class="error-feedback">
          <span v-if="v$.username.required.$invalid">Le nom d'utilisateur est requis.</span>
          <span v-else-if="v$.username.minLength.$invalid">Le nom doit contenir au moins 3 caractères.</span>
          <span v-else-if="v$.username.maxLength.$invalid">Le nom ne peut pas dépasser 50 caractères.</span>
          <span v-else-if="v$.username.alpha.$invalid">Le nom ne peut contenir que des lettres.</span>
        </div>
      </div>
      
      <!-- Message avec TinyMCE -->
      <div class="form-group">
        <label for="message">Message</label>
        
        <Editor
          v-model="formData.message"
          :init="editorConfig"
          api-key="e5mq20ofn9s1twehu71a1fmgu0q7vx9x4s2kdu21cn3wmgt3"
        />
        
        <div v-if="v$.message.$error" class="error-feedback">
          <span v-if="v$.message.required.$invalid">Le message est requis.</span>
          <span v-else-if="v$.message.minTextLength.$invalid">Le message doit contenir au moins 3 caractères.</span>
          <span v-else-if="v$.message.maxTextLength.$invalid">Le message ne peut pas dépasser 500 caractères.</span>
        </div>
        
        <div class="character-counter" :class="{ 'near-limit': textCharacterCount > 450 }">
          {{ textCharacterCount }}/500 caractères
        </div>
      </div>
      
      <!-- Note -->
      <div class="form-group">
        <label for="rating">Note du film (1-10)</label>
        <div class="rating-input">
          <input
            id="rating"
            v-model.number="formData.rating"
            type="range"
            min="1"
            max="10"
            step="1"
            class="range-input"
          />
          <span class="rating-value">{{ formData.rating }}/10</span>
        </div>
        <div class="rating-stars">
          {{ generateStars(formData.rating) }}
        </div>
        <div v-if="v$.rating.$error" class="error-feedback">
          <span>La note doit être entre 1 et 10.</span>
        </div>
      </div>
      
      <div class="form-actions">
        <button type="submit" class="submit-button">Publier</button>
        <button type="button" @click="resetForm" class="reset-button">Annuler</button>
      </div>
    </form>
    
    <!-- Liste des commentaires -->
    <div v-if="comments.length > 0" class="comments-list">
      <div v-for="comment in comments" :key="comment.id" class="comment-item">
        <div class="comment-header">
          <div class="comment-username">{{ comment.username }}</div>
          <div class="comment-date">{{ formatDate(comment.createdAt) }}</div>
        </div>
        <div class="comment-rating">
          <span class="stars">{{ generateStars(comment.rating) }}</span>
          <span class="rating-value">{{ comment.rating }}/10</span>
        </div>
        <div class="comment-message" v-html="comment.message"></div>
      </div>
    </div>
    
    <div v-else class="no-comments">
      Aucun commentaire pour le moment. Soyez le premier à donner votre avis !
    </div>
  </div>
</template>
