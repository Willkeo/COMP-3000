import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("api", {
    navigate: (page: string) => ipcRenderer.send("navigate", page),
    registerUser: (user: any) => ipcRenderer.invoke("register-user", user),
    loginUser: (username: string, password: string) =>
        ipcRenderer.invoke("login-user", { username, password }),
});

contextBridge.exposeInMainWorld("electronAPI", {
    hideWindow: () => ipcRenderer.send("hide-window")
});

contextBridge.exposeInMainWorld("popupAPI", {
    showPopup: (data: any) => ipcRenderer.send("show-popup", data)
});

contextBridge.exposeInMainWorld("appTrackerAPI", {
    start: () => ipcRenderer.invoke("start-app-tracker"),
    stop: () => ipcRenderer.invoke("stop-app-tracker"),
    onFocusUpdate: (callback: (data: any) => void) =>
        ipcRenderer.on("app-focus-update", (_event, data) => callback(data)),
    onReset: (callback: () => void) =>
        ipcRenderer.on("app-time-reset", () => callback()),
});

export { };

declare global {
    interface Window {
        electronAPI: {
            hideWindow: () => void;
        };
    }
}

declare global {
    interface Window {
        popupAPI: {
            showPopup(data: { timeText: string; message: string }): void;
        };
    }
}

declare global {
    interface Window {
        appTrackerAPI: {
            start: () => void;
            stop: () => void;
            onFocusUpdate: (callback: (data: any) => void) => void;
            onReset: (callback: () => void) => void;
        };
    }
}
