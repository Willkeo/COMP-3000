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

    function formatTime(ms: number): string {  //tracks how long the app has been open for and formates it for use
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

    let appSeconds = 0;  //sets variables
    let appIntervalRunning = false;
    let appInterval: number | undefined;

    window.appTrackerAPI.start();  //waits for app tracker updates

    window.appTrackerAPI.onFocusUpdate((data) => {
        const appTimerEl = document.getElementById("app-time-value");

        if (!appTimerEl) return;

        if (data.isApp) {

            if (!appIntervalRunning) {  //if the app is running and in focus start counting
                appIntervalRunning = true;
                appInterval = window.setInterval(() => {
                    appSeconds++;
                    appTimerEl.textContent = formatAppTime(appSeconds);
                }, 1000);
            }
        } else {
            appIntervalRunning = false;  //pause the timer if app isnt running
            if (appInterval !== undefined) {
                clearInterval(appInterval);
                appInterval = undefined;
            }
        }
    
    });
    function formatAppTime(totalSeconds: number): string {  //formats app time so it can be inserted in HTML
        const h = Math.floor(totalSeconds / 3600);
        const m = Math.floor((totalSeconds % 3600) / 60);
        const s = totalSeconds % 60;
        return `${pad(h)}:${pad(m)}:${pad(s)}`;
    }

    function pad(num: number): string {
        return num.toString().padStart(2, "0");
    }

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
    const slider = document.getElementById("timeSlider") as HTMLInputElement;  //loads the buttons 
    const timeDisplay = document.getElementById("timeRemaining") as HTMLElement;
    const startBtn = document.getElementById("startTimerBtn") as HTMLButtonElement;
    const pauseBtn = document.getElementById("pauseTimerBtn") as HTMLButtonElement;

    const popupMessages = [
        "Time for a stretch!",  //popup messages. could be subject to change
        "Grab some water!",
        "Step outside for 5 minutes!",
        "Keep yourself calm!",
        "Anything else planned today?",
        "Take a quick break!",
        "Hows your mood?",
        "Online support is avalible.",
        "Will you meet your goal?",
        "Keep and eye on the time!",
        "Be kind online!",
        "Hows the game going?",
        "Grab a snack or two!"
    ];

    function getRandomBreakMessage(): string {
        return popupMessages[Math.floor(Math.random() * popupMessages.length)];  //selects a random message to display
    }

    let totalSeconds = 0;  //set variables
    let remainingSeconds = 0;
    let timerInterval: number | undefined;

    slider.addEventListener("input", () => {  //the slider declares how much time
        const hours = Number(slider.value);

        if (hours === 4) {
            timeDisplay.textContent = "NO LIMIT";  //NO LIMIT is displayed 
            totalSeconds = 0;
            remainingSeconds = 0;
            return;
        }

        totalSeconds = hours * 3600;  //calculates the amount of hours in seconds
        remainingSeconds = totalSeconds;

        timeDisplay.textContent = formatTime(remainingSeconds);
    });

    startBtn.addEventListener("click", () => {  //this starts the timer
        if (remainingSeconds <= 0) return;

        startBtn.disabled = true;          //disables the start button 
        startBtn.classList.add("disabled");

        window.popupAPI.showPopup({
            timeText: formatTime(remainingSeconds),  //shows popup when timer is started
            message: "Timer started, have fun!"
        });

        let nextPopupAt = remainingSeconds - 1800; //a pop up will show every half an hour from timer start

        if (timerInterval) clearInterval(timerInterval);

        timerInterval = window.setInterval(() => {
            remainingSeconds--;

            timeDisplay.textContent = formatTime(remainingSeconds);

            if (remainingSeconds === nextPopupAt && remainingSeconds > 0) {  //shows pop when the timer detects half an hour

                window.popupAPI.showPopup({
                    timeText: formatTime(remainingSeconds),  //shows the remaining time
                    message: getRandomBreakMessage()
                });

                nextPopupAt -= 1800; //next popup appears half an hour later
            }

            if (remainingSeconds <= 0) {
                clearInterval(timerInterval);
                startBtn.disabled = false;  //re enables button when time runs out
                startBtn.classList.remove("disabled");
                timeDisplay.textContent = "00:00:00";

                window.popupAPI.showPopup({  //pop displays when timer runs out to alert user
                    timeText: "00:00:00",
                    message: "Times up, take a break?"
                });

                return;

            }
        }, 1000);
    });

    pauseBtn.addEventListener("click", () => {  //can pause the timer using the break button
        if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = undefined;
        }
        startBtn.disabled = false;    //start button re-enabled when paused
        startBtn.classList.remove("disabled");
    });

    function formatTime(seconds: number): string {  //formats time into the remaining time slots
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;

        return `${pad(h)}:${pad(m)}:${pad(s)}`;
    }

    function pad(num: number): string {
        return num.toString().padStart(2, "0");
    }

});
