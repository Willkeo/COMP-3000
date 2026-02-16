"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const path = __importStar(require("path"));
const userService_1 = require("./userService");
const userService_2 = require("./userService");
const userService_3 = require("./userService");
electron_1.ipcMain.on("navigate", (event, page) => {
    const win = electron_1.BrowserWindow.fromWebContents(event.sender);
    if (!win)
        return;
    if (page === "main.html") {
        win.setResizable(true); //enable resizing for main window to fix bug after saving logon settings
        win.maximize(); //maximize to fullscreen
        win.setMinimumSize(800, 600); //set minimum size
    }
    win.loadFile(path.join(__dirname, `../public/${page}`));
});
electron_1.ipcMain.on("logout", (event) => {
    const win = electron_1.BrowserWindow.fromWebContents(event.sender);
    if (win) {
        win.unmaximize(); //unmaximize the window first
        win.setResizable(false); //disable resizing
        setTimeout(() => {
            win.setSize(400, 600); //resizes window back to login size (width: 400, height: 600)
            win.center(); //center the window on screen
        }, 100);
        win.loadFile(path.join(__dirname, "../public/login.html"));
    }
});
electron_1.ipcMain.handle("check-remember-login", (event) => {
    return false; //default to showing login page
});
let mainWindow = null;
function createWindow() {
    if (mainWindow)
        return;
    mainWindow = new electron_1.BrowserWindow({
        width: 800, //size of the app window - start at login size
        height: 600,
        resizable: false,
        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
            nodeIntegration: false,
            contextIsolation: true,
            sandbox: false,
            backgroundThrottling: false
        }
    });
    mainWindow.loadFile(path.join(__dirname, "../public/login.html")); //first window is login
    mainWindow.on("closed", () => {
        mainWindow = null;
    });
}
let popupWindow = null;
function createPopupWindow() {
    if (popupWindow)
        return;
    const { width, height } = electron_1.screen.getPrimaryDisplay().workAreaSize;
    popupWindow = new electron_1.BrowserWindow({
        width: 500, //setups up the size of the popup
        height: 250,
        frame: false,
        transparent: true,
        backgroundColor: "#00000000",
        alwaysOnTop: true, //it will be visible even after minimisation
        focusable: false,
        acceptFirstMouse: false,
        hasShadow: false,
        closable: true,
        resizable: false,
        modal: false,
        skipTaskbar: true,
        x: width - 520, //popup touches the right edge
        y: height / 2 - 125,
        webPreferences: {
            preload: path.join(__dirname, "popup.js"),
            sandbox: false,
            nodeIntegration: true,
            contextIsolation: false,
            backgroundThrottling: false
        }
    });
    popupWindow.setVisibleOnAllWorkspaces(true, {
        visibleOnFullScreen: true
    });
    popupWindow.setAlwaysOnTop(true, "screen-saver");
    popupWindow.loadFile(path.join(__dirname, "../public/popup.html")); //refers to html for design
    popupWindow.on("closed", () => {
        popupWindow = null;
    });
}
electron_1.ipcMain.on("show-popup", (event, data) => {
    createPopupWindow();
    popupWindow?.webContents.once("did-finish-load", () => {
        popupWindow?.webContents.send("set-popup-data", data); //sends the time data to html
    });
});
electron_1.ipcMain.on("close-popup", () => {
    popupWindow?.close();
    popupWindow = null;
});
electron_1.ipcMain.handle("register-user", async (_, user) => {
    return (0, userService_1.registerUser)(user);
});
electron_1.ipcMain.handle("login-user", async (event, credentials) => {
    const { username, password } = credentials;
    const user = (0, userService_1.loginUser)(username, password);
    if (user) {
        const win = electron_1.BrowserWindow.fromWebContents(event.sender);
        if (win) {
            win.setResizable(true);
            win.maximize(); //sets the screen to fullscreen
            win.setMinimumSize(800, 600);
            win.loadFile(path.join(__dirname, "../public/main.html"));
        }
    }
    return user;
});
electron_1.ipcMain.handle("update-user-profile", (_, data) => {
    return (0, userService_2.updateUserProfile)(data.oldUsername, data.newUsername, data.newEmail); //sends request to edit user details to preload
});
electron_1.ipcMain.handle("award-points", async (_event, data) => {
    try {
        const userId = Number(data.userId);
        const delta = Number(data.delta) || 0;
        if (!Number.isFinite(userId) || userId <= 0)
            throw new Error("Invalid userId"); //will error out if the user does not exist, this is just as a safety check
        const newTotal = (0, userService_3.addPoints)(userId, delta);
        return { success: true, points: newTotal };
    }
    catch (err) {
        console.error("award-points error:", err?.message ?? err); //error messages for handling point issues
        return { success: false, error: err?.message ?? String(err) };
    }
});
electron_1.app.whenReady().then(() => {
    createWindow();
    electron_1.globalShortcut.register("Alt+A", () => {
        if (mainWindow) {
            mainWindow.setSkipTaskbar(false);
            mainWindow.show();
            mainWindow.maximize();
            mainWindow.focus();
        }
    });
    electron_1.ipcMain.on("hide-window", () => {
        if (mainWindow) {
            mainWindow.hide();
            mainWindow.setSkipTaskbar(true);
        }
    });
    electron_1.app.on("activate", () => {
        if (electron_1.BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});
electron_1.app.on("will-quit", () => {
    electron_1.globalShortcut.unregisterAll(); //removes shortcut when app is closed
});
electron_1.app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        electron_1.app.quit();
    }
});
const active_win_1 = __importDefault(require("active-win"));
let appInterval = null;
electron_1.ipcMain.handle("start-app-tracker", () => {
    if (appInterval)
        return;
    appInterval = setInterval(async () => {
        const active = await (0, active_win_1.default)();
        if (!active) {
            mainWindow?.webContents.send("app-focus-update", {
                isApp: false,
                title: "",
                exe: ""
            });
            return;
        }
        const appNames = ["fortnite", "valorant", "minecraft", "steam", "elden ring"]; //example apps, these can be updated and changed
        const activeTitle = active.title.toLowerCase(); //ensure then app title matches the running exe
        const activeExe = active.owner?.name?.toLowerCase() ?? "";
        const isApp = appNames.some(//checks if the app matches one listed
        //checks if the app matches one listed
        name => activeTitle.includes(name) || activeExe.includes(name));
        mainWindow?.webContents.send("app-focus-update", {
            isApp,
            title: active.title,
            exe: activeExe
        });
    }, 1000);
});
electron_1.ipcMain.handle("stop-app-tracker", () => {
    if (appInterval) {
        clearInterval(appInterval);
        appInterval = null;
    }
});
//# sourceMappingURL=main.js.map