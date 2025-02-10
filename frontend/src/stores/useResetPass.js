import { ref } from "vue";

export function useResetPass() {
    const isResetPassVisible = ref(false);
    const resetPassMessage = ref("");
    let resolveResetPass;

    const showResetPass = (message) => {
        resetPassMessage.value = message;
        isResetPassVisible.value = true;
        return new Promise((resolve) => {
            resolveResetPass = resolve;
        });
    };

    const resetPass = (password) => {
        resolveResetPass([true, password]);
        closeResetPass();
    };

    const cancelResetPass = () => {
        resolveResetPass([false, ""]);
        closeResetPass();
    };

    const closeResetPass = () => {
        isResetPassVisible.value = false;
        resetPassMessage.value = "";
    };

    return {
        isResetPassVisible,
        resetPassMessage,
        showResetPass,
        resetPass,
        cancelResetPass,
    };
}
