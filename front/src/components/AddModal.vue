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
};

const deviceData = reactive({ ...initialDeviceData });

const addDevice = () => {
  if (!deviceData.name || !deviceData.MAC || !deviceData.location) {
    alert("Please fill in all required fields.");
    return;
  }
  props.addDevice(deviceData); 
  resetForm(); 
};

const closeModalOnOutsideClick = (event) => {
  const modalContent = document.querySelector(".modal-content");
  if (modalContent && !modalContent.contains(event.target)) {
    props.toggleModal();
  }
};

const resetForm = () => {
  Object.assign(deviceData, { ...initialDeviceData });
};

watch(() => props.modalIsOpen, (newVal) => {
  if (!newVal) {
    resetForm(); 
  }
});
</script>

<template>
<<<<<<< HEAD
    <div class="modal block fixed z-1 w-full h-full bg-black/70" @click="closeModalOnOutsideClick">
        <transition name="slide">
            <div
                v-if="props.modalIsOpen"
                class="modal-content p-8 rounded-xl shadow-lg bg-white fixed right-0 h-[93%] w-[90%] md:w-[30%] flex flex-col items-center overflow-auto transition-all duration-500"
                @click.stop
            >
                <!-- Add Device Title -->
                <h2 class="text-2xl font-bold text-gray-800 mb-6">Add Device</h2>

                <!-- Device Image -->
                <img src="../assets/machine.png" alt="machine" class="w-40 h-auto my-[3rem] object-cover" />

                <!-- Form Fields -->
                <div class="w-full space-y-4 flex-grow">
                    <!-- Machine Name -->
                    <div class="flex flex-col w-full">
                        <label class="font-semibold text-gray-700">Machine Name</label>
                        <input
                            type="text"
                            v-model="deviceData.name"
                            class="bg-gray-100 border border-gray-300 rounded-lg py-2 px-3 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                            required
                        />
                    </div>

                    <!-- MAC Address -->
                    <div class="flex flex-col w-full">
                        <label class="font-semibold text-gray-700">MAC Address</label>
                        <input
                            type="text"
                            v-model="deviceData.MAC"
                            class="bg-gray-100 border border-gray-300 rounded-lg py-2 px-3 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                        />
                    </div>

                    <!-- Description -->
                    <div class="flex flex-col w-full">
                        <label class="font-semibold text-gray-700">Description</label>
                        <textarea
                            v-model="deviceData.description"
                            rows="4"
                            class="bg-gray-100 border border-gray-300 rounded-lg py-2 px-3 mt-1 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                        ></textarea>
                    </div>

                    <!-- Location -->
                    <div class="flex flex-col w-full">
                        <label class="font-semibold text-gray-700">Location</label>
                        <textarea
                            v-model="deviceData.location"
                            rows="4"
                            class="bg-gray-100 border border-gray-300 rounded-lg py-2 px-3 mt-1 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                        ></textarea>
                    </div>
                </div>

                <!-- Buttons -->
                <div class="flex justify-end w-full mt-6 space-x-4">
                    <button
                        class="px-4 py-2 border border-red-500 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition"
                        @click="props.toggleModal"
                    >
                        Cancel
                    </button>
                    <button
                        class="px-4 py-2 border border-green-500 text-green-500 rounded-lg hover:bg-green-500 hover:text-white transition"
                        @click="addDevice()"
                    >
                        Add
                    </button>
                </div>
            </div>
        </transition>
    </div>
=======
  <div class="modal block fixed z-1 w-full h-full bg-black/70" @click="closeModalOnOutsideClick">
    <transition name="slide">
      <div
        v-if="props.modalIsOpen"
        class="modal-content p-6 rounded-lg shadow-lg bg-white fixed right-0 h-[93%] w-[80%] md:w-[25%] flex flex-col items-center overflow-auto transition-all duration-500"
        @click.stop
      >
        <h2 class="text-xl font-semibold text-gray-800 mb-4">Add Device</h2>
        <img src="../assets/machine.png" alt="machine" class="w-32 h-auto mb-4 object-cover" />

        <form @submit.prevent="addDevice" class="w-full space-y-3 flex-grow">
          <div class="flex flex-col w-full">
            <label class="font-medium text-gray-700 text-sm">Machine Name</label>
            <input
              type="text"
              v-model="deviceData.name"
              class="bg-gray-100 border border-gray-300 rounded-md py-2 px-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
              required
            />
          </div>

          <div class="flex flex-col w-full">
            <label class="font-medium text-gray-700 text-sm">MAC Address</label>
            <input
              type="text"
              v-model="deviceData.MAC"
              class="bg-gray-100 border border-gray-300 rounded-md py-2 px-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
              required
            />
          </div>

          <div class="flex flex-col w-full">
            <label class="font-medium text-gray-700 text-sm">Description</label>
            <textarea
              v-model="deviceData.description"
              rows="3"
              class="bg-gray-100 border border-gray-300 rounded-md py-2 px-2 mt-1 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
            ></textarea>
          </div>

          <div class="flex flex-col w-full">
            <label class="font-medium text-gray-700 text-sm">Location</label>
            <textarea
              v-model="deviceData.location"
              rows="3"
              class="bg-gray-100 border border-gray-300 rounded-md py-2 px-2 mt-1 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
              required
            ></textarea>
          </div>

          <div class="flex justify-end w-full mt-4 space-x-3">
            <button type="submit" class="px-3 py-2 border border-green-500 text-green-500 rounded-md hover:bg-green-500 hover:text-white transition">
              Add
            </button>
            <button type="button" class="px-3 py-2 border border-red-500 text-red-500 rounded-md hover:bg-red-500 hover:text-white transition" @click="props.toggleModal">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </transition>
  </div>
>>>>>>> dev
</template>

<style scoped>
.slide-enter-active,
.slide-leave-active {
  transition: width 0.5s ease, opacity 0.5s ease;
}

.slide-enter-from,
.slide-leave-to {
  width: 0;
  opacity: 0;
}
</style>
