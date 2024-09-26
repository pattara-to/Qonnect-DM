<script setup>
import { ref, reactive, watch } from "vue";

const props = defineProps({
    toggleModal: Function,
    addDevice: Function,
    modalIsOpen: Boolean,
});

const initialDeviceData = {
    name: "",
    MAC: "",
    description: "",
    location: "",
    MachinePic: "",
};

const deviceData = reactive({ ...initialDeviceData });
const machinePicInput = ref(null);
const machinePicPreview = ref(null);
const duplicateMacError = ref(false);

const triggerMachinePicInput = () => {
    machinePicInput.value.click();
};


const handleMachinePicChange = (event) => {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const img = new Image();
            img.src = reader.result;
            img.onload = () => {
                const canvas = document.createElement("canvas");
                const maxWidth = 500;
                const maxHeight = 500;
                let width = img.width;
                let height = img.height;
                if (width > height) {
                    if (width > maxWidth) {
                        height = Math.round((height *= maxWidth / width));
                        width = maxWidth;
                    }
                } else {
                    if (height > maxHeight) {
                        width = Math.round((width *= maxHeight / height));
                        height = maxHeight;
                    }
                }
                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0, width, height);

                const resizedBase64 = canvas.toDataURL("image/jpeg", 0.8);
                deviceData.MachinePic = resizedBase64.split(",")[1];
                machinePicPreview.value = resizedBase64;
            };
        };
        reader.onerror = (error) => {
            console.error("Error reading file:", error);
        };
    }
};



const handleAddDevice = async () => {
    duplicateMacError.value = false
    try {
        const response = await props.addDevice(deviceData);
        console.log('response',response)
        
        
        if (response == 'Duplicate MAC') {
            duplicateMacError.value = true
            duplicateMacError.value = false
            props.toggleModal();
        }
        console.log('modal',props.modalIsOpen);
    } catch (err) {
        console.error("Unexpected error in handleAddDevice:", err);

    }
};



const closeModalOnOutsideClick = (event) => {
    const modalContent = document.querySelector(".modal-content");
    if (modalContent && !modalContent.contains(event.target)) {
        props.toggleModal();
    }
};


const resetForm = () => {
    Object.assign(deviceData, { ...initialDeviceData });
    machinePicPreview.value = null;
    duplicateMacError.value = false;
};

watch(
    () => props.modalIsOpen,
    (newVal) => {
        if (!newVal) {
            resetForm();
        }
    }
);
</script>

<template>
    <div class="modal block fixed  w-full h-full bg-black/70" @click="closeModalOnOutsideClick">
        <transition name="slide">
            <div v-if="props.modalIsOpen"
                class="modal-content p-6 rounded-lg shadow-lg bg-white fixed right-0 h-[93%] w-[80%] md:w-[25%] flex flex-col items-center overflow-auto transition-all duration-500"
                @click.stop>
                <h2 class="text-xl font-semibold text-gray-800 mb-4">Add Device</h2>
                <div class="relative w-32 h-32 mb-4">
                    <div class="w-32 h-32 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center shadow-md cursor-pointer hover:bg-gray-300"
                        @click="triggerMachinePicInput">
                        <img v-if="machinePicPreview" :src="machinePicPreview" class="object-cover w-full h-full" />
                        <span v-else class="text-gray-500">Upload Image</span>
                    </div>
                    <input ref="machinePicInput" type="file" accept="image/*" @change="handleMachinePicChange"
                        class="hidden" />
                </div>

                <form @submit.prevent="handleAddDevice" class="w-full space-y-3 flex-grow">
                    <div class="flex flex-col w-full">
                        <label class="font-medium text-gray-700 text-sm" for="machine-name">Machine Name</label>
                        <input id="machine-name" type="text" v-model="deviceData.name"
                            class="bg-gray-100 border border-gray-300 rounded-md py-2 px-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                            required />
                    </div>
                    <div class="flex flex-col w-full">
                        <label class="font-medium text-gray-700 text-sm" for="mac-address">MAC Address</label>
                        <input id="mac-address" type="text" v-model="deviceData.MAC" :class="[
                            'bg-gray-100 rounded-md py-2 px-2 mt-1 focus:outline-none focus:ring-2 w-full',
                            duplicateMacError
                                ? 'border border-red-500 focus:border-red-500'
                                : 'border border-gray-300 focus:border-blue-500'
                        ]" aria-describedby="mac-error" required />
                        <p v-if="duplicateMacError" id="mac-error" class="text-red-500 text-sm mt-1">
                            This MAC address already exists. Please enter a unique MAC.
                        </p>
                    </div>

                    <div class="flex flex-col w-full">
                        <label class="font-medium text-gray-700 text-sm" for="description">Description</label>
                        <textarea id="description" v-model="deviceData.description" rows="3"
                            class="bg-gray-100 border border-gray-300 rounded-md py-2 px-2 mt-1 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"></textarea>
                    </div>
                    <div class="flex flex-col w-full">
                        <label class="font-medium text-gray-700 text-sm" for="location">Location</label>
                        <textarea id="location" v-model="deviceData.location" rows="3"
                            class="bg-gray-100 border border-gray-300 rounded-md py-2 px-2 mt-1 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                            required></textarea>
                    </div>

                    <div class="flex justify-end w-full mt-6 space-x-3">
                        <button type="submit" 
                            class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition flex items-center justify-center">
                            <span>Add</span>
                        </button>
                        <button type="button"
                            class="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition"
                            @click="props.toggleModal">
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </transition>
    </div>
</template>

<style scoped>
.slide-enter-active,
.slide-leave-active {
    transition: transform 0.5s ease, opacity 0.5s ease;
}

.slide-enter-from,
.slide-leave-to {
    transform: translateX(100%);
    opacity: 0;
}
</style>
