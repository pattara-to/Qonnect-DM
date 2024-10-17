<script setup>
import { ref, watch } from "vue";

const props = defineProps({
    toggleAlert: Function,
    confirmMessage: String,
    isModalVisible: Boolean,
});

const emit = defineEmits(["confirm", "cancel"]);

// Reactive states for password inputs
const password = ref("");
const confirmPassword = ref("");
const errorMessage = ref("");

// Form validation and event handling
const confirm = () => {
    if (password.value !== confirmPassword.value) {
        errorMessage.value = "Passwords do not match";
        return;
    }
    if (!password.value || !confirmPassword.value) {
        errorMessage.value = "Please enter both passwords";
        return;
    }
    emit("confirm", password.value); // Pass the password along with the event
};

const cancel = () => {
    emit("cancel");
};
</script>

<template>
    <transition name="fade">
        <div v-if="isModalVisible" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" @click.self="cancel">
            <div
                class="bg-white rounded-xl shadow-2xl transform transition-all sm:max-w-lg sm:w-full"
                role="dialog"
                aria-modal="true"
                aria-labelledby="modal-title"
            >
                <div class="flex justify-end pr-3">
                    <button aria-label="Close" class="text-gray-400 hover:text-gray-600 transition-colors duration-200" @click="cancel">
                        <i class="bi bi-x text-2xl"></i>
                    </button>
                </div>
                <div class="px-6 pb-6 text-center">
                    <h2 class="mt-2 text-2xl leading-6 font-semibold text-gray-800" id="modal-title">
                        {{ confirmMessage }}
                    </h2>
                    <p class="mt-4 text-sm text-gray-500">Reset Password</p>

                    <!-- Form inputs for password reset -->
                    <div class="mt-4">
                        <input type="password" placeholder="New password" v-model="password" class="w-full p-2 border rounded-md" />
                    </div>
                    <div class="mt-4">
                        <input type="password" placeholder="Retype password" v-model="confirmPassword" class="w-full p-2 border rounded-md" />
                    </div>

                    <!-- Display error message if passwords do not match -->
                    <p v-if="errorMessage" class="mt-2 text-sm text-red-500">{{ errorMessage }}</p>

                    <div class="mt-6 flex justify-center space-x-4">
                        <button
                            class="px-6 py-2 bg-green-500 text-white rounded-md font-medium hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors duration-200"
                            @click="confirm"
                        >
                            Confirm
                        </button>
                        <button
                            class="px-6 py-2 bg-gray-200 text-gray-700 rounded-md font-medium hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-colors duration-200"
                            @click="cancel"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </transition>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

.fade-enter-active .fixed,
.fade-leave-active .fixed {
    display: flex;
    align-items: center;
    justify-content: center;
}
</style>
