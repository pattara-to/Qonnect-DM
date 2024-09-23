<script setup>
import { onMounted, ref, watch } from "vue";
import { RouterLink } from "vue-router";
import defaultMachinePic from '@/assets/machine.png'; 

const status = ref(0);

const props = defineProps({
  device: Object,
});

const machinePic = ref(defaultMachinePic);

onMounted(() => {
  if (props.device?.IOStatus !== undefined) {
    status.value = props.device.IOStatus;
  }
  if (props.device?.MachinePic) {
    machinePic.value = `data:image/jpeg;base64,${props.device.MachinePic}`;
  } else {
    machinePic.value = defaultMachinePic;
  }
});

watch(
  () => props.device,
  (newDevice) => {
    if (newDevice?.IOStatus !== undefined) {
      status.value = newDevice.IOStatus;
    }
    if (newDevice?.MachinePic) {
      machinePic.value = `data:image/jpeg;base64,${newDevice.MachinePic}`;
    } else {
      machinePic.value = defaultMachinePic;
    }
  }
);
</script>

<template>
  <RouterLink :to="{ name: 'edit-view', params: { id: device.DeviceID } }">
    <div class="flex flex-col items-center text-center shadow-lg bg-white rounded-lg hover:scale-105 duration-300">
    
      <div
        class="w-full py-1.5 rounded-t-lg text-white text-lg font-semibold"
        :class="device.Status ? 'bg-green-500' : 'bg-red-500'"
      >
        <span>{{ device.Status ? 'Connected' : 'Disconnected' }}</span>
      </div>
    
      <div class="flex mt-3">
        <i class="bi bi-geo-alt-fill text-red-500"></i>
        <p
          class="text-gray-500 font-medium text-base truncate w-fit rounded-lg px-1 mx-1"
        >
          {{ device.Location }}
        </p>
      </div>
      
      <div class="mt-3">
        <img
          :src="machinePic"
          alt="machine"
          class="w-20 h-20 rounded-md object-cover"
        />
      </div>
      
      <h1 class="mt-3 text-lg font-semibold">{{ device.Name }}</h1>
      <p class="text-gray-400 text-xs">{{ device.MAC }}</p>
      
      <div class="flex justify-between w-full px-8 mt-3 pb-5">
        <div
          v-for="(s, index) in status"
          :key="index"
          class="flex flex-col items-center space-y-1"
        >
          <div
            class="w-5 h-5 rounded-full"
            :class="s == '1' ? 'bg-green-500' : 'bg-red-500'"
          ></div>
          <span class="text-sm font-bold">I{{ index + 1 }}</span>
        </div>
      </div>
      
    </div>
  </RouterLink>
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
