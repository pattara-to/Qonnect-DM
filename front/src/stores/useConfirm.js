import { ref } from "vue";

export function useConfirm() {
    const isModalVisible = ref(false);
    const isPasswordVisible = ref(false);
    const confirmMessage = ref("");
    let resolveConfirm;

    const showConfirm = (message) => {
        confirmMessage.value = message;
        isModalVisible.value = true;
        return new Promise((resolve) => {
            resolveConfirm = resolve;
        });
    };

    const showPassword = (message) => {
        confirmMessage.value = message;
        isPasswordVisible.value = true;
        return new Promise((resolve) => {
            resolveConfirm = resolve;
        });
    };

    const confirm = () => {
        resolveConfirm(true);
        closeConfirm();
    };

    const cancel = () => {
        resolveConfirm(false);
        closeConfirm();
    };

    const closeConfirm = () => {
        isModalVisible.value = false;
        isPasswordVisible.value = false;
        confirmMessage.value = "";
    };

    return {
        isModalVisible,
        isPasswordVisible,
        confirmMessage,
        showConfirm,
        showPassword,
        confirm,
        cancel,
    };
}
