<script setup>
import { ref, reactive, onMounted } from "vue";
import { useRoute, useRouter, RouterLink } from "vue-router";
import Navbar from "@/components/Navbar.vue";
import Alert from "@/components/Alert.vue";
import ConfirmModal from "@/components/ConfirmModal.vue";
import { useDeviceStore } from "@/stores/device";
import { useConfirm } from "@/stores/useConfirm.js";
import defaultMachinePic from "@/assets/machine.png";
import Loading from "@/components/Loading.vue";
import AlertModal from "@/components/AlertModal.vue";

const { isModalVisible, confirmMessage, showConfirm, confirm, cancel } = useConfirm();
const route = useRoute();
const router = useRouter();
const deviceStore = useDeviceStore();
const isLoading = ref(true);
const modalIsOpen = ref(false);
const duplicateAlertError = ref(false);
const errorMessage = ref({
    message: "",
    description: ""
});

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

// setInterval(async () => {
//     await deviceStore.loadDevice(route.params.id);
// }, 1000);

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
        try {
            const response = await deviceStore.addAlert(alertData);
            if (response === 'Duplicate Alert') {
                duplicateAlertError.value = true;
                handleDuplicateAlert();
                errorMessage.value.message = "This Alert already exists";
                errorMessage.value.description = "This Alert already exists. Please enter a another Alert."
                resetAlertForm();
            } else {
                duplicateAlertError.value = false;
                await deviceStore.loadAlerts(route.params.id);
                resetAlertForm();
                alerts.value = deviceStore.alertList;
            }
        } catch (error) {
            console.error("Error adding alert:", error);
        }
    }
};


const resetAlertForm = () => {
    alert_statuses.value = [0, 0, 0, 0];
    alert_message.value = "";
};

const editDevice = async () => {
    const confirmed = await showConfirm("Edit Device?");
    if (confirmed) {
        try {
            const response = await deviceStore.editDevice(route.params.id, device);
            if (response === 'Duplicate Mac') {
                await deviceStore.loadDevice(route.params.id);
                setDevice(deviceStore.selectedDevice);
                duplicateAlertError.value = true;
                errorMessage.value.message = "This MAC address already exists";
                errorMessage.value.description = "This MAC address already exists. Please enter a unique MAC."
                handleDuplicateAlert();
            } else {
                duplicateAlertError.value = false;
                if (device.MachinePic) {
                    await deviceStore.updateMachinePic(route.params.id, device.MachinePic);
                }
                await deviceStore.loadDevice(route.params.id);
                setDevice(deviceStore.selectedDevice);
            }
        } catch (error) {
            console.error("Error editing device:", error);
        }
    }
};


const removeDevice = async () => {
    const confirmed = await showConfirm("Remove Device?");
    if (confirmed) {
        await deviceStore.removeDevice(route.params.id);
        router.push("/");
    }
};

const editAlertHandler = async (alertID, updatedData) => {
    const confirmed = await showConfirm("Edit this alert?");
    if (confirmed) {
        try {
            const response = await deviceStore.editAlert(alertID, updatedData);
            if (response === 'Duplicate Alert') {
                duplicateAlertError.value = true;
                handleDuplicateAlert();
                errorMessage.value.message = "This Alert already exists";
                errorMessage.value.description = "This Alert already exists. Please enter a another Alert."
                await deviceStore.loadAlerts(route.params.id);
                alerts.value = deviceStore.alertList;
            } else {
                duplicateAlertError.value = false;
                await deviceStore.loadAlerts(route.params.id);
                alerts.value = deviceStore.alertList;
            }
        } catch (error) {
            console.error("Error editing alert:", error);
        }
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

const toggleModal = () => {
    isModalVisible.value = !isModalVisible.value;
};

const toggleAlert = () => {
    modalIsOpen.value = !modalIsOpen.value;
};

const handleDuplicateAlert = () => {
    modalIsOpen.value = true;
    setTimeout(() => {
        modalIsOpen.value = false;
    }, 3000);
};

const handleAlertUpdated = async () => {
    await deviceStore.loadAlerts(route.params.id);
    alerts.value = deviceStore.alertList;
};

</script>

<template>
    <Navbar />
    <ConfirmModal class="transition duration-300" :toggleModal="toggleModal" :confirmMessage="confirmMessage"
        v-show="isModalVisible" @confirm="confirm" @cancel="cancel" />

    <AlertModal v-show="modalIsOpen" :toggleAlert="toggleAlert" :message="errorMessage.message"
        :description="errorMessage.description" />

    <Loading v-if="isLoading" />


    <div v-else class="flex flex-col h-auto w-auto">
        <div class="flex flex-wrap justify-between mt-4 mx-4 sm:mx-8">
            <span class="self-center text-base sm:text-lg ml-10 py-1">
                <RouterLink class="hover:text-gray-500" :to="{ name: 'devices-view' }">
                    Devices
                </RouterLink>
                >
                <span class="bg-gray-200 text-violet-700 font-semibold rounded-lg m-1 px-2">
                    {{ device.name }}
                </span>
            </span>
        </div>


        <div class="w-full sm:w-4/5 h-auto transition-all duration-300 mx-auto mt-3">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
                <div class="relative flex flex-col justify-center items-center">
                    <img :src="machinePic" class="w-[50%] h-auto max-h-[300px] rounded-md object-cover"
                        alt="Machine Picture" />
                    <div class="absolute inset-0 flex w-[50%] h-auto mx-auto items-center justify-center text-white text-xl bg-black bg-opacity-50 opacity-0 hover:opacity-100 transition-opacity rounded-md cursor-pointer"
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
                                    maxlength="30" placeholder="Enter Machine Name" />
                            </div>

                            <div>
                                <label class="text-gray-600 block font-semibold mb-1">MAC Address</label>
                                <input type="text" v-model="device.MAC"
                                    class="w-full rounded-md text-base h-10 bg-gray-100 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    maxlength="20" placeholder="Enter MAC Address" />
                            </div>
                        </div>

                        <div>
                            <label class="text-gray-600 block font-semibold mb-1">Description</label>
                            <input type="text" v-model="device.description"
                                class="w-full rounded-md text-base h-10 bg-gray-100 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                maxlength="50" placeholder="Enter Description" />
                        </div>

                        <div>
                            <label class="text-gray-600 block font-semibold mb-1">Location</label>
                            <input type="text" v-model="device.location"
                                class="w-full rounded-md text-base h-10 bg-gray-100 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                maxlength="50" placeholder="Enter Machine Name" />
                        </div>
                        <div class="flex flex-wrap items-center gap-4 mt-4">
                            <span class="font-semibold text-gray-600">Status : </span>
                            <div class="w-5 h-5 rounded-full" :class="device.status ? 'bg-green-500' : 'bg-red-500'">
                            </div>
                            <span class="text-lg">
                                {{ device.status ? "Connected" : "Disconnected" }}
                            </span>
                            <div class="ml-auto space-x-1 mt-2 sm:mt-0">
                                <button
                                    class="bg-green-500 text-white py-2 px-6 rounded-lg hover:bg-green-600 transition duration-300 shadow-md"
                                    @click="editDevice" aria-label="Save Changes">
                                    Save
                                </button>
                                <button
                                    class="bg-red-500 text-white py-2 px-6 rounded-lg hover:bg-red-600 transition duration-300 shadow-md"
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
            class="w-full sm:w-4/5 my-2 mx-auto bg-gray-100 border-2 border-gray-200 rounded-lg text-base transition-all duration-300">
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
                    <div class="flex items-center space-x-2 ml-4">
                        <input type="checkbox" id="i1-status" :checked="alert_statuses[0] === '1'"
                            @change="alert_statuses[0] = alert_statuses[0] === '1' ? '0' : '1'"
                            class="h-6 w-6 rounded-full appearance-none cursor-pointer transition-colors duration-300  hover:scale-110"
                            :class="alert_statuses[0] === '1' ? 'bg-green-500 border-green-500' : 'bg-red-500 border-red-500'" />
                    </div>
                    <div class="flex items-center space-x-2">
                        <input type="checkbox" id="i2-status" :checked="alert_statuses[1] === '1'"
                            @change="alert_statuses[1] = alert_statuses[1] === '1' ? '0' : '1'"
                            class="h-6 w-6 rounded-full appearance-none cursor-pointer transition-colors duration-300 hover:scale-110"
                            :class="alert_statuses[1] === '1' ? 'bg-green-500 border-green-500' : 'bg-red-500 border-red-500'" />
                    </div>
                    <div class="flex items-center space-x-2 pl-1">
                        <input type="checkbox" id="i3-status" :checked="alert_statuses[2] === '1'"
                            @change="alert_statuses[2] = alert_statuses[2] === '1' ? '0' : '1'"
                            class="h-6 w-6 rounded-full appearance-none cursor-pointer transition-colors duration-300 hover:scale-110"
                            :class="alert_statuses[2] === '1' ? 'bg-green-500 border-green-500' : 'bg-red-500 border-red-500'" />
                    </div>
                    <div class="flex items-center space-x-2 pr-[0.4rem]">
                        <input type="checkbox" id="i4-status" :checked="alert_statuses[3] === '1'"
                            @change="alert_statuses[3] = alert_statuses[3] === '1' ? '0' : '1'"
                            class="h-6 w-6 rounded-full appearance-none cursor-pointer transition-colors duration-300 hover:scale-110"
                            :class="alert_statuses[3] === '1' ? 'bg-green-500 border-green-500' : 'bg-red-500 border-red-500'">
                    </div>
                </div>
                <input type="text"
                    class="w-full sm:w-1/4 p-1 pl-2 bg-white border-2 border-gray-300 rounded-lg mt-2 sm:mt-0"
                    v-model="alert_message" placeholder="Alert Message" />
                <button
                    class="text-blue-500 border px-2 py-1 rounded-lg border-blue-500 transition-all duration-300 hover:bg-blue-500 hover:text-white mt-2 sm:mt-0"
                    @click="addAlert">
                    Add Alert
                </button>
            </div>

            <!-- <div class="overflow-y-scroll sh-[15rem] mt-3">
                <div v-for="(alert, index) in alerts" :key="alert.AlertID"
                    :class="index % 2 === 0 ? 'bg-white' : 'bg-gray-50'"
                    class="flex flex-col py-2  border-gray-200">
                    <Alert :alert="alert" :editAlert="editAlertHandler" :removeAlert="removeAlert" />
                </div>
            </div> -->
            <div class="overflow-y-scroll h-[15rem] mt-3">
                <div v-for="(alert, index) in alerts" :key="alert.AlertID" class="flex flex-col">
                    <!-- <div class=""><hr class="py-2"></div> -->
                    <Alert class="border-gray-200 border-t-[2px] py-3" :alert="alert" :editAlert="editAlertHandler"
                        :removeAlert="removeAlert" @duplicate-alert="handleDuplicateAlert"
                        @alert-updated="handleAlertUpdated" />
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
input[type="checkbox"] {
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
    width: 1.5rem;
    height: 1.5rem;
    border: 2px solid red;
    border-radius: 9999px;
    background-color: transparent;
    cursor: pointer;
    position: relative;
}

input[type="checkbox"]:checked {
    border-color: #22C55E;
}

input[type="checkbox"]:checked::after {
    content: '';
    width: 0.8rem;
    height: 0.8rem;
    border: 2px solid #22C55E;
    background-color: #22C55E;

    input[type="checkbox"] {
        -webkit-appearance: none;
        -moz-appearance: none;
        appearance: none;
        width: 1.5rem;
        height: 1.5rem;
        border: 2px solid red;
        border-radius: 9999px;
        background-color: transparent;
        cursor: pointer;
        position: relative;
    }

    input[type="checkbox"]:checked {
        border-color: #22C55E;
    }

    input[type="checkbox"]:checked::after {
        content: '';
        width: 0.8rem;
        height: 0.8rem;
        border: 2px solid #22C55E;
        background-color: #22C55E;
        border-radius: 50%;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
    }

    border-radius: 50%;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
}

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
