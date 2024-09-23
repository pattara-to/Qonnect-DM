<script setup>
import { RouterLink, useRoute } from "vue-router";
const route = useRoute();
</script>

<template>
  <div class="bg-[#242A2D] flex h-auto w-full py-1 text-white justify-between items-center px-4 sm:px-8 md:px-16">
    <img
      src="../assets/QonnectLogoWhite.svg"
      alt="Qonnect Logo"
      class="h-7 my-auto"
    />

    <div class="w-full sm:w-32 flex justify-around items-center mb-2">
      <RouterLink :to="{ name: 'devices-view' }">
        <i
          :class="[
            'bi',
            route.name === 'devices-view' ? 'bi-house-fill' : 'bi-house',
            route.name === 'devices-view' ? 'text-white' : 'text-gray-400',
          ]"
        ></i>
      </RouterLink>

      <RouterLink :to="{ name: 'profile-view' }">
        <i
          :class="[
            'bi',
            route.name === 'profile-view' ? 'bi-person-fill' : 'bi-person',
            route.name === 'profile-view' ? 'text-white' : 'text-gray-400',
          ]"
        ></i>
      </RouterLink>

      <RouterLink :to="{ name: 'login-view' }">
        <i
          :class="[
            'bi',
            route.name === 'login-view' ? 'bi-box-arrow-right-fill' : 'bi-box-arrow-right',
            route.name === 'login-view' ? 'text-white' : 'text-gray-400',
          ]"
        ></i>
      </RouterLink>
    </div>
  </div>
</template>

<style scoped>

i {
  font-size: 24px;
  font-weight: bold;
  transition: color 0.3s;
}

i:hover {
  color: #ffffffda;
}
</style>

