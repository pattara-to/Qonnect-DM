<template>
    <div>
        <h2>Register</h2>
        <form @submit.prevent="register">
            <div>
                <label>Username:</label>
                <input v-model="username" type="text" required />
            </div>
            <div>
                <label>Password:</label>
                <input v-model="password" type="password" required />
            </div>
            <button type="submit">Register</button>
        </form>
        <p v-if="message">{{ message }}</p>
    </div>
</template>

<script setup>
import { ref } from "vue";
import { useDeviceStore } from "@/stores/device";

const deviceStore = useDeviceStore();

const username = ref("");
const password = ref("");
const message = ref("");

const register = async () => {
    deviceStore.register({ username: username, password: password });
};
</script>
