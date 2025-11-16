document.addEventListener("DOMContentLoaded", () => {

    const usernameDisplay = document.getElementById("username-display");  //loads username for header
    const username = localStorage.getItem("username") ?? "User";

    if (usernameDisplay) {
        usernameDisplay.textContent = username;
    }

    const email = localStorage.getItem("email") ?? ""; //gets the email and points
    const points = localStorage.getItem("points") ?? "0";

    (document.getElementById("profile-username") as HTMLInputElement).value = username;  //loads them for html 
    (document.getElementById("profile-email") as HTMLInputElement).value = email;
    (document.getElementById("profile-points") as HTMLInputElement).value = points;

    let appStartTime = Date.now();

    function formatTime(ms: number): string {  //tracks how long the app has been open for
        const hours = Math.floor(ms / 3600000);
        const minutes = Math.floor((ms % 3600000) / 60000);
        const seconds = Math.floor((ms % 60000) / 1000);

        return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;  //return so it can be used in html
    }

    setInterval(() => {
        const elapsed = Date.now() - appStartTime;  //timer starts when app is opened

        const screenTimeEl = document.getElementById("screen-time-value");
        if (screenTimeEl) {
            screenTimeEl.textContent = formatTime(elapsed);
        }

    }, 1000);

});