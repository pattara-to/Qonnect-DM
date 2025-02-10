import { defineStore } from "pinia";
import axios from "axios";

const BASE_URL = "http://127.0.0.1:8081";

export const useDeviceStore = defineStore("device", {
    state: () => ({
        device_list: [],
        alert_list: [],
        selected_device: {},
    }),
    actions: {
        async register(userData) {
            try {
                const response = await axios.post(`${BASE_URL}/register`, userData);
            } catch (error) {
                console.log("error", error);
            }
        },
        async login(userData) {
            try {
                const response = await axios.post(`${BASE_URL}/login`, userData);
                localStorage.setItem("token", response.data.token);
                return response.data;
            } catch (error) {
                console.log("error", error);
            }
        },
        async user() {
            try {
                const authToken = localStorage.getItem("token");
                const response = await axios.get(`${BASE_URL}/user`, {
                    headers: {
                        authorization: `Bearer ${authToken}`,
                    },
                });
                return response.data;
            } catch (error) {
                console.log("error", error);
                if (error.response.status == 401) {
                    window.location.replace("http://localhost:5173/login");
                }
            }
        },
        async editUser(userData, imageFile) {
            const formData = new FormData();
            formData.append("image", imageFile);
            formData.append("data", JSON.stringify(userData));
            try {
                const authToken = localStorage.getItem("token");
                const response = await axios.post(`${BASE_URL}/edit-user`, formData, {
                    headers: {
                        authorization: `Bearer ${authToken}`,
                    },
                });
            } catch (error) {
                console.log("Error in editUser:", error);
                if (error.response && error.response.status === 401) {
                    window.location.replace("http://localhost:5173/login");
                }
            }
        },
        async editLineToken(lineToken) {
            try {
                const authToken = localStorage.getItem("token");
                const response = await axios.post(`${BASE_URL}/edit-linetoken`, lineToken, {
                    headers: {
                        authorization: `Bearer ${authToken}`,
                    },
                });
            } catch (error) {
                console.log("Error in editLineToken:", error);
                if (error.response && error.response.status === 401) {
                    window.location.replace("http://localhost:5173/login");
                }
            }
        },
        async resetPassword(pass) {
            try {
                const authToken = localStorage.getItem("token");
                const response = await axios.post(
                    `${BASE_URL}/reset-password`,
                    { pass },
                    {
                        headers: {
                            authorization: `Bearer ${authToken}`,
                        },
                    }
                );
            } catch (error) {
                console.log("Error in editLineToken:", error);
                if (error.response && error.response.status === 401) {
                    window.location.replace("http://localhost:5173/login");
                }
            }
        },
        async loadDevices() {
            try {
                const authToken = localStorage.getItem("token");
                const response = await axios.get(`${BASE_URL}/devices`, {
                    headers: {
                        authorization: `Bearer ${authToken}`,
                    },
                });
                this.device_list = response.data;
            } catch (error) {
                console.log("error", error);
                if (error.response.status == 401) {
                    window.location.replace("http://localhost:5173/login");
                }
            }
        },
        async loadDevice(deviceID) {
            try {
                const authToken = localStorage.getItem("token");
                const response = await axios.get(`${BASE_URL}/device/${deviceID}`, {
                    headers: {
                        authorization: `Bearer ${authToken}`,
                    },
                });
                return response.data;
            } catch (error) {
                console.log("error", error);
                if (error.response.status == 401) {
                    window.location.replace("http://localhost:5173/login");
                }
            }
        },
        async loadAlerts(deviceID) {
            try {
                const response = await axios.get(`${BASE_URL}/alerts/${deviceID}`);
                this.alert_list = response.data;
            } catch (error) {
                console.log("error", error);
            }
        },
        async addDevice(deviceData) {
            const authToken = localStorage.getItem("token");
            const formData = new FormData();
            formData.append("image", deviceData.image);
            formData.append("data", JSON.stringify(deviceData));

            try {
                const response = await axios.post(`${BASE_URL}/devices`, formData, {
                    headers: {
                        authorization: `Bearer ${authToken}`,
                        "Content-Type": "multipart/form-data",
                    },
                });
                return response.data;
            } catch (error) {
                return response.data;
            }
        },
        async addAlert(alertData) {
            const authToken = localStorage.getItem("token");
            try {
                const response = await axios.post(`${BASE_URL}/alerts`, alertData, {
                    headers: {
                        authorization: `Bearer ${authToken}`,
                    },
                });
                console.log("Add Alert Success");
                return response.data;
            } catch (error) {
                console.log(response.data);
                return response.data;
            }
        },
        async editDevice(deviceID, deviceData, imageFile) {
            const formData = new FormData();
            formData.append("image", imageFile);
            formData.append("data", JSON.stringify(deviceData));
            try {
                const response = await axios.post(`${BASE_URL}/edit-device/${deviceID}`, formData);
                return response.data;
            } catch (error) {
                console.log("error", error);
                return response.data;
            }
        },
        async editAlert(alertID, alertData) {
            try {
                const response = await axios.post(`${BASE_URL}/edit-alert/${alertID}`, alertData);
                console.log("Edit Alert Success");
                return response.data;
            } catch (error) {
                console.log("error", error);
                return response.data;
            }
        },
        async removeDevice(deviceID) {
            try {
                const response = await axios.post(`${BASE_URL}/remove-device/${deviceID}`);
                console.log("Remove Device Success");
            } catch (error) {
                console.log("error", error);
            }
        },
        async removeAlert(alertID) {
            try {
                const response = await axios.post(`${BASE_URL}/remove-alert/${alertID}`);
                console.log("Remove Alert Success");
            } catch (error) {
                console.log("error", error);
            }
        },
    },
});
