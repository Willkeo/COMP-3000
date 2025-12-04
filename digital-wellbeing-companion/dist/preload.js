"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
electron_1.contextBridge.exposeInMainWorld("api", {
    navigate: (page) => electron_1.ipcRenderer.send("navigate", page),
    registerUser: (user) => electron_1.ipcRenderer.invoke("register-user", user),
    loginUser: (username, password) => electron_1.ipcRenderer.invoke("login-user", { username, password }),
});
electron_1.contextBridge.exposeInMainWorld("electronAPI", {
    hideWindow: () => electron_1.ipcRenderer.send("hide-window")
});
electron_1.contextBridge.exposeInMainWorld("popupAPI", {
    showPopup: (data) => electron_1.ipcRenderer.send("show-popup", data)
});
electron_1.contextBridge.exposeInMainWorld("appTrackerAPI", {
    start: () => electron_1.ipcRenderer.invoke("start-app-tracker"),
    stop: () => electron_1.ipcRenderer.invoke("stop-app-tracker"),
    onFocusUpdate: (callback) => electron_1.ipcRenderer.on("app-focus-update", (_event, data) => callback(data)),
    onReset: (callback) => electron_1.ipcRenderer.on("app-time-reset", () => callback()),
});
//# sourceMappingURL=preload.js.map