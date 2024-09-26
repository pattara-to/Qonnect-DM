<script setup>
import { onMounted, ref } from "vue";
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
}, 10000);

const toggleModal = () => {
    modalIsOpen.value = !modalIsOpen.value;
};

const addDevice = async (deviceData) => {
    const res = await deviceStore.addDevice(deviceData);
    await deviceStore.loadDevices();
    return res;
};
</script>
<template>
    <Navbar />
    <AddModal v-show="modalIsOpen" :toggleModal="toggleModal" :addDevice="addDevice" :modalIsOpen="modalIsOpen" />
    <Loading v-if="isLoading" />

    <div v-else class="flex flex-col w-full px-12">
        <div class="flex flex-wrap justify-between items-center my-4">
            <h1 class="text-xl sm:text-2xl font-semibold text-gray-800">Devices</h1>
            <button @click="toggleModal"
                class="bg-blue-500 text-white py-2 px-6 rounded-lg hover:bg-blue-600 transition shadow-md">
                + Add Device
            </button>
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-2 sm:gap-4 mb-4">
            <Machine v-for="device in deviceStore.list" :key="device.id" :device="device" class="w-full" />
        </div>
    </div>
</template>
