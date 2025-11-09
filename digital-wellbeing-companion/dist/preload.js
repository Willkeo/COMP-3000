"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
electron_1.contextBridge.exposeInMainWorld("api", {
    navigate: (page) => electron_1.ipcRenderer.send("navigate", page),
    registerUser: (user) => electron_1.ipcRenderer.invoke("register-user", user),
    loginUser: (username, password) => electron_1.ipcRenderer.invoke("login-user", { username, password }),
});
window.addEventListener("focus", () => {
    document.body.classList.remove("no-focus");
});
window.addEventListener("blur", () => {
    document.body.classList.add("no-focus");
});
//# sourceMappingURL=preload.js.map