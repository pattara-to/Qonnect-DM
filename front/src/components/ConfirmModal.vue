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
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div class="bg-white rounded-xl shadow-2xl transform transition-all sm:max-w-lg sm:w-full" role="dialog"
            aria-modal="true" aria-labelledby="modal-title">
            <div class="flex justify-end p-2">
                <button aria-label="Close" class="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                    @click="cancel">
                    <i class="bi bi-x text-2xl"></i>
                </button>
            </div>
            <div class="px-6 pb-6 text-center">
                <h2 class="mt-2 text-2xl leading-6 font-semibold text-gray-800" id="modal-title">
                    {{ confirmMessage }}
                </h2>
                <p class="mt-4 text-sm text-gray-500">
                    Are you sure you want to proceed? This action cannot be undone.
                </p>
                <div class="mt-6 flex justify-center space-x-4">
                    <button
                        class="px-6 py-2 bg-green-500 text-white rounded-md font-medium hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors duration-200"
                        @click="confirm">
                        Confirm
                    </button>
                    <button
                        class="px-6 py-2 bg-gray-200 text-gray-700 rounded-md font-medium hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-colors duration-200"
                        @click="cancel">
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>