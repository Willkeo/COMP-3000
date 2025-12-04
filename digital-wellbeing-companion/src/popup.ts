const { ipcRenderer } = require("electron");

window.addEventListener("DOMContentLoaded", () => {
    const header = document.getElementById("popup-header-text") as HTMLElement;
    const message = document.getElementById("popup-message") as HTMLElement;
    const acceptBtn = document.getElementById("popup-accept-btn") as HTMLButtonElement;
    const container = document.getElementById("popup-container") as HTMLElement;

    ipcRenderer.on("set-popup-data", (_event: any, data: { timeText: string; message: string }) => { //ensures the pop contains data 
        header.textContent = `Time goal remaining: ${data.timeText}`;
        message.textContent = data.message;

        container.classList.add("slide-in");
    });
    function slideOutAndClose() {  //handles the sliding animation
        container.classList.remove("slide-in");
        container.classList.add("slide-out");

        setTimeout(() => {
            ipcRenderer.send("close-popup");  //pop up closes after sliding off screen
        }, 450);
    }

    acceptBtn.addEventListener("click", () => {  //manually close popup
        slideOutAndClose();
    });

    setTimeout(slideOutAndClose, 10000);
});