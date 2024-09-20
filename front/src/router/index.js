import { createRouter, createWebHistory } from "vue-router";
import DevicesView from "../views/DevicesView.vue";
import ProfileView from "../views/ProfileView.vue";
import LoginView from "@/views/LoginView.vue";
import RegisterView from "@/views/RegisterView.vue";
import EditView from "@/views/EditView.vue";

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: "/devices",
            alias: ["/"],
            name: "devices-view",
            component: DevicesView,
        },
        {
            path: "/profile",
            name: "profile-view",
            component: ProfileView,
        },
        {
            path: "/login",
            name: "login-view",
            component: LoginView,
        },
        {
            path: "/register",
            name: "register-view",
            component: RegisterView,
        },
        {
            path: "/edit/:id",
            name: "edit-view",
            component: EditView,
        },
    ],
});

export default router;
