<script setup>
import { defineProps, onMounted, ref, watch } from "vue";
import { RouterLink } from "vue-router";

// Device status
const status = ref(0);

// Props received
const props = defineProps({
  device: Object,
});

// Update status on mount and when props change
onMounted(() => {
  if (props.device?.IOStatus !== undefined) {
    status.value = props.device.IOStatus;
  }
});

watch(
  () => props.device,
  (newDevice) => {
    if (newDevice?.IOStatus !== undefined) {
      status.value = newDevice.IOStatus;
    }
  }
);
</script>

<template>
  <RouterLink :to="{ name: 'edit-view', params: { id: device.DeviceID } }">
    <div
      class="flex flex-col items-center text-center shadow-lg bg-white rounded-lg hover:scale-105 duration-300"
    >
      <div
        class="w-full py-2 rounded-t-lg text-white text-xl font-semibold"
        :class="device.Status ? 'bg-green-500' : 'bg-red-500'"
      >
        <span>{{ device.Status ? 'Connected' : 'Disconnected' }}</span>
      </div>

      <div class="flex">
        <i class="bi bi-geo-alt-fill text-red-500"></i><p class="text-gray-500 font-medium text-lg truncate w-fit rounded-lg  px-1 m-1">{{ device.Location }}</p>
      </div>
      

      <div class="mt-4">
        <img src="../assets/machine.png" alt="machine" class="w-24 h-24 object-cover" />
      </div>

      <h1 class="mt-4 text-[1.25rem] font-semibold">{{ device.Name }}</h1>
      <p class="text-gray-400 text-xs">{{ device.MAC }}</p>
      <div class="flex justify-between w-full px-10 mt-4 pb-7">
        <div
          v-for="(s, index) in status"
          :key="index"
          class="flex flex-col items-center space-y-1"
        >
          <div
            class="w-6 h-6 rounded-full"
            :class="s == '1' ? 'bg-green-500' : 'bg-red-500'"
          ></div>
          <span class="text-m font-bold">I{{ index + 1 }}</span>
        </div>
      </div>
    </div>
  </RouterLink>
</template>

