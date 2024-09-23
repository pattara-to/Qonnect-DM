<template>
  <div class="loading-container flex items-center justify-center">
    <div class="loading-card flex flex-col items-center justify-center p-6 rounded-xl shadow-xl bg-blue-600">
      <div class="spinner-border"></div>
      <p class="mt-4 text-lg font-semibold text-white">Loading, please wait...</p>
    </div>
  </div>
</template>

<script setup>
</script>

<style scoped>
.loading-container {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 93vh; 
  width: 100vw; 
  overflow: hidden; 
  background-color: rgba(0, 0, 0, 0.05); /* Light background for the entire container */
}

.loading-card {
  background-color: #3b82f6; /* Solid color for the loading card */
  border-radius: 16px; 
  padding: 2rem;
  box-shadow: 0px 12px 24px rgba(0, 0, 0, 0.15); 
  display: flex;
  flex-direction: column;
  align-items: center;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.spinner-border {
  animation: spin 1s linear infinite;
  border: 6px solid rgba(255, 255, 255, 0.3);
  border-top: 6px solid #fff; /* White color for the top part of the spinner */
  border-radius: 50%;
  width: 50px;
  height: 50px;
}

p {
  font-size: 1.25rem;
  color: #fff; /* White text */
}
</style>
