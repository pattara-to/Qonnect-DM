import { ref } from "vue";

export function useConfirm() {
    const isModalVisible = ref(false);
    const confirmMessage = ref("");
    let resolveConfirm;

    const showConfirm = (message) => {
        confirmMessage.value = message;
        isModalVisible.value = true;
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
        confirmMessage.value = "";
    };

    return {
        isModalVisible,
        confirmMessage,
        showConfirm,
        confirm,
        cancel,
    };
}
