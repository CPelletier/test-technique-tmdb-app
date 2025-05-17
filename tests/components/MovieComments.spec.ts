// tests/components/MovieComments.spec.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount, VueWrapper } from '@vue/test-utils';
import MovieComments from '~/components/MovieComments.vue';
import { commentService } from '~/services/commentService';

// Mock du service de commentaires
vi.mock('~/services/commentService', () => ({
  commentService: {
    getMovieComments: vi.fn(() => []),
    addComment: vi.fn()
  }
}));
const mockedCommentService = vi.mocked(commentService);

// Mock pour TinyMCE
vi.mock('@tinymce/tinymce-vue', () => ({
  default: {
    render: () => {},
    setup: () => {}
  }
}));

describe('MovieComments Component', () => {
  let wrapper: VueWrapper<any>;
  
  beforeEach(() => {
    vi.clearAllMocks();
    wrapper = mount(MovieComments, {
      props: {
        movieId: 123
      },
      global: {
        stubs: {
          Editor: true // Remplacer TinyMCE par un stub
        }
      }
    });
  });
  
  describe('Form Validation', () => {
    it('should validate username correctly', async () => {
      const usernameInput = wrapper.find('#username');
      
      // Tester un nom d'utilisateur trop court
      await usernameInput.setValue('ab');
      await wrapper.find('form').trigger('submit.prevent');
      
      expect(wrapper.text()).toContain('Le nom doit contenir au moins 3 caractères');
      
      // Tester un nom d'utilisateur valide
      await usernameInput.setValue('ValidUser');
      await wrapper.find('form').trigger('submit.prevent');
      
      expect(wrapper.text()).not.toContain('Le nom doit contenir au moins 3 caractères');
    });
    
    it('should submit the form when all validations pass', async () => {
      // Simuler un formulaire valide
      await wrapper.find('#username').setValue('ValidUser');
      
      // Simuler le fait que TinyMCE contient du texte
      wrapper.vm.formData.message = '<p>This is a valid comment.</p>';
      
      // Simuler la soumission du formulaire
      await wrapper.find('form').trigger('submit.prevent');
      
      // Vérifier que addComment a été appelé avec les bons arguments
      expect(mockedCommentService.addComment).toHaveBeenCalledWith({
        username: 'ValidUser',
        message: '<p>This is a valid comment.</p>',
        rating: 5, // Valeur par défaut
        movieId: 123
      });
    });
  });
  
  describe('Rating System', () => {
    it('should display the correct star rating', async () => {
      // Modification directe de la fonction qui génère les étoiles
      // Puisque nous ne pouvons pas facilement interagir avec le DOM manipulé par Vuetify
      const result = wrapper.vm.generateStars(7);
      
      // Vérifier directement le résultat de la fonction
      expect(result).toBe('★★★★★★★☆☆☆'); // 7 étoiles pleines et 3 vides
    });
  });
});