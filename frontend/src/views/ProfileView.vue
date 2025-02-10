<script setup>
import Loading from "@/components/Loading.vue";
import { onMounted, reactive, ref } from "vue";
import { useDeviceStore } from "@/stores/device";
import ConfirmModal from "@/components/ConfirmModal.vue";
import { useConfirm } from "@/stores/useConfirm.js";
import defaultProfilePic from "@/assets/user.jpg";
import { useRoute, useRouter, RouterLink } from "vue-router";
import ResetPassModal from "@/components/ResetPassModal.vue";
import { useResetPass } from "@/stores/useResetPass";

const { isModalVisible, confirmMessage, showConfirm, confirm, cancel } = useConfirm();
const { isResetPassVisible, resetPassMessage, showResetPass, resetPass, cancelResetPass } = useResetPass();

const deviceStore = useDeviceStore();

const isLoading = ref(true);
const user = ref({});

const imageFile = ref(null);

const loadUser = async () => {
    user.value = await deviceStore.user();
    if (user.value.image == null) {
        user.value.image = defaultProfilePic;
    }
};

onMounted(async () => {
    try {
        await loadUser();
    } catch (error) {
        console.error("Error loading user", error);
    } finally {
        setTimeout(() => {
            isLoading.value = false;
        }, 200);
    }
});

const imageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
        imageFile.value = file;
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            // const img = new Image();
            // img.src = reader.result;

            // img.onload = () => {
            // const canvas = document.createElement("canvas");
            // const maxWidth = 500;
            // const maxHeight = 500;
            // let width = img.width;
            // let height = img.height;
            // if (width > height) {
            //     if (width > maxWidth) {
            //         height = Math.round((height *= maxWidth / width));
            //         width = maxWidth;
            //     }
            // } else {
            //     if (height > maxHeight) {
            //         width = Math.round((width *= maxHeight / height));
            //         height = maxHeight;
            //     }
            // }
            // canvas.width = width;
            // canvas.height = height;
            // const ctx = canvas.getContext("2d");
            // ctx.drawImage(img, 0, 0, width, height);
            // const resizedBase64 = canvas.toDataURL("image/jpeg", 0.8);
            // user.ProfilePic = resizedBase64.split(",")[1];
            // profilePic.value = resizedBase64;
            // };
            user.value.image = reader.result;
        };
        reader.onerror = (error) => {
            console.error("Error reading file:", error);
        };
    }
};

const fileInput = ref(null);

const triggerFileInput = () => {
    fileInput.value.click();
};

const editSetting = async () => {
    try {
        const confirmed = await showConfirm("Edit Setting");
        if (confirmed) {
            // await deviceStore.editLineToken(user);
            await deviceStore.editUser(user.value, imageFile.value);
            await loadUser();
        }
    } catch (error) {
        alert("Failed to update user information.");
    }
};

const resetPassword = async () => {
    try {
        const [confirmed, pass] = await showResetPass("Reset Password");
        if (confirmed) {
            await deviceStore.resetPassword(pass);
            console.log("Password reset successfully");
            alert("Reset password successfully");
        }
    } catch (error) {
        alert("Failed to reset password");
    }
};
</script>

<template>
    <ResetPassModal
        :resetPassMessage="resetPassMessage"
        :isResetPassVisible="isResetPassVisible"
        v-show="isResetPassVisible"
        @resetPass="resetPass"
        @cancel="cancelResetPass"
    />
    <ConfirmModal :confirmMessage="confirmMessage" :isModalVisible="isModalVisible" v-show="isModalVisible" @confirm="confirm" @cancel="cancel" />

    <div v-if="isLoading">
        <Loading />
    </div>

    <div v-else class="flex flex-col w-full">
        <div class="flex flex-wrap justify-between mt-4">
            <span class="self-center text-base sm:text-lg ml-10 py-1">
                <RouterLink class="hover:text-gray-500" :to="{ name: 'devices-view' }"> Home </RouterLink>
                >
                <span class="bg-gray-200 text-violet-700 font-semibold rounded-lg m-1 px-2"> Setting </span>
            </span>
        </div>
        <div class="flex flex-col sm:mx-auto h-auto mt-2 justify-center sm:w-3/4 md:w-4/5 p-4 sm:p-6">
            <div>
                <h2 class="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6 text-gray-700">My Account</h2>
                <hr class="mb-4 sm:mb-6" />
                <div class="flex flex-col sm:flex-row items-center mb-4 sm:mb-6 space-y-4 sm:space-y-0 sm:space-x-8">
                    <div class="relative cursor-pointer" @click="triggerFileInput">
                        <div class="w-[10rem] h-[10rem] rounded-full overflow-hidden flex items-center justify-center">
                            <img :src="user.image" alt="Profile Picture" class="object-cover w-full h-full" />
                        </div>
                        <div
                            class="absolute inset-0 flex items-center justify-center text-white text-xl bg-black bg-opacity-50 opacity-0 hover:opacity-100 transition-opacity rounded-full"
                        >
                            <i class="bi bi-camera"></i>
                        </div>
                        <input ref="fileInput" type="file" accept="image/*" @change="imageChange" class="hidden" />
                    </div>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                        <div>
                            <label class="block font-semibold mb-1 text-gray-600">Username</label>
                            <input
                                type="text"
                                class="w-full rounded-md h-10 bg-gray-100 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                v-model="user.username"
                                placeholder="Enter your username"
                                maxlength="30"
                            />
                        </div>
                        <div>
                            <label class="block font-semibold mb-1 text-gray-600">Company</label>
                            <input
                                type="text"
                                class="w-full rounded-md h-10 bg-gray-100 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                v-model="user.company"
                                placeholder="Enter your company"
                                maxlength="30"
                            />
                        </div>
                        <div>
                            <label class="block font-semibold mb-1 text-gray-600">Email</label>
                            <input
                                type="email"
                                class="w-full rounded-md h-10 bg-gray-100 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                v-model="user.email"
                                placeholder="Enter your email"
                                maxlength="30"
                            />
                        </div>
                        <div>
                            <label class="block font-semibold mb-1 text-gray-600">Phone</label>
                            <input
                                type="tel"
                                class="w-full rounded-md h-10 bg-gray-100 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                v-model="user.phone"
                                placeholder="Enter your phone number"
                                maxlength="15"
                            />
                        </div>
                        <div>
                            <label class="block font-semibold mb-1 text-gray-600">Password</label>
                            <button
                                class="bg-red-500 w-full text-white py-2 px-6 rounded-lg hover:bg-red-600 transition duration-300 shadow-md"
                                @click="resetPassword"
                            >
                                Reset Password
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <div class="mt-8">
                <h2 class="text-xl sm:text-2xl font-semibold mb-4 text-gray-700">Notification</h2>
                <hr class="mb-4" />
                <div class="flex flex-col sm:flex-row items-center gap-4 mb-4 w-full">
                    <div class="flex-shrink-0">
                        <img src="../assets/LINE_logo.png" alt="Line" class="w-12 h-12 object-contain" />
                    </div>
                    <div class="flex-grow w-full">
                        <label class="block font-semibold mb-1 text-gray-600">Line Token</label>
                        <input
                            type="text"
                            class="w-full rounded-md h-10 bg-gray-100 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            v-model="user.lineToken"
                            placeholder="Enter your Line token"
                        />
                    </div>
                </div>

                <div class="flex justify-end">
                    <button
                        class="bg-green-500 text-white py-2 px-6 rounded-lg hover:bg-green-600 transition duration-300 shadow-md"
                        @click="editSetting"
                        aria-label="Save Line Token"
                    >
                        Save
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>
