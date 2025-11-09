import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("api", {
    navigate: (page: string) => ipcRenderer.send("navigate", page),
    registerUser: (user: any) => ipcRenderer.invoke("register-user", user),
    loginUser: (username: string, password: string) =>
        ipcRenderer.invoke("login-user", { username, password }),
});

window.addEventListener("focus", () => {
    document.body.classList.remove("no-focus");
});

window.addEventListener("blur", () => {
    document.body.classList.add("no-focus");
});