//References to API documentation i used in this development file:
//Electron contextBridge / ipcRenderer: https://www.electronjs.org/docs/latest/api/context-bridge
//Secure IPC & contextIsolation guidance: https://www.electronjs.org/docs/latest/tutorial/security
//TypeScript declaration merging (global/window): https://www.typescriptlang.org/docs/handbook/declaration-merging.html

import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("api", {  //exposes the functions to the renderer process
    navigate: (page: string) => ipcRenderer.send("navigate", page),
    registerUser: (user: any) => ipcRenderer.invoke("register-user", user),
    loginUser: (username: string, password: string) =>
        ipcRenderer.invoke("login-user", { username, password }),
    updateUserProfile: (oldUsername: string, newUsername: string, newEmail: string) =>
        ipcRenderer.invoke("update-user-profile", { oldUsername, newUsername, newEmail }),
    logout: () => ipcRenderer.send("logout"),

    awardPoints: (userId: number, delta: number, game?: string) =>
        ipcRenderer.invoke("award-points", { userId, delta, game })
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

declare global {  //declares the functions to be used in the renderer process
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

declare global {
    interface AwardPointsResult {
        success: boolean;
        points?: number;
        error?: string;
    }

    interface Window {
        api: {
            navigate: (page: string) => void;
            registerUser: (user: any) => Promise<any>;
            loginUser: (username: string, password: string) => Promise<any>;
            updateUserProfile: (oldUsername: string, newUsername: string, newEmail: string) => Promise<any>;
            logout: () => void;
            awardPoints: (userId: number, delta: number, game?: string) => Promise<AwardPointsResult>;
        };
    }
}



