"use strict";
//References to API documentation i used in this development file:
//Electron contextBridge / ipcRenderer: https://www.electronjs.org/docs/latest/api/context-bridge
//Secure IPC & contextIsolation guidance: https://www.electronjs.org/docs/latest/tutorial/security
//TypeScript declaration merging (global/window): https://www.typescriptlang.org/docs/handbook/declaration-merging.html
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
electron_1.contextBridge.exposeInMainWorld("api", {
    navigate: (page) => electron_1.ipcRenderer.send("navigate", page),
    registerUser: (user) => electron_1.ipcRenderer.invoke("register-user", user),
    loginUser: (username, password) => electron_1.ipcRenderer.invoke("login-user", { username, password }),
    updateUserProfile: (oldUsername, newUsername, newEmail) => electron_1.ipcRenderer.invoke("update-user-profile", { oldUsername, newUsername, newEmail }),
    logout: () => electron_1.ipcRenderer.send("logout"),
    awardPoints: (userId, delta, game) => electron_1.ipcRenderer.invoke("award-points", { userId, delta, game })
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
// Prevent global listeners from interfering with typing.
// When an editable element has focus we stop propagation of keydown events
// (capture-phase) so window/document/game-level handlers don't steal keys.
window.addEventListener("DOMContentLoaded", () => {
    document.addEventListener("keydown", (e) => {
        const target = e.target;
        if (!target)
            return;
        const tag = target.tagName;
        const isEditable = tag === "INPUT" ||
            tag === "TEXTAREA" ||
            target.isContentEditable === true;
        if (isEditable) {
            // Prevent other listeners from intercepting typing while user edits.
            e.stopPropagation();
        }
    }, true); // capture phase
});
//# sourceMappingURL=preload.js.map