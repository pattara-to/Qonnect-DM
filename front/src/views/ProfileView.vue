<script setup>
import Navbar from "@/components/Navbar.vue";
import { onMounted, reactive, ref } from "vue";
import { useDeviceStore } from "@/stores/device";
import ConfirmModal from "@/components/ConfirmModal.vue";
import { useConfirm } from "@/stores/useConfirm.js";

const { isModalVisible, confirmMessage, showConfirm, confirm, cancel } = useConfirm();

const deviceStore = useDeviceStore();

const user = reactive({
    username: "",
    company: "",
    email: "",
    phone: "",
    address: "",
    lineToken: "",
    ProfilePic: "",
});

const profilePic = ref("");

import defaultProfilePic from '@/assets/Ptony2.jpg';

onMounted(async () => {
    try {
        const result = await deviceStore.user();
        user.username = result.Username;
        user.company = result.Company;
        user.email = result.Email;
        user.phone = result.Phone;
        user.address = result.Address;
        user.lineToken = result.LineToken;
        user.ProfilePic = result.ProfilePic;

        if (user.ProfilePic) {
            profilePic.value = `data:image/jpeg;base64,${user.ProfilePic}`;
        } else {
            profilePic.value = defaultProfilePic; // Use the imported default image
        }
    } catch (error) {
        alert("Failed to load user information.");
    }
});



const ProfilePicChange = (event) => {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.readAsDataURL(file);
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
                user.ProfilePic = resizedBase64.split(",")[1];
                profilePic.value = resizedBase64;
            };
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


const editUser = async () => {
    try {
        const confirmed = await showConfirm("Edit User information?");
        if (confirmed) {
            console.log("Sending user data:", user);
            await deviceStore.editUser(user);
        }
    } catch (error) {
        alert("Failed to update user information.");
    }
};


const editLineToken = async () => {
    try {
        const confirmed = await showConfirm("Edit Line Token?");
        if (confirmed) {
            await deviceStore.editLineToken(user);
            alert("Line Token updated successfully.");
        }
    } catch (error) {
        alert("Failed to update Line Token");
    }
};
</script>

<template>
    <Navbar />
    <transition name="fade" mode="out-in">
        <ConfirmModal :toggleAlert="toggleAlert" :confirmMessage="confirmMessage" v-show="isModalVisible"
            @confirm="confirm" @cancel="cancel" />
    </transition>
    <div class="flex flex-col w-full h-[90%]">
        <div class="flex flex-col mx-auto w-[50%] my-auto p-6 bg-white rounded-lg shadow-lg">
            <div>
                <h2 class="text-2xl font-semibold mb-6 text-gray-700">My Account</h2>
                <hr class="mb-6" />
                <div class="flex items-center mb-6 space-x-8">
                    <div class="relative cursor-pointer" @click="triggerFileInput">
                        <div class="w-28 h-28 rounded-full bg-gray-300 overflow-hidden flex items-center justify-center shadow-md">
                            <img :src="profilePic" alt="Profile Picture" class="object-cover w-full h-full" />
                        </div>
                        <div class="absolute inset-0 flex items-center justify-center text-white text-xl bg-black bg-opacity-50 opacity-0 hover:opacity-100 transition-opacity rounded-full">
                            <i class="bi bi-camera"></i>
                        </div>
                        <input ref="fileInput" type="file" accept="image/*" @change="ProfilePicChange" class="hidden" />
                    </div>
                    <div class="grid grid-cols-2 gap-4 w-full">
                        <div>
                            <label class="block text-sm font-medium mb-1 text-gray-600">Username</label>
                            <input type="text"
                                class="w-full rounded-md text-sm h-10 bg-gray-100 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                v-model="user.username" placeholder="Enter your username" aria-label="Username" />
                        </div>
                        <div>
                            <label class="block text-sm font-medium mb-1 text-gray-600">Company</label>
                            <input type="text"
                                class="w-full rounded-md text-sm h-10 bg-gray-100 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                v-model="user.company" placeholder="Enter your company" aria-label="Company" />
                        </div>
                        <div>
                            <label class="block text-sm font-medium mb-1 text-gray-600">Email</label>
                            <input type="email"
                                class="w-full rounded-md text-sm h-10 bg-gray-100 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                v-model="user.email" placeholder="Enter your email" aria-label="Email" />
                        </div>
                        <div>
                            <label class="block text-sm font-medium mb-1 text-gray-600">Phone</label>
                            <input type="tel"
                                class="w-full rounded-md text-sm h-10 bg-gray-100 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                v-model="user.phone" placeholder="Enter your phone number" aria-label="Phone" />
                        </div>
                        <div class="col-span-2">
                            <label class="block text-sm font-medium mb-1 text-gray-600">Address</label>
                            <input type="text"
                                class="w-full rounded-md text-sm h-10 bg-gray-100 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                v-model="user.address" placeholder="Enter your address" aria-label="Address" />
                        </div>
                    </div>
                </div>
                <div class="flex justify-end">
                    <button
                        class="bg-blue-500 text-white py-2 px-6 rounded-lg hover:bg-blue-600 transition shadow-md text-sm"
                        @click="editUser" aria-label="Edit User Information">
                        Edit
                    </button>
                </div>
            </div>
            <div class="mt-8">
                <h2 class="text-2xl font-semibold mb-4 text-gray-700">Notification</h2>
                <hr class="mb-4" />
                <div class="flex items-center gap-4 mb-4">
                    <img src="../assets/LINE_logo.png" alt="Line" class="w-12 h-12 object-contain" />
                    <div class="flex-grow">
                        <label class="block text-sm font-medium mb-1 text-gray-600">Line Token</label>
                        <input type="text"
                            class="w-full rounded-md text-sm h-10 bg-gray-100 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            v-model="user.lineToken" placeholder="Enter your Line token" aria-label="Line Token" />
                    </div>
                </div>
                <div class="flex justify-end">
                    <button
                        class="bg-blue-500 text-white py-2 px-6 rounded-lg hover:bg-blue-600 transition shadow-md text-sm"
                        @click="editLineToken" aria-label="Save Line Token">
                        Save
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>



