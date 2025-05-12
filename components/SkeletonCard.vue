<template>
  <div class="skeleton-card">
    <div class="skeleton-image"></div>
    <div class="skeleton-content">
      <div class="skeleton-title"></div>
      <div class="skeleton-text"></div>
      <div class="skeleton-text skeleton-text-short"></div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.skeleton-card {
  @apply bg-white rounded-lg shadow-md overflow-hidden;
  
  .skeleton-image {
    @apply w-full h-64 bg-gray-200 animate-pulse;
  }
  
  .skeleton-content {
    @apply p-4;
    
    .skeleton-title {
      @apply h-6 bg-gray-200 rounded w-3/4 mb-4 animate-pulse;
    }
    
    .skeleton-text {
      @apply h-4 bg-gray-200 rounded w-full mb-2 animate-pulse;
    }
    
    .skeleton-text-short {
      @apply w-2/3;
    }
  }
}
</style>