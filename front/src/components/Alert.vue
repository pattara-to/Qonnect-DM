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
                    class="h-6 w-6 rounded-full appearance-none cursor-pointer border-gray-400 border-[3px]"
                    :class="statuses[0] === '1' ? 'bg-green-500 border-green-500' : 'bg-red-500 border-red-500'" />
            </div>
            <div class="flex items-center space-x-2">
                <input type="checkbox" id="status-1" :checked="statuses[1] === '1'"
                    @change="statuses[1] = statuses[1] === '1' ? '0' : '1'"
                    class="h-6 w-6 rounded-full appearance-none cursor-pointer"
                    :class="statuses[1] === '1' ? 'bg-green-500 border-green-500' : 'bg-red-500 border-red-500'" />
            </div>
            <div class="flex items-center space-x-2">
                <input type="checkbox" id="status-2" :checked="statuses[2] === '1'"
                    @change="statuses[2] = statuses[2] === '1' ? '0' : '1'"
                    class="h-6 w-6 rounded-full appearance-none cursor-pointer"
                    :class="statuses[2] === '1' ? 'bg-green-500 border-green-500' : 'bg-red-500 border-red-500'" />
            </div>
            <div class="flex items-center space-x-2">
                <input type="checkbox" id="status-3" :checked="statuses[3] === '1'"
                    @change="statuses[3] = statuses[3] === '1' ? '0' : '1'"
                    class="h-6 w-6 rounded-full appearance-none cursor-pointer"
                    :class="statuses[3] === '1' ? 'bg-green-500 border-green-500' : 'bg-red-500 border-red-500'" />
            </div>
        </div>
        <input type="text" v-model="props.alert.AlertMessage"
            class="w-full sm:w-1/4 p-1 pl-2 bg-white border-2 border-gray-300 rounded-lg mt-2 sm:mt-0" placeholder="Alert Message"
            aria-label="Alert Message" />
        <div class="text-lg w-16 flex justify-around">
            <button @click="editAlert"><img src="../assets/SaveIcon.svg" class="w-5 hover:scale-105"></button>
            <button @click="props.removeAlert(props.alert.AlertID)"><img src="../assets/DeleteIcon.svg"
                    class="w-5 hover:scale-105"></button>
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
    border-radius: 50%;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
}
</style>