import { app, BrowserWindow } from "electron";  //imports electron
import * as path from "path";
import { ipcMain } from "electron";
import { registerUser, loginUser } from "./userService";

ipcMain.on("navigate", (event, page) => {  
    const win = BrowserWindow.fromWebContents(event.sender);
    if (!win) return;
    win.loadFile(path.join(__dirname, `../public/${page}`));
});

let mainWindow: BrowserWindow | null = null;

function createWindow() {   //creates the window for application 
    if (mainWindow) return; //ensures window only opens once
    mainWindow = new BrowserWindow({
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

    mainWindow.loadFile(path.join(__dirname, "../public/login.html"));  //first window is login 

    mainWindow.on("closed", () => {
        mainWindow = null;
    });

    
    ipcMain.handle("register-user", async (_, user) => {  //sends data to login using ICP
        return registerUser(user);
    });

    ipcMain.handle("login-user", async (event, credentials) => {
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

}

app.on("ready", createWindow);

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") app.quit();  //stops running app on window close
});
app.on("activate", () => {
    if (mainWindow === null) createWindow();
});
