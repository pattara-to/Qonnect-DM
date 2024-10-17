<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import Sidebar from './components/Sidebar.vue';

const route = useRoute();

// Determine if the sidebar should be shown based on the current route
const showSidebar = computed(() => route.path !== '/login');
</script>

<template>
  <div class="app-container">
    <!-- Sidebar will only be rendered if not on the /login route -->
    <Sidebar v-if="showSidebar" class="sidebar" />
    <div class="main-content">
      <router-view />
    </div>
  </div>
</template>

<style scoped>
.app-container {
  display: flex;
  height: 100vh;
}

.sidebar {
  position: sticky;
  top: 0;
  flex-shrink: 0;
}

.main-content {
  flex-grow: 1;
  overflow-y: auto;
}
</style>
