<!-- components/InfiniteScroll.vue -->
<script setup lang="ts">
import { useIntersectionObserver, useThrottleFn } from '@vueuse/core';

const props = defineProps<{
  loadMore: () => void;
  hasMore: boolean;
  loading: boolean;
}>();

const target = ref(null);
const isVisible = ref(false);

// Throttle la fonction loadMore pour éviter les appels trop fréquents
const throttledLoadMore = useThrottleFn(() => {
  if (props.hasMore && !props.loading) {
    props.loadMore();
  }
}, 300);

useIntersectionObserver(
  target,
  ([{ isIntersecting }]) => {
    isVisible.value = isIntersecting;
    if (isIntersecting) {
      throttledLoadMore();
    }
  },
  { threshold: 0.1 }
);
</script>

<template>
  <div ref="target" class="infinite-scroll-sentinel h-10">
    <slot v-if="loading" name="loading">
      <div class="loading-indicator flex justify-center items-center py-6">
        <div class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-tmdb-blue border-r-transparent"></div>
      </div>
    </slot>
    <slot v-else-if="hasMore" name="has-more"></slot>
    <slot v-else name="end"></slot>
  </div>
</template>