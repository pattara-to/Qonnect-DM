<script setup>
import { onMounted, ref } from "vue";
import Machine from "@/components/Machine.vue";
import { useDeviceStore } from "@/stores/device";
import AddModal from "@/components/AddModal.vue";
import Navbar from "@/components/Navbar.vue";

const deviceStore = useDeviceStore();
const modalIsOpen = ref(false);

onMounted(async () => {
    await deviceStore.loadDevices();
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
</script>

<template>
    <Navbar />

    <AddModal :toggleModal="toggleModal" :addDevice="addDevice" :modalIsOpen="modalIsOpen" v-show="modalIsOpen" />

    <div class="flex flex-col h-[93%]">
        <div class="flex justify-between items-center my-6 px-16">
            <h1 class="text-3xl font-semibold text-gray-800">Devices</h1>
            <button @click="toggleModal" class="rounded-lg px-6 py-2 text-lg font-medium text-white bg-[#008cba] hover:bg-[#0079a1] transition">
                + Add Device
            </button>
        </div>

        <div class="grid grid-cols-6 gap-6 mx-16 mb-6">
            <Machine :device="device" v-for="device in deviceStore.list" :key="device.id" />
        </div>
    </div>
</template>
