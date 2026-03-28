//References for functions used in this development file:
//Electron app / BrowserWindow / ipcMain: https://www.electronjs.org/docs/latest/api/app
//BrowserWindow options & security recommendations: https://www.electronjs.org/docs/latest/tutorial/security
//globalShortcut API: https://www.electronjs.org/docs/latest/api/global-shortcut
//Screen / display bounds:  https://www.electronjs.org/docs/latest/api/screen
//active-win (native active window):  https://github.com/sindresorhus/active-win

import { app, screen, BrowserWindow, globalShortcut, ipcMain } from "electron";
import * as path from "path";
import { registerUser, loginUser } from "./userService";
import { updateUserProfile } from "./userService";
import { addPoints } from "./userService";

ipcMain.on("navigate", (event, page) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (!win) return;
    
    if (page === "main.html") {
        win.setResizable(true);  //enable resizing for main window to fix bug after saving logon settings
        win.maximize();  //maximize to fullscreen
        win.setMinimumSize(800, 600);  //set minimum size
    }
    
    win.loadFile(path.join(__dirname, `../public/${page}`));
});

ipcMain.on("logout", (event) => { //handles logout window resize
    const win = BrowserWindow.fromWebContents(event.sender);
    if (win) {
        win.unmaximize();  //unmaximize the window first
        win.setResizable(false);  //disable resizing
        
        setTimeout(() => {
            win.setSize(400, 600);  //resizes window back to login size (width: 400, height: 600)
            win.center();  //center the window on screen
        }, 100);
        
        win.loadFile(path.join(__dirname, "../public/login.html"));
    }
});

ipcMain.handle("check-remember-login", (event) => { //checks if remember login is enabled
    return false;  //default to showing login page
});

let mainWindow: BrowserWindow | null = null;

function createWindow() {
    if (mainWindow) return;

    mainWindow = new BrowserWindow({ //creates the window for application
        width: 800,  //size of the app window - start at login size
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

    mainWindow.on("closed", () => { //ensures window only opens once
        mainWindow = null;
    });
}

let popupWindow: BrowserWindow | null = null;

function createPopupWindow() {
    if (popupWindow) return;

    const { width, height } = screen.getPrimaryDisplay().workAreaSize;

    popupWindow = new BrowserWindow({
        width: 500,  //setups up the size of the popup
        height: 250,
        frame: false,
        transparent: true, 
        backgroundColor: "#00000000",
        alwaysOnTop: true,  //it will be visible even after minimisation
        focusable: false,           
        acceptFirstMouse: false,    
        hasShadow: false,
        closable: true,
        resizable: false,
        modal: false,
        skipTaskbar: true,
        x: width - 520,    //popup touches the right edge
        y: height / 2 - 125,
        webPreferences: {
            preload: path.join(__dirname, "popup.js"), 
            sandbox: false,
            nodeIntegration: true,
            contextIsolation: false,
            backgroundThrottling: false
        }
    });

    popupWindow.setVisibleOnAllWorkspaces(true, {  //keeps the popup onscreen
        visibleOnFullScreen: true
    });
    popupWindow.setAlwaysOnTop(true, "screen-saver");

    popupWindow.loadFile(path.join(__dirname, "../public/popup.html"));  //refers to html for design

    popupWindow.on("closed", () => {
        popupWindow = null;
    });
}

ipcMain.on("show-popup", (event, data) => {
    createPopupWindow();

    popupWindow?.webContents.once("did-finish-load", () => {
        popupWindow?.webContents.send("set-popup-data", data); //sends the time data to html
    });
});

ipcMain.on("close-popup", () => {  //closes the popup
    popupWindow?.close();
    popupWindow = null;
});


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

ipcMain.handle("update-user-profile", (_, data) => {
    return updateUserProfile(data.oldUsername, data.newUsername, data.newEmail); //sends request to edit user details to preload
});

ipcMain.handle("award-points", async (_event, data) => {  //handler to award points to the user
    try {
        const userId = Number(data.userId);
        const delta = Number(data.delta) || 0;
        if (!Number.isFinite(userId) || userId <= 0) throw new Error("Invalid userId");  //will error out if the user does not exist, this is just as a safety check
        const newTotal = addPoints(userId, delta);
        return { success: true, points: newTotal };
    } catch (err: any) {
        console.error("award-points error:", err?.message ?? err);  //error messages for handling point issues
        return { success: false, error: err?.message ?? String(err) };
    }
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

    ipcMain.on("hide-window", () => { //hides window on click and shows a popup to inform user
        if (mainWindow) {
            mainWindow.hide();
            mainWindow.setSkipTaskbar(true);

            
            const popupData = {   //data to be sent to the popup
                timeText: "",
                message: "Press Alt + A to reopen."  //message to show on the popup
            };

            createPopupWindow();
            popupWindow?.webContents.once("did-finish-load", () => {
                popupWindow?.webContents.send("set-popup-data", popupData);
            });
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

import activeWin from "active-win";

let appInterval: NodeJS.Timeout | null = null;

ipcMain.handle("start-app-tracker", () => {  //this will start the timer when a game listed is detected, its constantly being updated.
    if (appInterval) return;

    appInterval = setInterval(async () => {
        const active = await activeWin();

        if (!active) {
            mainWindow?.webContents.send("app-focus-update", {  //checks if app is closed
                isApp: false,
                title: "",
                exe: ""
            });
            return;
        }

        const appNames = ["fortnite", "valorant", "minecraft", "steam", "elden ring"];  //example apps, these can be updated and changed

        const activeTitle = active.title.toLowerCase();  //ensure then app title matches the running exe
        const activeExe = active.owner?.name?.toLowerCase() ?? "";

        const isApp = appNames.some(  //checks if the app matches one listed
            name => activeTitle.includes(name) || activeExe.includes(name)
        );

        mainWindow?.webContents.send("app-focus-update", {  //checks if the app is still open
            isApp,
            title: active.title,
            exe: activeExe
        });
    }, 1000);
});

ipcMain.handle("stop-app-tracker", () => {  //when app is closed, it will send the signal to stop the timer
    if (appInterval) {
        clearInterval(appInterval);
        appInterval = null;
    }
});





