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
    <div class="flex flex-wrap w-full h-full justify-around items-center space-y-2 sm:space-y-0">
        <div class="flex justify-between w-full sm:w-1/2 mb-2 sm:mb-0 px-3">
            <div class="flex items-center space-x-2 ml-3">
                <input type="checkbox" id="status-0" :checked="statuses[0] === '1'"
                    @change="statuses[0] = statuses[0] === '1' ? '0' : '1'"
                    class="h-6 w-6  appearance-none cursor-pointer border-gray-400 border-[3px]"
                    :class="statuses[0] === '1' ? 'bg-green-500 border-green-500' : 'bg-red-500 border-red-500'" />
            </div>
            <div class="flex items-center space-x-2">
                <input type="checkbox" id="status-1" :checked="statuses[1] === '1'"
                    @change="statuses[1] = statuses[1] === '1' ? '0' : '1'"
                    class="h-6 w-6  appearance-none cursor-pointer"
                    :class="statuses[1] === '1' ? 'bg-green-500 border-green-500' : 'bg-red-500 border-red-500'" />
            </div>
            <div class="flex items-center space-x-2">
                <input type="checkbox" id="status-2" :checked="statuses[2] === '1'"
                    @change="statuses[2] = statuses[2] === '1' ? '0' : '1'"
                    class="h-6 w-6  appearance-none cursor-pointer"
                    :class="statuses[2] === '1' ? 'bg-green-500 border-green-500' : 'bg-red-500 border-red-500'" />
            </div>
            <div class="flex items-center space-x-2">
                <input type="checkbox" id="status-3" :checked="statuses[3] === '1'"
                    @change="statuses[3] = statuses[3] === '1' ? '0' : '1'"
                    class="h-6 w-6 rounded-sm appearance-none cursor-pointer"
                    :class="statuses[3] === '1' ? 'bg-green-500 border-green-500' : 'bg-red-500 border-red-500'" />
            </div>
        </div>
        <input type="text" v-model="props.alert.AlertMessage" class="w-full sm:w-1/4 p-1 pl-2 bg-gray-200 rounded-lg mt-2 sm:mt-0"
            placeholder="Alert Message" aria-label="Alert Message" />
        <div class="text-lg w-16 flex justify-around">
            <button @click="editAlert"><i class="bi bi-pencil-square text-blue-500 hover:text-blue-400"></i></button>
            <button @click="props.removeAlert(props.alert.AlertID)"><i class="bi bi-trash-fill text-red-500 hover:text-red-400"></i></button>
        </div>
    </div>
</template>
