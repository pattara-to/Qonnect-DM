<script setup>
import { ref, reactive, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import Navbar from "@/components/Navbar.vue";
import Alert from "@/components/Alert.vue";
import ConfirmModal from "@/components/ConfirmModal.vue";
import { useDeviceStore } from "@/stores/device";
import { useConfirm } from "@/stores/useConfirm.js";

const { isModalVisible, confirmMessage, showConfirm, confirm, cancel } = useConfirm();
const route = useRoute();
const router = useRouter();
const deviceStore = useDeviceStore();

const device = reactive({
  name: "",
  MAC: "",
  description: "",
  location: "",
});

const alerts = ref([]);
const alert_statuses = ref([0, 0, 0, 0]);
const alert_message = ref("");

// On component mount, load the device and its alerts
onMounted(async () => {
  await deviceStore.loadDevice(route.params.id);
  await deviceStore.loadAlerts(route.params.id);
  setDevice(deviceStore.selectedDevice);
  alerts.value = deviceStore.alertList;
});

const setDevice = (selectedDevice) => {
  device.name = selectedDevice.Name;
  device.MAC = selectedDevice.MAC;
  device.description = selectedDevice.Description;
  device.location = selectedDevice.Location;
  device.status = selectedDevice.Status;
  device.IOStatus = selectedDevice.IOStatus;
};

// Add new alert
const addAlert = async () => {
  if (alert_message.value !== "") {
    const alertData = {
      alertStatus: alert_statuses.value.join(""),
      alertMessage: alert_message.value,
      deviceID: route.params.id,
      MAC: device.MAC,
    };
    await deviceStore.addAlert(alertData);
    await deviceStore.loadAlerts(route.params.id);
    
    // Reset the form after adding an alert
    resetAlertForm();
    alerts.value = deviceStore.alertList;
  }
};

// Reset alert form fields
const resetAlertForm = () => {
  alert_statuses.value = [0, 0, 0, 0];  // Reset all statuses to '0' (OFF)
  alert_message.value = "";  // Clear the alert message
};

const editDevice = async () => {
  const confirmed = await showConfirm("Edit Device?");
  if (confirmed) {
    await deviceStore.editDevice(route.params.id, device);
  }
};

const removeDevice = async () => {
  const confirmed = await showConfirm("Remove Device?");
  if (confirmed) {
    await deviceStore.removeDevice(route.params.id);
    router.push("/");
  }
};

const removeAlert = async (alertID) => {
  const confirmed = await showConfirm("Remove Alert?");
  if (confirmed) {
    await deviceStore.removeAlert(alertID);
    await deviceStore.loadAlerts(route.params.id);
    alerts.value = deviceStore.alertList;
  }
};
</script>

<template>
  <Navbar />
  <!-- Confirmation Modal -->
  <transition name="fade" mode="out-in">
    <ConfirmModal :toggleAlert="toggleAlert" :confirmMessage="confirmMessage" v-show="isModalVisible" @confirm="confirm" @cancel="cancel" />
  </transition>

  <div class="flex flex-col h-[93%]">
    <!-- Breadcrumb and Navigation -->
    <div class="flex justify-between mt-4 mx-8">
      <span class="self-center text-lg ml-2 py-1">
        <RouterLink :to="{ name: 'devices-view' }">Devices</RouterLink> >
        <span class="bg-gray-200 text-violet-700 font-semibold rounded-lg m-1 px-2">{{ device.name }}</span>
      </span>
    </div>

    <!-- Device Details Section -->
    <div class="w-4/5 h-auto transition-all duration-300 mx-auto mt-3">
      <div class="grid grid-cols-[35%,1fr] gap-4 p-4 bg-white rounded-lg shadow-md">
        <!-- Image Section -->
        <div class="flex justify-center items-center">
          <img src="../assets/machine.png" class="max-w-full h-auto rounded-md" />
        </div>

        <!-- Form Section -->
        <div>
          <div class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block font-semibold mb-1">Machine Name</label>
                <input type="text" v-model="device.name"
                  class="w-full rounded-md text-base h-8 bg-gray-100 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>

              <div>
                <label class="block font-semibold mb-1">MAC</label>
                <input type="text" v-model="device.MAC"
                  class="w-full rounded-md text-base h-8 bg-gray-100 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>

            <div>
              <label class="block font-semibold mb-1">Description</label>
              <input type="text" v-model="device.description"
                class="w-full rounded-md text-base h-8 bg-gray-100 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            <div>
              <label class="block font-semibold mb-1">Location</label>
              <input type="text" v-model="device.location"
                class="w-full rounded-md text-base h-8 bg-gray-100 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            <div class="flex items-center gap-4 mt-4">
              <span class="font-semibold text-lg">Status:</span>
              <div class="w-4 h-4 rounded-full" :class="device.status ? 'bg-green-500' : 'bg-red-500'"></div>
              <span class="text-sm">{{ device.status ? 'Connect' : 'Disconnect' }}</span>
              <div class="ml-auto space-x-1">
                <button class="text-white bg-blue-500 border border-blue-500 px-3 py-1 rounded-md hover:bg-blue-600 transition-all"
                  @click="editDevice">Edit</button>
                <button class="text-white bg-red-500 border border-red-500 px-3 py-1 rounded-md hover:bg-red-600 transition-all"
                  @click="removeDevice">Delete</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Alerts Section -->
    <div class="w-4/5 shadow-md my-2 p-4 mx-auto bg-gray-100 rounded-lg text-base transition-all duration-300 hover:shadow-lg">
      <div class="flex justify-around items-center mb-4 font-semibold text-lg">
        <div class="flex justify-between w-1/2">
          <div class="w-16">I1</div>
          <div class="w-16">I2</div>
          <div class="w-16">I3</div>
          <div class="w-16">I4</div>
        </div>
        <div class="w-1/4">AlertName</div>
        <div class="w-16"></div>
      </div>

      <!-- Alerts Input Form -->
      <div class="flex justify-around items-center mb-2">
        <div class="flex justify-between w-1/2">
          <select v-model="alert_statuses[0]" class="w-16 h-6 text-center rounded-lg"
            :class="alert_statuses[0] == 1 ? 'text-green-500' : 'text-red-500'">
            <option value="0" class="text-red-500">OFF</option>
            <option value="1" class="text-green-500">ON</option>
          </select>
          <select v-model="alert_statuses[1]" class="w-16 h-6 text-center rounded-lg"
            :class="alert_statuses[1] == 1 ? 'text-green-500' : 'text-red-500'">
            <option value="0" class="text-red-500">OFF</option>
            <option value="1" class="text-green-500">ON</option>
          </select>
          <select v-model="alert_statuses[2]" class="w-16 h-6 text-center rounded-lg"
            :class="alert_statuses[2] == 1 ? 'text-green-500' : 'text-red-500'">
            <option value="0" class="text-red-500">OFF</option>
            <option value="1" class="text-green-500">ON</option>
          </select>
          <select v-model="alert_statuses[3]" class="w-16 h-6 text-center rounded-lg"
            :class="alert_statuses[3] == 1 ? 'text-green-500' : 'text-red-500'">
            <option value="0" class="text-red-500">OFF</option>
            <option value="1" class="text-green-500">ON</option>
          </select>
        </div>
        <input type="text" class="w-1/4 p-1 pl-2 bg-gray-200 rounded-lg" v-model="alert_message" placeholder="Alert Message" />
        <button class="text-[#008CBA] border px-2 py-1 rounded-lg border-[#008CBA] transition-all duration-300 hover:bg-blue-200"
          @click="addAlert">Add Alert</button>
      </div>

      <!-- Alert List -->
      <div class="overflow-y-scroll h-36">
        <div class="flex flex-col my-2" v-for="alert in alerts" :key="alert.id">
          <Alert :alert="alert" :editAlert="editAlert" :removeAlert="removeAlert" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}

.fade-enter,
.fade-leave-to {
  opacity: 0;
}
</style>
