document.addEventListener("keydown", (e) => {
    console.log("KEY:", e.key, "TARGET:", e.target); //debugging to check the keyboard is being registered
}, true);

document.addEventListener("DOMContentLoaded", () => {

    const userId = localStorage.getItem("userId") ?? "guest";
    const username = localStorage.getItem("username") ?? "User";
    updateStreak(userId); //loads the username to be attached to the streak variable
    const usernameDisplay = document.getElementById("username-display");  //loads username for header

    function getStreakKeys(userId: string) {
        return {
            streakKey: `streak_${userId}`,  //ensures the streak is account based
            lastOpenKey: `lastOpen_${userId}`  //uses the username to identify the streak and if the user is openening daily
        };
    }

    if (usernameDisplay) {
        usernameDisplay.textContent = username;
    }

    const email = localStorage.getItem("email") ?? ""; //gets the email and points
    const points = localStorage.getItem("points") ?? "0";

    (document.getElementById("profile-username") as HTMLInputElement).value = username;  //loads them for html 
    (document.getElementById("profile-email") as HTMLInputElement).value = email;
    (document.getElementById("profile-points") as HTMLInputElement).value = points;

    const profileImage = document.getElementById("profile-image") as HTMLImageElement;
    const uploadInput = document.getElementById("profile-upload") as HTMLInputElement;

    profileImage.addEventListener("click", () => {  //opens up file explorer
        uploadInput.click();
    });

    uploadInput.addEventListener("change", () => {  //checks if an image has been uploaded // currently any size of image can be uploaded
        const file = uploadInput.files?.[0];
        if (!file) return;

        const reader = new FileReader();

        reader.onload = () => {
            const imageData = reader.result as string;
            profileImage.src = imageData;

            localStorage.setItem(`profileImage_${userId}`, imageData); //stores the profile image to local storage with account
        };

        reader.readAsDataURL(file);
    });

    const savedImage = localStorage.getItem(`profileImage_${userId}`); //loads the saved profile image for the account.
    if (savedImage) profileImage.src = savedImage;

    const editBtn = document.getElementById("edit-profile-btn") as HTMLButtonElement;  //declares the profile sections as being editiable
    const usernameInput = document.getElementById("profile-username") as HTMLInputElement;
    const emailInput = document.getElementById("profile-email") as HTMLInputElement;

    let editing = false;

    editBtn.addEventListener("click", async () => {  //enters an editing mode when the button is clicked
        if (!editing) {
            editing = true;
            editBtn.textContent = "Save";

            usernameInput.removeAttribute("readonly");  //removes the readonly from the html to allow editing
            emailInput.removeAttribute("readonly");

            requestAnimationFrame(() => {  //ensures the box stays in focus
                usernameInput.focus();
                usernameInput.setSelectionRange(
                    usernameInput.value.length,
                    usernameInput.value.length
                );
            });
        } else {
            editing = false;
            editBtn.textContent = "Edit profile";  //button returns to normal once editing is done

            usernameInput.setAttribute("readonly", "true"); //turns it back to readonly to endure uses dont accidently make changes
            emailInput.setAttribute("readonly", "true");

            const newUsername = usernameInput.value.trim();
            const newEmail = emailInput.value.trim();
            const oldUsername = localStorage.getItem("username");

            (window as any).api.updateUserProfile(oldUsername, newUsername, newEmail);

            localStorage.setItem("username", newUsername);  //sends the request for the new data to be added to the database
            localStorage.setItem("email", newEmail);

            alert("Your profile updated");  //alert message
        }
    });


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

    function updateStreak(userId: string) {
        const { streakKey, lastOpenKey } = getStreakKeys(userId);

        const today = new Date();
        const todayStr = today.toISOString().split("T")[0];

        const lastOpen = localStorage.getItem(lastOpenKey);  //checks local storage for last time the app was opened
        let streak = Number(localStorage.getItem(streakKey)) || 0;

        if (!lastOpen) {
            streak = 1;
        } else {
            const lastDate = new Date(lastOpen);
            const diffTime = today.getTime() - lastDate.getTime();
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays === 1) {  //checks if the day has increased by 1
                streak += 1;
            } else if (diffDays > 1) {  //resets the streak if the day has increase by more than 1 (miss a day)
                streak = 1;
            }
        }

        localStorage.setItem(streakKey, streak.toString());
        localStorage.setItem(lastOpenKey, todayStr);

        updateStreakUI(streak);
    }

    function updateStreakUI(streak: number) {
        const streakNumber = document.getElementById("streak-number"); //updates the number in HTML by 1
        if (streakNumber) {
            streakNumber.textContent = streak.toString();
        }
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

    const settingsBtn = document.getElementById("settings-btn") as HTMLButtonElement;  //declares all the relevant settings elements
    const settingsModal = document.getElementById("settings-modal") as HTMLElement;
    const settingsOverlay = document.getElementById("settings-overlay") as HTMLElement;
    const closeSettingsBtn = document.getElementById("close-settings-btn") as HTMLButtonElement;
    const logoutBtn = document.getElementById("logout-btn") as HTMLButtonElement;

    const disablePopupsToggle = document.getElementById("disable-popups-toggle") as HTMLInputElement;
    const closeOnExitToggle = document.getElementById("close-on-exit-toggle") as HTMLInputElement;
    const rememberLoginToggle = document.getElementById("remember-login-toggle") as HTMLInputElement;

    function loadSettings() {
        const disablePopups = localStorage.getItem("disablePopups") === "true";  //stores the settings in local storage
        const closeOnExit = localStorage.getItem("closeOnExit") === "true";
        const rememberLogin = localStorage.getItem("rememberLogin") !== "false";

        disablePopupsToggle.checked = disablePopups;
        closeOnExitToggle.checked = closeOnExit;
        rememberLoginToggle.checked = rememberLogin;
    }

    function saveSettings() {
        localStorage.setItem("disablePopups", disablePopupsToggle.checked.toString());  //saves the settings to local storage
        localStorage.setItem("closeOnExit", closeOnExitToggle.checked.toString());
        localStorage.setItem("rememberLogin", rememberLoginToggle.checked.toString());
    }

    function openSettings() {
        settingsModal.classList.add("active");  //opens settings modal
        settingsOverlay.classList.add("active");
        loadSettings();
    }

    function closeSettings() {
        settingsModal.classList.remove("active");  //closes settings modal
        settingsOverlay.classList.remove("active");
    }
    settingsBtn.addEventListener("click", openSettings);  //create buttons to open and close settings
    closeSettingsBtn.addEventListener("click", closeSettings);
    settingsOverlay.addEventListener("click", closeSettings);

    disablePopupsToggle.addEventListener("change", saveSettings);  //saves the settings when toggled
    closeOnExitToggle.addEventListener("change", saveSettings);
    rememberLoginToggle.addEventListener("change", saveSettings);

    logoutBtn.addEventListener("click", () => {
        if (confirm("Are you sure you want to logout?")) {  //removes all user data from local storage on logout
            localStorage.removeItem("userId");
            localStorage.removeItem("username");
            localStorage.removeItem("email");
            localStorage.removeItem("points");
            localStorage.setItem("rememberLogin", "false");  //disables auto-login on logout
            
            (window as any).api.logout();  //calls the logout handler to resize window
        }
    });

    loadSettings();

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

    function saveTimeGoal(duration: string) {
        const userId = localStorage.getItem("userId") ?? "guest";

        const existing = JSON.parse(localStorage.getItem("goalHistory_" + userId) ?? "[]"); //loads the current data

        existing.unshift({  //adds a new date
            duration,
            setAt: Date.now()
        });

        while (existing.length > 12) existing.pop(); //only keeps the most recent 12

        localStorage.setItem("goalHistory_" + userId, JSON.stringify(existing)); //saves to local storage

        loadGoalHistory();
    }
    interface GoalEntry {
        setAt: string;
        duration: string;
    }

    function loadGoalHistory() {
        const userId = localStorage.getItem("userId") ?? "guest";  //loads the users data
        const list = document.getElementById("goal-history-list");

        if (!list) return;

        const goals = JSON.parse(localStorage.getItem("goalHistory_" + userId) ?? "[]");

        list.innerHTML = "";

        if (goals.length === 0) { //will display a message if there are no current time goals
            const li = document.createElement("li");
            li.textContent = "No recent time goals yet!";
            li.classList.add("goal-item");
            list.appendChild(li);
            return;
        }

        goals.forEach((g: GoalEntry) => {
            const li = document.createElement("li");
            const date = new Date(g.setAt);   //fetches current date
            li.textContent = `On ${date.toLocaleDateString()}, you set a time goal for ${g.duration}`;
            li.classList.add("goal-item"); //for styling on my css
            list.appendChild(li);
        });
    }

    //load history on startup
    loadGoalHistory();


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

        saveTimeGoal(formatTime(remainingSeconds)); //sends the current time to the save recent time goal function

        const disablePopups = localStorage.getItem("disablePopups") === "true";  //checks if popups are disabled
        if (!disablePopups) {  //only show popup if not disabled
            window.popupAPI.showPopup({
                timeText: formatTime(remainingSeconds),  //shows popup when timer is started
                message: "Timer started, have fun!"
            });
        }

        let nextPopupAt = remainingSeconds - 1800; //a pop up will show every half an hour from timer start

        if (timerInterval) clearInterval(timerInterval);

        timerInterval = window.setInterval(() => {
            remainingSeconds--;

            timeDisplay.textContent = formatTime(remainingSeconds);

            if (remainingSeconds === nextPopupAt && remainingSeconds > 0) {  //shows pop when the timer detects half an hour
    
                const disablePopups = localStorage.getItem("disablePopups") === "true";  //checks if popups are disabled
                if (!disablePopups) {  //only show popup if not disabled
                    window.popupAPI.showPopup({
                        timeText: formatTime(remainingSeconds),  //shows the remaining time
                        message: getRandomBreakMessage()
                    });
                }

                nextPopupAt -= 1800; //next popup appears half an hour later
            }

            if (remainingSeconds <= 0) {
                clearInterval(timerInterval);
                startBtn.disabled = false;  //re enables button when time runs out
                startBtn.classList.remove("disabled");
                timeDisplay.textContent = "00:00:00";

                const disablePopups = localStorage.getItem("disablePopups") === "true";  //checks if popups are disabled
                if (!disablePopups) {  //only show popup if not disabled
                    window.popupAPI.showPopup({  //pop displays when timer runs out to alert user
                        timeText: "00:00:00",
                        message: "Times up, take a break?"
                    });
                }

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
