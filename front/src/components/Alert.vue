<script setup>
import { ref, onMounted, watch } from "vue";

const props = defineProps({
    alert: {},
    editAlert: Function,
    removeAlert: Function,
});

const statuses = ref([]);

onMounted(() => {
    statuses.value = props.alert.AlertStatus.split("");
});

watch(
    () => props.alert,
    (newAlert) => {
        statuses.value = newAlert.AlertStatus.split("");
    }
);

const editAlert = async () => {
    const alertData = {
        alertStatus: statuses.value.join(""),
        alertMessage: props.alert.AlertMessage,
    };
    props.editAlert(props.alert.AlertID, alertData);
};
</script>

<template>
        <div class="flex justify-around items-center mb-2">
            <div class="flex justify-between w-1/2">
                <select
                    v-model="statuses[0]"
                    class="w-16 h-6 text-center rounded-lg"
                    :class="statuses[0] == 1 ? 'text-green-500' : 'text-red-500'"
                >
                    <option value="0" class="text-red-500">OFF</option>
                    <option value="1" class="text-green-500">ON</option>
                </select>
                <select
                    v-model="statuses[1]"
                    class="w-16 h-6 text-center rounded-lg"
                    :class="statuses[1] == 1 ? 'text-green-500' : 'text-red-500'"
                >
                    <option value="0" class="text-red-500">OFF</option>
                    <option value="1" class="text-green-500">ON</option>
                </select>
                <select
                    v-model="statuses[2]"
                    class="w-16 h-6 text-center rounded-lg"
                    :class="statuses[2] == 1 ? 'text-green-500' : 'text-red-500'"
                >
                    <option value="0" class="text-red-500">OFF</option>
                    <option value="1" class="text-green-500">ON</option>
                </select>
                <select
                    v-model="statuses[3]"
                    class="w-16 h-6 text-center rounded-lg"
                    :class="statuses[3] == 1 ? 'text-green-500' : 'text-red-500'"
                >
                    <option value="0" class="text-red-500">OFF</option>
                    <option value="1" class="text-green-500">ON</option>
                </select>
            </div>
            <input type="text" v-model="alert.AlertMessage" class="w-1/4 p-1 pl-2 bg-gray-200 rounded-lg" />

            <div class="text-lg w-16 flex justify-around">
                <button @click="editAlert()"><i class="bi bi-pencil-square"></i></button>
                <button @click="props.removeAlert(alert.AlertID)"><i class="bi bi-trash"></i></button>
            </div>
        </div>
</template>
