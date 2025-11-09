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
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron"); //imports electron
const path = __importStar(require("path"));
const electron_2 = require("electron");
const userService_1 = require("./userService");
electron_2.ipcMain.on("navigate", (event, page) => {
    const win = electron_1.BrowserWindow.fromWebContents(event.sender);
    if (!win)
        return;
    win.loadFile(path.join(__dirname, `../public/${page}`));
});
let mainWindow = null;
function createWindow() {
    if (mainWindow)
        return; //ensures window only opens once
    mainWindow = new electron_1.BrowserWindow({
        width: 400, //size of the app window
        height: 600,
        resizable: false,
        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
            nodeIntegration: false,
            contextIsolation: true,
            sandbox: false,
        },
    });
    mainWindow.loadFile(path.join(__dirname, "../public/login.html")); //first window is login 
    mainWindow.on("closed", () => {
        mainWindow = null;
    });
    electron_2.ipcMain.handle("register-user", async (_, user) => {
        return (0, userService_1.registerUser)(user);
    });
    electron_2.ipcMain.handle("login-user", async (_, credentials) => {
        const { username, password } = credentials;
        return (0, userService_1.loginUser)(username, password);
    });
}
electron_1.app.on("ready", createWindow);
electron_1.app.on("ready", createWindow);
electron_1.app.on("window-all-closed", () => {
    if (process.platform !== "darwin")
        electron_1.app.quit(); //stops running app on window close
});
electron_1.app.on("activate", () => {
    if (mainWindow === null)
        createWindow();
});
//# sourceMappingURL=main.js.map