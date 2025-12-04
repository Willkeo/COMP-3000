"use strict";
const { ipcRenderer } = require("electron");
window.addEventListener("DOMContentLoaded", () => {
    const header = document.getElementById("popup-header-text");
    const message = document.getElementById("popup-message");
    const acceptBtn = document.getElementById("popup-accept-btn");
    const container = document.getElementById("popup-container");
    ipcRenderer.on("set-popup-data", (_event, data) => {
        header.textContent = `Time goal remaining: ${data.timeText}`;
        message.textContent = data.message;
        container.classList.add("slide-in");
    });
    function slideOutAndClose() {
        container.classList.remove("slide-in");
        container.classList.add("slide-out");
        setTimeout(() => {
            ipcRenderer.send("close-popup"); //pop up closes after sliding off screen
        }, 450);
    }
    acceptBtn.addEventListener("click", () => {
        slideOutAndClose();
    });
    setTimeout(slideOutAndClose, 10000);
});
//# sourceMappingURL=popup.js.map