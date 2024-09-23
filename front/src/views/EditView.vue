<script setup>
import { ref, reactive, onMounted } from "vue";
import { useRoute, useRouter, RouterLink } from "vue-router";
import Navbar from "@/components/Navbar.vue";
import Alert from "@/components/Alert.vue";
import ConfirmModal from "@/components/ConfirmModal.vue";
import { useDeviceStore } from "@/stores/device";
import { useConfirm } from "@/stores/useConfirm.js";
import defaultMachinePic from '@/assets/machine.png';
import Loading from "@/components/Loading.vue";


const { isModalVisible, confirmMessage, showConfirm, confirm, cancel } = useConfirm();
const route = useRoute();
const router = useRouter();
const deviceStore = useDeviceStore();
const isLoading = ref(true);


const device = reactive({
    name: "",
    MAC: "",
    description: "",
    location: "",
    status: 0,
    IOStatus: "",
    MachinePic: "",
});

const machinePic = ref(defaultMachinePic);

const alerts = ref([]);
const alert_statuses = ref([0, 0, 0, 0]);
const alert_message = ref("");

const fileInput = ref(null);

onMounted(async () => {
    try {
        await deviceStore.loadDevice(route.params.id);
        await deviceStore.loadAlerts(route.params.id);
        setDevice(deviceStore.selectedDevice);
        alerts.value = deviceStore.alertList;
    } catch (error) {
        console.error("Error loading device or alerts", error);
    } finally {
        setTimeout(() => {
            isLoading.value = false;
        }, 200);
    }
});

const setDevice = (selectedDevice) => {
    if (!selectedDevice) {
        console.error("Selected device is undefined or null.");
        return;
    }
    device.name = selectedDevice.Name || "";
    device.MAC = selectedDevice.MAC || "";
    device.description = selectedDevice.Description || "";
    device.location = selectedDevice.Location || "";
    device.status = selectedDevice.Status || 0;
    device.IOStatus = selectedDevice.IOStatus || "";
    device.MachinePic = selectedDevice.MachinePic || "";
    if (device.MachinePic) {
        machinePic.value = `data:image/jpeg;base64,${device.MachinePic}`;
    } else {
        machinePic.value = defaultMachinePic;
    }
};

const addAlert = async () => {
    if (alert_message.value.trim() !== "") {
        const alertData = {
            alertStatus: alert_statuses.value.join(""),
            alertMessage: alert_message.value.trim(),
            deviceID: route.params.id,
            MAC: device.MAC,
        };
        await deviceStore.addAlert(alertData);
        await deviceStore.loadAlerts(route.params.id);
        resetAlertForm();
        alerts.value = deviceStore.alertList;
    }
};

const resetAlertForm = () => {
    alert_statuses.value = [0, 0, 0, 0];
    alert_message.value = "";
};

const editDevice = async () => {
    const confirmed = await showConfirm("Edit Device?");
    if (confirmed) {
        await deviceStore.editDevice(route.params.id, device);
        if (device.MachinePic) {
            await deviceStore.updateMachinePic(route.params.id, device.MachinePic);
        }
        await deviceStore.loadDevice(route.params.id);
        setDevice(deviceStore.selectedDevice);
    }
};

const removeDevice = async () => {
    const confirmed = await showConfirm("Remove Device?");
    if (confirmed) {
        await deviceStore.removeDevice(route.params.id);
        router.push("/");
    }
};

const editAlert = async (alertID, updatedData) => {
    const confirmed = await showConfirm("Are you sure you want to edit this alert?");
    if (confirmed) {
        await deviceStore.editAlert(alertID, updatedData);
        await deviceStore.loadAlerts(route.params.id);
        alerts.value = deviceStore.alertList;
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

const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
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
                device.MachinePic = resizedBase64.split(",")[1];
                machinePic.value = resizedBase64;

                console.log("Updated MachinePic (base64):", device.MachinePic);
            };
        };
        reader.onerror = (error) => {
            console.error("Error reading file:", error);
        };
        reader.readAsDataURL(file);
    }
};

const triggerFileInput = () => {
    if (fileInput.value) {
        fileInput.value.click();
    }
};
</script>

<template>
    <Navbar />
    <ConfirmModal class="transition duration-300" :toggleAlert="toggleAlert" :confirmMessage="confirmMessage"
        v-show="isModalVisible" @confirm="confirm" @cancel="cancel" />

    <Loading v-if="isLoading" />

    <div v-else class="flex flex-col h-auto w-auto">
        <div class="flex flex-wrap justify-between mt-4 mx-4 sm:mx-8">
            <span class="self-center text-base sm:text-lg ml-10 py-1">
                <RouterLink class="hover:text-gray-500" :to="{ name: 'devices-view' }">Devices</RouterLink>
                >
                <span class="bg-gray-200 text-violet-700 font-semibold rounded-lg m-1 px-2">
                    {{ device.name }}
                </span>
            </span>
        </div>

        <div class="w-full sm:w-4/5 h-auto transition-all duration-300 mx-auto mt-3">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
                <div class="relative flex flex-col justify-center items-center">
                    <img :src="machinePic" class="w-[50%] h-auto rounded-md object-cover" alt="Machine Picture" />
                    <div class="absolute inset-0 flex w-[50%] mx-auto items-center justify-center text-white text-xl bg-black bg-opacity-50 opacity-0 hover:opacity-100 transition-opacity rounded-md cursor-pointer"
                        @click="triggerFileInput">
                        <i class="bi bi-camera"></i>
                    </div>
                    <input ref="fileInput" type="file" accept="image/*" @change="handleImageChange" class="hidden" />
                </div>
                <div>
                    <div class="space-y-4">
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label class="text-gray-600 block font-semibold mb-1">Machine Name</label>
                                <input type="text" v-model="device.name"
                                    class="w-full rounded-md text-base h-10 bg-gray-100 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    aria-label="Machine Name" />
                            </div>

                            <div>
                                <label class="text-gray-600 block font-semibold mb-1">MAC</label>
                                <input type="text" v-model="device.MAC"
                                    class="w-full rounded-md text-base h-10 bg-gray-100 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    aria-label="MAC Address" />
                            </div>
                        </div>

                        <div>
                            <label class="text-gray-600 block font-semibold mb-1">Description</label>
                            <input type="text" v-model="device.description"
                                class="w-full rounded-md text-base h-10 bg-gray-100 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                aria-label="Description" />
                        </div>

                        <div>
                            <label class="text-gray-600 block font-semibold mb-1">Location</label>
                            <input type="text" v-model="device.location"
                                class="w-full rounded-md text-base h-10 bg-gray-100 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                aria-label="Location" />
                        </div>

                        <div class="flex flex-wrap items-center gap-4 mt-4">
                            <span class="font-semibold text-gray-600 ">Status : </span>
                            <div class="w-5 h-5 rounded-full" :class="device.status ? 'bg-green-500' : 'bg-red-500'">
                            </div>
                            <span class="text-lg">
                                {{ device.status ? 'Connected' : 'Disconnected' }}
                            </span>
                            <div class="ml-auto space-x-1 mt-2 sm:mt-0">
                                <button
                                    class="bg-blue-500 text-white py-2 px-6 rounded-lg hover:bg-blue-600 transition shadow-md"
                                    @click="editDevice" aria-label="Save Changes">
                                    Edit
                                </button>
                                <button
                                    class="bg-red-500 text-white py-2 px-6 rounded-lg hover:bg-red-600 transition shadow-md"
                                    @click="removeDevice" aria-label="Delete Device">
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div
            class="w-full sm:w-4/5 my-2 mx-auto bg-gray-100 rounded-lg text-base transition-all duration-300">
            <div
                class="flex flex-wrap w-full h-full justify-around items-center mb-4 font-semibold text-lg bg-gray-200 p-2 rounded-t-lg">
                <div class="flex justify-between w-full sm:w-1/2 mb-2 sm:mb-0">
                    <div class="w-16 text-center">I1</div>
                    <div class="w-16 text-center">I2</div>
                    <div class="w-16 text-center">I3</div>
                    <div class="w-16 text-center">I4</div>
                </div>
                <div class="w-full sm:w-1/4 text-center">Alert Name</div>
                <div class="w-16"></div>
            </div>

            <div class="flex flex-wrap w-full h-full justify-around items-center space-y-2 sm:space-y-0">
                <div class="flex justify-between w-full sm:w-1/2 mb-2 sm:mb-0 px-3">
                    <div class="flex items-center space-x-2 ml-3 pl-[0.15rem]">
                        <input type="checkbox" id="i1-status" :checked="alert_statuses[0] === '1'"
                            @change="alert_statuses[0] = alert_statuses[0] === '1' ? '0' : '1'"
                            class="h-6 w-6 rounded-full appearance-none cursor-pointer"
                            :class="alert_statuses[0] === '1' ? 'bg-green-500 border-green-500' : 'bg-red-500 border-red-500'" />
                    </div>
                    <div class="flex items-center space-x-2 pr-[0.35rem] pl-[0.35rem]">
                        <input type="checkbox" id="i2-status" :checked="alert_statuses[1] === '1'"
                            @change="alert_statuses[1] = alert_statuses[1] === '1' ? '0' : '1'"
                            class="h-6 w-6 rounded-full appearance-none cursor-pointer"
                            :class="alert_statuses[1] === '1' ? 'bg-green-500 border-green-500' : 'bg-red-500 border-red-500'" />
                    </div>
                    <div class="flex items-center space-x-2 pr-[0.35rem]">
                        <input type="checkbox" id="i3-status" :checked="alert_statuses[2] === '1'"
                            @change="alert_statuses[2] = alert_statuses[2] === '1' ? '0' : '1'"
                            class="h-6 w-6 rounded-full appearance-none cursor-pointer"
                            :class="alert_statuses[2] === '1' ? 'bg-green-500 border-green-500' : 'bg-red-500 border-red-500'" />
                    </div>
                    <div class="flex items-center space-x-2 pr-[0.35rem]">
                        <input type="checkbox" id="i4-status" :checked="alert_statuses[3] === '1'"
                            @change="alert_statuses[3] = alert_statuses[3] === '1' ? '0' : '1'"
                            class="h-6 w-6 rounded-full appearance-none cursor-pointer"
                            :class="alert_statuses[3] === '1' ? 'bg-green-500 border-green-500' : 'bg-red-500 border-red-500'" />
                    </div>
                </div>
                <input type="text" class="w-full sm:w-1/4 p-1 pl-2 bg-gray-200 rounded-lg mt-2 sm:mt-0"
                    v-model="alert_message" placeholder="Alert Message" aria-label="Alert Message" />
                <button
                    class="text-[#008CBA] border px-2 py-1 rounded-lg border-[#008CBA] transition-all duration-300 hover:bg-blue-200 mt-2 sm:mt-0"
                    @click="addAlert" aria-label="Add Alert">
                    Add Alert
                </button>
            </div>

            <div class="overflow-y-scroll h-45 py-3">
                <div class="flex flex-col my-2" v-for="alert in alerts" :key="alert.id">
                    <Alert :alert="alert" :editAlert="editAlert" :removeAlert="removeAlert" />
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.relative {
    position: relative;
}

.absolute {
    position: absolute;
}

.object-cover {
    object-fit: cover;
}

.cursor-pointer {
    cursor: pointer;
}

.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.5s;
}

.fade-enter,
.fade-leave-to {
    opacity: 0;
}
</style>