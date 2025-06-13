<template>
  <div class="app-container">
    <router-view />
  </div>
</template>

<script>
import backgroundImage from './assets/image.png';

export default {
  name: 'App',
  mounted() {
    document.body.style.backgroundImage = `url(${backgroundImage})`;
    document.body.style.backgroundSize = 'cover';
    document.body.style.backgroundPosition = 'center';
    document.body.style.backgroundRepeat = 'no-repeat';
    document.body.style.backgroundAttachment = 'fixed';
  }
};
</script>

<style>
.app-container {
  width: 100%;
  min-height: 100vh;
}
</style>
