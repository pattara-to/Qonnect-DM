<script setup>
import { useDeviceStore } from "@/stores/device";
import { reactive, ref } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const deviceStore = useDeviceStore();

const userData = reactive({
  email: "",
  password: "",
});

const loginError = ref(""); // To display error messages

const login = async () => {
  loginError.value = ""; // Reset error message
  if (userData.email === "" || userData.password === "") {
    loginError.value = "Both email and password are required.";
    return;
  }

  try {
    const res = await deviceStore.login(userData);
    if (res.isOk) {
      router.push({ name: "devices-view" });
    } else {
      loginError.value = "Login failed. Please check your credentials.";
    }
  } catch (error) {
    loginError.value = "An error occurred. Please try again later.";
  }
};
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-[#242A2D]">
    <div class="bg-white w-full max-w-md p-8 rounded-xl shadow-md">
      <div class="text-center mb-6">
        <img src="../assets/QonnectLogo.svg" alt="Qonnect Logo" class="h-16 mx-auto" />
      </div>
      
      <div class="mb-4">
        <label for="email" class="block text-sm font-semibold text-gray-700 mb-2">Email</label>
        <input 
          type="email" 
          id="email" 
          v-model="userData.email" 
          class="bg-gray-100 border border-gray-300 rounded-lg w-full h-12 p-4 text-gray-700 focus:outline-none focus:border-blue-500" 
          placeholder="Enter your email"
          @keyup.enter="login"
        />
      </div>
      
      <div class="mb-6">
        <label for="password" class="block text-sm font-semibold text-gray-700 mb-2">Password</label>
        <input 
          type="password" 
          id="password" 
          v-model="userData.password" 
          class="bg-gray-100 border border-gray-300 rounded-lg w-full h-12 p-4 text-gray-700 focus:outline-none focus:border-blue-500" 
          placeholder="Enter your password"
          @keyup.enter="login"
        />
      </div>

      <div v-if="loginError" class="text-red-500 text-sm mb-4 text-center">
        {{ loginError }}
      </div>

      <button 
        class="bg-blue-600 text-white font-semibold w-full h-12 rounded-lg focus:outline-none transition-all hover:bg-blue-700"
        @click="login"
      >
        Login
      </button>
    </div>
  </div>
</template>
