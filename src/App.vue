<template>
  <router-view />
</template>

<script setup lang="ts">
// This component now simply renders the current route's component.
// Layouts are handled either by the route components themselves (like LoginView)
// or by a layout component specified in the router configuration (like AppLayout for protected routes).
</script>

<style>
/* Global styles can remain or be moved to main.css or a dedicated global CSS file if preferred.
   For now, removing scoped styles that were specific to the old App.vue content.
   Ensure global styles are loaded, e.g., in main.ts via import './assets/main.css'.
*/
</style>
