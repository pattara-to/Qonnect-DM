<template>
    <transition name="fade">
        <div class="fixed top-[4rem] left-0 right-0 z-50">
            <div
                class="relative bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded w-full max-w-lg mx-auto">
                <strong class="font-bold">Error : </strong>
                <span class="block sm:inline">{{ message }}</span>
                <p class="text-sm mt-2">{{ description }}</p>
                <button @click="props.toggleAlert" aria-label="Close alert"
                    class="absolute top-0 right-0 px-4 py-3 text-3xl">
                    &times;
                </button>
            </div>
        </div>
    </transition>
</template>

<script setup>
const props = defineProps({
    toggleAlert: Function,
    message: {
        type: String,
        default: "",
    },
    description: {
        type: String,
        default: "",
    },
});
</script>

<style scoped>
.fade-enter-active, .fade-leave-active {
    transition: opacity 0.1s ease;
}

.fade-enter-from, .fade-leave-to {
    opacity: 0;
}
</style>