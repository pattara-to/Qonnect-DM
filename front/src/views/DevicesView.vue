<script setup>
import { onMounted, ref, computed } from "vue";
import Machine from "@/components/Machine.vue";
import { useDeviceStore } from "@/stores/device";
import AddModal from "@/components/AddModal.vue";
import Navbar from "@/components/Navbar.vue";
import Loading from "@/components/Loading.vue";

const deviceStore = useDeviceStore();
const modalIsOpen = ref(false);
const isLoading = ref(true);

onMounted(async () => {
    try {
        await deviceStore.loadDevices();
    } finally {
        setTimeout(() => {
            isLoading.value = false;
        }, 200);
    }
});

setInterval(async () => {
    await deviceStore.loadDevices();
}, 1000);

const toggleModal = () => {
    modalIsOpen.value = !modalIsOpen.value;
};

const addDevice = async (deviceData) => {
    deviceStore.addDevice(deviceData);
    modalIsOpen.value = false;
    await deviceStore.loadDevices();
};

const currentPage = ref(1);
const itemsPerPage = 12;

const paginatedDevices = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return deviceStore.list.slice(start, end);
});

const totalPages = computed(() => {
    return Math.ceil(deviceStore.list.length / itemsPerPage);
});

const goToPage = (page) => {
    if (page >= 1 && page <= totalPages.value) {
        currentPage.value = page;
    }
};
</script>

<template>
    <Navbar />
    <AddModal v-show="modalIsOpen" :toggleModal="toggleModal" :addDevice="addDevice" :modalIsOpen="modalIsOpen" />
    <Loading v-if="isLoading" />

    <div v-else class="flex flex-col h-auto w-full px-10">
        <div class="flex flex-wrap justify-between items-center my-4 px-2 sm:px-4 md:px-6">
            <h1 class="text-xl sm:text-2xl font-semibold text-gray-800">Devices</h1>
            <button @click="toggleModal"
                class="bg-blue-500 text-white py-2 px-6 rounded-lg hover:bg-blue-600 transition shadow-md">
                + Add Device
            </button>
        </div>

        <div
            class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-4 px-2 sm:px-4 md:px-6 mb-4">
            <Machine v-for="device in paginatedDevices" :key="device.id" :device="device" class="w-full" />
        </div>

        <!-- Pagination can be uncommented and used here if necessary -->
        <!-- <div class="flex justify-center items-center space-x-2 mb-4 bg-white py-4 px-2 sm:px-4 md:px-6">
            <button @click="goToPage(currentPage - 1)" :disabled="currentPage === 1"
                class="px-3 py-1 bg-gray-200 text-gray-700 rounded-md disabled:opacity-50 transition-colors duration-200 hover:bg-blue-500 hover:text-white">
                Previous
            </button>

            <div class="flex space-x-1">
                <button v-for="page in totalPages" :key="page" @click="goToPage(page)" :class="[ 
                    'px-3 py-1 rounded-md transition-colors duration-200', 
                    currentPage === page
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-blue-500 hover:text-white',
                ]">
                    {{ page }}
                </button>
            </div>

            <button @click="goToPage(currentPage + 1)" :disabled="currentPage === totalPages"
                class="px-3 py-1 bg-gray-200 text-gray-700 rounded-md disabled:opacity-50 transition-colors duration-200 hover:bg-blue-500 hover:text-white">
                Next
            </button>
        </div> -->
    </div>
</template>
<style scoped>
.slide-fade-enter-active,
.slide-fade-leave-active {
    transition: transform 0.5s ease, opacity 0.5s ease;
}

.slide-fade-enter-from {
    transform: translateX(100%);
    opacity: 0;
}

.slide-fade-leave-to {
    transform: translateX(100%);
    opacity: 0;
}
</style>