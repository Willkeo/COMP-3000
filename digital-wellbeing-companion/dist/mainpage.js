"use strict";
document.addEventListener("DOMContentLoaded", () => {
    const usernameDisplay = document.getElementById("username-display"); //loads username for header
    const username = localStorage.getItem("username") ?? "User";
    if (usernameDisplay) {
        usernameDisplay.textContent = username;
    }
    const email = localStorage.getItem("email") ?? ""; //gets the email and points
    const points = localStorage.getItem("points") ?? "0";
    document.getElementById("profile-username").value = username; //loads them for html 
    document.getElementById("profile-email").value = email;
    document.getElementById("profile-points").value = points;
    let appStartTime = Date.now();
    function formatTime(ms) {
        const hours = Math.floor(ms / 3600000);
        const minutes = Math.floor((ms % 3600000) / 60000);
        const seconds = Math.floor((ms % 60000) / 1000);
        return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`; //return so it can be used in html
    }
    setInterval(() => {
        const elapsed = Date.now() - appStartTime; //timer starts when app is opened
        const screenTimeEl = document.getElementById("screen-time-value");
        if (screenTimeEl) {
            screenTimeEl.textContent = formatTime(elapsed);
        }
    }, 1000);
    window.addEventListener("DOMContentLoaded", () => {
        const hideBtn = document.getElementById("hideWindowBtn"); //registers whether the hide button has been clicked
        if (hideBtn && window.electronAPI) {
            hideBtn.addEventListener("click", () => {
                window.electronAPI.hideWindow();
            });
        }
    });
});
window.addEventListener("DOMContentLoaded", () => {
    const slider = document.getElementById("timeSlider"); //loads the buttons 
    const timeDisplay = document.getElementById("timeRemaining");
    const startBtn = document.getElementById("startTimerBtn");
    const pauseBtn = document.getElementById("pauseTimerBtn");
    let totalSeconds = 0; //set variables
    let remainingSeconds = 0;
    let timerInterval;
    slider.addEventListener("input", () => {
        const hours = Number(slider.value);
        if (hours === 4) {
            timeDisplay.textContent = "NO LIMIT"; //NO LIMIT is displayed 
            totalSeconds = 0;
            remainingSeconds = 0;
            return;
        }
        totalSeconds = hours * 3600; //calculates the amount of hours
        remainingSeconds = totalSeconds;
        timeDisplay.textContent = formatTime(remainingSeconds);
    });
    startBtn.addEventListener("click", () => {
        if (remainingSeconds <= 0)
            return;
        startBtn.disabled = true; //disables the start button 
        startBtn.classList.add("disabled");
        if (timerInterval)
            clearInterval(timerInterval);
        timerInterval = window.setInterval(() => {
            remainingSeconds--;
            timeDisplay.textContent = formatTime(remainingSeconds);
            if (remainingSeconds <= 0) {
                clearInterval(timerInterval);
                startBtn.disabled = false; //re enables button when time runs out
                startBtn.classList.remove("disabled");
                timeDisplay.textContent = "00:00:00";
            }
        }, 1000);
    });
    pauseBtn.addEventListener("click", () => {
        if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = undefined;
        }
        startBtn.disabled = false; //start button re-enabled when paused
        startBtn.classList.remove("disabled");
    });
    function formatTime(seconds) {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${pad(h)}:${pad(m)}:${pad(s)}`;
    }
    function pad(num) {
        return num.toString().padStart(2, "0");
    }
});
//# sourceMappingURL=mainpage.js.map