import { app, BrowserWindow } from "electron";  //imports electron
import * as path from "path";

let mainWindow: BrowserWindow | null = null;

function createWindow() {   //creates the window for application 
    if (mainWindow) return; //ensures window only opens once
    mainWindow = new BrowserWindow({
        width: 400,  //size of the app window
        height: 600,
        resizable: false,
        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
        },
    });

    mainWindow.loadFile(path.join(__dirname, "../public/login.html"));  //first window is login 

    mainWindow.on("closed", () => {
        mainWindow = null;
    });
}

app.on("ready", createWindow);

app.on("ready", createWindow);
app.on("window-all-closed", () => {
    if (process.platform !== "darwin") app.quit();  //stops running app on window close
});
app.on("activate", () => {
    if (mainWindow === null) createWindow();
});