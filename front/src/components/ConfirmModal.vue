<script setup>
const props = defineProps({
    toggleAlert: Function,
    confirmMessage: String,
});

const emit = defineEmits(["confirm", "cancel"]);

const confirm = () => {
    emit("confirm");
};

const cancel = () => {
    emit("cancel");
};
</script>

<template>
    <!-- Modal Background -->
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
        <!-- Modal Box -->
        <div class="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm md:max-w-md text-center space-y-3">

            <!-- Header Section -->
            <div class="flex justify-between items-center">
                <h2 class="text-xl font-semibold">{{ confirmMessage }}</h2>
                <button aria-label="Close" class="text-gray-500 hover:text-gray-700" @click="cancel">
                    <span class="text-4xl">&times;</span>
                </button>
            </div>
            <hr class="border" />
            <!-- Buttons Section -->
            <div class="flex justify-center space-x-6 pt-5">
                <button class="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition duration-200"
                    @click="cancel">
                    Cancel
                </button>
                <button class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition duration-200"
                    @click="confirm">
                    Confirm
                </button>
            </div>
        </div>
    </div>
</template>
