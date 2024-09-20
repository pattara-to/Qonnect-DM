import { defineStore } from "pinia";
import axios from "axios";

const BASE_URL = "http://127.0.0.1:8000";

export const useDeviceStore = defineStore("device", {
    state: () => ({
        list: [],
        alertList: [],
        selectedDevice: {},
    }),
    actions: {
        async loadDevices() {
            try {
                const authToken = localStorage.getItem("token");
                const response = await axios.get(`${BASE_URL}/devices`, {
                    headers: {
                        authorization: `Bearer ${authToken}`,
                    },
                });
                this.list = response.data;
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
                this.selectedDevice = response.data;
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
                this.alertList = response.data;
            } catch (error) {
                console.log("error", error);
            }
        },
        async addDevice(deviceData) {
            const authToken = localStorage.getItem("token");
            try {
                const response = await axios.post(`${BASE_URL}/devices`, deviceData, {
                    headers: {
                        authorization: `Bearer ${authToken}`,
                    },
                });
                console.log("Add Device Success");
            } catch (error) {
                console.log("error", error);
            }
        },
        async addAlert(alertData) {
            // check Auth
            const authToken = localStorage.getItem("token");
            try {
                const response = await axios.post(`${BASE_URL}/alerts`, alertData, {
                    headers: {
                        authorization: `Bearer ${authToken}`,
                    },
                });
                console.log("Add Alert Success");
            } catch (error) {
                console.log("error", error);
            }
        },
        async editDevice(deviceID, deviceData) {
            try {
                const response = await axios.post(`${BASE_URL}/edit-device/${deviceID}`, deviceData);
                console.log("Edit Device Success");
            } catch (error) {
                console.log("error", error);
            }
        },
        async editAlert(alertID, alertData) {
            try {
                const response = await axios.post(`${BASE_URL}/edit-alert/${alertID}`, alertData);
                console.log("Edit Alert Success");
            } catch (error) {
                console.log("error", error);
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
        async editUser(userData) {
            try {
                const authToken = localStorage.getItem("token");
                const response = await axios.post(`${BASE_URL}/edit-user`, userData, {
                    headers: {
                        authorization: `Bearer ${authToken}`,
                        'Content-Type': 'application/json',
                    },
                });
            } catch (error) {
                console.log("Error in editUser:", error);
                if (error.response && error.response.status === 401) {
                    window.location.replace("http://localhost:5173/login");
                }
            }
        }
        ,
        async editLineToken(lineToken) {
            try {
                const authToken = localStorage.getItem("token");
                const response = await axios.post(`${BASE_URL}/edit-linetoken`,lineToken, {
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
    },
});
