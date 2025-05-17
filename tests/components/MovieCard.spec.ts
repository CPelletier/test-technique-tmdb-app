// tests/components/MovieCard.spec.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { shallowMount } from '@vue/test-utils'

// Vérifier que useRouter est disponible avant d'importer le composant
console.log('useRouter in spec file:', typeof (globalThis as any).useRouter);

import MovieCard from '~/components/MovieCard.vue'

describe('MovieCard Component', () => {
  // Accéder au mock router push
  const mockRouterPush = globalThis.__mocks__.router.push;
  
  beforeEach(() => {
    vi.clearAllMocks()
    
    // Vérifier que le mock est bien défini
    console.log('useRouter before each test:', typeof (globalThis as any).useRouter);
  })
  
  const mockMovie = {
    id: 123,
    title: 'Test Movie',
    poster_path: '/path/to/poster.jpg',
    backdrop_path: '/path/to/backdrop.jpg',
    release_date: '2023-01-15',
    vote_average: 7.5,
    overview: 'This is a test movie description.',
    genre_ids: [28, 12]
  }
  
  const posterBaseUrl = 'https://image.tmdb.org/t/p/w500'
  
  it('should render movie information correctly', () => {
    const wrapper = shallowMount(MovieCard, {
      props: {
        movie: mockMovie,
        posterBaseUrl
      },
      global: {
        // Fournir useRouter explicitement
        provide: {
          router: (globalThis as any).useRouter()
        },
        mocks: {
          useRouter: (globalThis as any).useRouter
        }
      }
    })
    
    expect(wrapper.find('.movie-title').text()).toBe('Test Movie')
    expect(wrapper.find('.movie-year').text()).toBe('2023')
    expect(wrapper.find('.movie-rating').text()).toContain('7.5')
    
    const img = wrapper.find('img')
    expect(img.attributes('src')).toBe(`${posterBaseUrl}${mockMovie.poster_path}`)
  })
  
  it('should display fallback when no poster is available', () => {
    const movieWithoutPoster = {
      ...mockMovie,
      poster_path: null
    }
    
    const wrapper = shallowMount(MovieCard, {
      props: {
        movie: movieWithoutPoster,
        posterBaseUrl
      },
      global: {
        mocks: {
          useRouter: (globalThis as any).useRouter
        }
      }
    })
    
    expect(wrapper.find('.no-poster').exists()).toBe(true)
    expect(wrapper.find('.no-poster').text()).toContain('Pas d\'affiche disponible')
  })
  
  it('should truncate overview if it\'s too long', () => {
    const longOverview = 'A'.repeat(200)
    const movieWithLongOverview = {
      ...mockMovie,
      overview: longOverview
    }
    
    const wrapper = shallowMount(MovieCard, {
      props: {
        movie: movieWithLongOverview,
        posterBaseUrl
      },
      global: {
        mocks: {
          useRouter: (globalThis as any).useRouter
        }
      }
    })
    
    const displayedOverview = wrapper.find('.movie-overview').text()
    expect(displayedOverview.length).toBeLessThan(longOverview.length)
    expect(displayedOverview.endsWith('...')).toBe(true)
  })
  
  it('should navigate to movie detail page when clicked', async () => {
    const wrapper = shallowMount(MovieCard, {
      props: {
        movie: mockMovie,
        posterBaseUrl
      },
      global: {
        mocks: {
          useRouter: (globalThis as any).useRouter
        }
      }
    })
    
    await wrapper.find('.movie-card').trigger('click')
    
    // Vérifier que router.push a été appelé
    expect(mockRouterPush).toHaveBeenCalled()
    
    // Vérifier le format de l'URL (selon la fonction generateSlug mockée)
    const expectedSlug = 'test-movie-123'
    expect(mockRouterPush).toHaveBeenCalledWith(expect.stringContaining(expectedSlug))
  })
  
  it('should show skeleton loader before image is loaded', () => {
    const wrapper = shallowMount(MovieCard, {
      props: {
        movie: mockMovie,
        posterBaseUrl
      },
      global: {
        mocks: {
          useRouter: (globalThis as any).useRouter
        }
      }
    })
    
    // Le skeleton devrait être visible par défaut
    expect(wrapper.find('.skeleton-image').exists()).toBe(true)
  })
})