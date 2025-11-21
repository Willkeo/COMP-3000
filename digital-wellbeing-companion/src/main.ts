import { app, BrowserWindow, globalShortcut, ipcMain } from "electron";
import * as path from "path";
import { registerUser, loginUser } from "./userService";

ipcMain.on("navigate", (event, page) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (!win) return;
    win.loadFile(path.join(__dirname, `../public/${page}`));
});

let mainWindow: BrowserWindow | null = null;

function createWindow() {
    if (mainWindow) return;

    mainWindow = new BrowserWindow({ //creates the window for application
        width: 400,  //size of the app window
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

    mainWindow.on("closed", () => { //ensures window only opens once
        mainWindow = null;
    });
}

ipcMain.handle("register-user", async (_, user) => { //sends data for user register using ICP
    return registerUser(user);
});

ipcMain.handle("login-user", async (event, credentials) => { //sends data to login using ICP
    const { username, password } = credentials;
    const user = loginUser(username, password);

    if (user) {
        const win = BrowserWindow.fromWebContents(event.sender);
        if (win) {
            win.setResizable(true);
            win.maximize(); //sets the screen to fullscreen
            win.setMinimumSize(800, 600);
            win.loadFile(path.join(__dirname, "../public/main.html"));
        }
    }

    return user;
});

app.whenReady().then(() => {

    createWindow();

    globalShortcut.register("Alt+A", () => {  //creates shortcut to reopen the page
        if (mainWindow) {
            mainWindow.setSkipTaskbar(false);
            mainWindow.show();
            mainWindow.maximize();
            mainWindow.focus();
        }
    });

    ipcMain.on("hide-window", () => { //hides window on click
        if (mainWindow) {
            mainWindow.hide();
            mainWindow.setSkipTaskbar(true);
        }
    });

    app.on("activate", () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on("will-quit", () => {
    globalShortcut.unregisterAll(); //removes shortcut when app is closed
});

app.on("window-all-closed", () => { //stops running when app is closed
    if (process.platform !== "darwin") {
        app.quit();
    }
});

