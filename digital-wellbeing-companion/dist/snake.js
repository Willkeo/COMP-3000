"use strict";
//References for game logic used.
//Canvas 2D API(rendering): https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API
//Game loop / timers: https://developer.mozilla.org/en-US/docs/Games/Techniques/Timers
//Page visibility & input handling: https://developer.mozilla.org/en-US/docs/Web/API/Document
document.addEventListener("DOMContentLoaded", () => {
    const gameContainer = document.getElementById("snake-game"); //gets the game main container
    const gameModal = document.getElementById("snake-modal");
    const gameOverlay = document.querySelector(".game-overlay"); //gets the overlay
    const closeBtn = document.getElementById("snake-close-btn"); //gets the close button
    const playBtn = document.getElementById("snake-play-btn");
    playBtn?.addEventListener("click", () => {
        gameModal.classList.add("active"); //shows the game screen
        gameOverlay.classList.add("active");
        initializeSnakeGame(); //initializes the game so that everything loads correctly
    });
    closeBtn?.addEventListener("click", closeGame);
    gameOverlay?.addEventListener("click", closeGame);
    let currentGame = null;
    function closeGame() {
        gameModal.classList.remove("active"); //closes the game screen
        gameOverlay.classList.remove("active");
        if (currentGame) {
            currentGame.stop();
            currentGame = null;
        }
    }
    function initializeSnakeGame() {
        if (currentGame) {
            currentGame.stop();
            currentGame = null;
        }
        if (!gameContainer)
            return;
        gameContainer.innerHTML = "";
        currentGame = new SnakeGame(gameContainer, {
            scale: 18,
            cols: 30,
            rows: 18,
            tickMs: 120 //how often the game updates checking for collisions and user input etc
        });
        const wrapper = gameContainer.querySelector(".snake-wrapper"); //finds the wrapper element to add the start button to
        if (wrapper) {
            const startRow = document.createElement("div"); //creates the start button row
            startRow.style.display = "flex";
            startRow.style.justifyContent = "center";
            startRow.style.marginTop = "12px";
            const startBtn = document.createElement("button"); //creates the start button
            startBtn.className = "skill-check-btn snake-start-btn"; //uses the same styling as the skill check buttons
            startBtn.textContent = "Start Game";
            startBtn.addEventListener("click", () => {
                startBtn.disabled = true;
                startBtn.style.opacity = "0.6";
                currentGame?.start();
            });
            startRow.appendChild(startBtn);
            wrapper.appendChild(startRow);
        }
    }
    class SnakeGame {
        constructor(container, options) {
            this.snake = [];
            this.dir = { x: 1, y: 0 };
            this.nextDir = { x: 1, y: 0 };
            this.food = { x: 0, y: 0 };
            this.running = false;
            this.intervalId = null;
            this.startTime = null;
            this.timerIntervalId = null;
            this.timerEl = null;
            this.boundKeyHandler = (e) => this.handleKey(e); //binding the key handler to the button events
            this.boundVisibilityHandler = () => this.handleVisibilityChange();
            //sets up the canvas and timer elements and styles them
            this.container = container;
            this.scale = options?.scale ?? 16;
            this.cols = options?.cols ?? 20;
            this.rows = options?.rows ?? 15;
            this.tickMs = options?.tickMs ?? 120;
            this.canvas = document.createElement("canvas"); //creates the main box for the game
            this.canvas.className = "snake-canvas";
            this.canvas.width = this.cols * this.scale;
            this.canvas.height = this.rows * this.scale;
            this.canvas.style.imageRendering = "pixelated";
            this.canvas.style.background = "var(--game-bg, #132a1d)"; //modal-like background
            this.canvas.style.display = "block";
            this.canvas.style.margin = "0 auto";
            this.canvas.style.border = "2px solid var(--accent, #1ec870)"; //light green outline
            this.canvas.style.boxShadow = "0 6px 20px rgba(0,0,0,0.45)";
            this.canvas.style.borderRadius = "8px";
            const ctx = this.canvas.getContext("2d");
            if (!ctx)
                throw new Error("Failed to get load canvas"); //erro handling incase canvas fails to load
            this.ctx = ctx;
            const wrapper = document.createElement("div"); //creates a wrapper for the canvas and timer to keep them together and styles it
            wrapper.className = "snake-wrapper";
            wrapper.style.width = "100%";
            wrapper.style.display = "flex";
            wrapper.style.flexDirection = "column";
            wrapper.style.alignItems = "center";
            const timeHeader = document.createElement("div");
            timeHeader.className = "wordsearch-header";
            timeHeader.style.width = "100%";
            timeHeader.style.boxSizing = "border-box";
            const timeLabel = document.createElement("div"); //this is where the timer is created
            timeLabel.textContent = "Time: ";
            const timerSpan = document.createElement("span");
            timerSpan.id = "snake-timer";
            timerSpan.className = "snake-timer";
            timerSpan.textContent = "00:00";
            timeLabel.appendChild(timerSpan);
            timeHeader.appendChild(timeLabel);
            const tip = document.createElement("div"); //this is where the tip is created
            tip.className = "ws-tip"; //it is styled to match the other tips in my other games
            tip.textContent = "Tip: Use Arrow keys or WASD to move.";
            const body = document.createElement("div");
            body.className = "wordsearch-body";
            body.style.width = "100%";
            body.style.boxSizing = "border-box";
            const arenaCol = document.createElement("div");
            arenaCol.id = "snake-arena-container"; //this is the container for the canvas, it is used to add padding under the canvas to match the spacing similar to the word search game
            arenaCol.style.flex = "1";
            arenaCol.style.display = "flex";
            arenaCol.style.justifyContent = "center";
            arenaCol.style.alignItems = "center";
            arenaCol.style.padding = "12px 20px 20px 20px"; //spacing under arena similar to the word search
            arenaCol.appendChild(this.canvas);
            body.appendChild(arenaCol);
            wrapper.appendChild(timeHeader);
            wrapper.appendChild(tip);
            wrapper.appendChild(body);
            this.timerEl = timerSpan;
            this.container.appendChild(wrapper);
        }
        start() {
            if (this.running)
                return; //prevents multiple starts if the button is pressed multiple times
            this.resetState(); //this is to prevent bugs with the timer and start functionality
            this.attachListeners();
            this.running = true;
            this.intervalId = window.setInterval(() => this.tick(), this.tickMs);
            this.startTimer();
            this.render();
        }
        stop() {
            this.running = false; //stops the game loop and timer and removes the canvas from the DOM
            if (this.intervalId !== null) {
                clearInterval(this.intervalId);
                this.intervalId = null;
            }
            this.detachListeners();
            this.stopTimer();
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            const wrapper = this.canvas.parentElement;
            if (wrapper && wrapper.parentElement === this.container) {
                this.container.removeChild(wrapper);
            }
        }
        startTimer() {
            this.stopTimer();
            this.startTime = Date.now();
            if (this.timerEl)
                this.timerEl.textContent = "00:00";
            this.timerIntervalId = window.setInterval(() => {
                if (!this.startTime || !this.timerEl)
                    return;
                const elapsed = Date.now() - this.startTime;
                this.timerEl.textContent = this.formatTime(elapsed);
            }, 250);
        }
        stopTimer() {
            if (this.timerIntervalId !== null) {
                clearInterval(this.timerIntervalId);
                this.timerIntervalId = null;
            }
        }
        formatTime(ms) {
            const totalSec = Math.floor(ms / 1000);
            const mm = Math.floor(totalSec / 60);
            const ss = totalSec % 60;
            return `${mm.toString().padStart(2, "0")}:${ss.toString().padStart(2, "0")}`;
        }
        resetState() {
            const centerX = Math.floor(this.cols / 2); //starts the snake in the center of the arena
            const centerY = Math.floor(this.rows / 2); //initial snake is 2 blocks long to make the game a bit more interesting from the start
            this.snake = [
                { x: centerX - 1, y: centerY },
                { x: centerX, y: centerY },
            ];
            this.dir = { x: 1, y: 0 };
            this.nextDir = { x: 1, y: 0 };
            this.placeFood();
        }
        placeFood() {
            const occupied = new Set(this.snake.map(p => `${p.x},${p.y}`)); //finds a free spot to spawn the food
            let tries = 0;
            while (tries < 1000) {
                const fx = Math.floor(Math.random() * this.cols); //random x and y coordinates for the food
                const fy = Math.floor(Math.random() * this.rows);
                const key = `${fx},${fy}`;
                if (!occupied.has(key)) {
                    this.food = { x: fx, y: fy };
                    return;
                }
                tries++;
            }
            this.food = { x: 0, y: 0 };
        }
        tick() {
            if ((this.nextDir.x !== -this.dir.x || this.nextDir.y !== -this.dir.y) || //prevents the snake from reversing into itself
                (this.snake.length === 1)) {
                this.dir = this.nextDir; //updates the direction of the snake by user input
            }
            const head = { x: this.snake[this.snake.length - 1].x + this.dir.x, y: this.snake[this.snake.length - 1].y + this.dir.y };
            if (head.x < 0 || head.x >= this.cols || head.y < 0 || head.y >= this.rows) { //checks for collision with walls and ends the game if the snake hits a wall
                this.gameOver();
                return;
            }
            const willGrow = (head.x === this.food.x && head.y === this.food.y); //checks if the snake will grow this turn by seeing if the head is moving onto the food
            const checkUntil = willGrow ? this.snake.length : this.snake.length - 1;
            for (let i = 0; i < checkUntil; i++) {
                const s = this.snake[i];
                if (s.x === head.x && s.y === head.y) {
                    this.gameOver();
                    return;
                }
            }
            this.snake.push(head);
            if (willGrow) {
                this.placeFood(); //places new food on the canvas
                if (this.tickMs > 40) {
                    this.tickMs = Math.max(40, Math.floor(this.tickMs * 0.95)); //speeds up the game by decreasing the tick interval, making it more challenging as the snake gets longer
                    if (this.intervalId !== null) {
                        clearInterval(this.intervalId);
                        this.intervalId = window.setInterval(() => this.tick(), this.tickMs);
                    }
                }
            }
            else {
                this.snake.shift(); //removes the tail of the snake if it didn't grow, moving the snake forward
            }
            this.render();
        }
        gameOver() {
            this.running = false;
            if (this.intervalId !== null) {
                clearInterval(this.intervalId);
                this.intervalId = null;
            }
            const elapsed = this.startTime ? (Date.now() - this.startTime) : 0;
            const elapsedSec = Math.floor(elapsed / 1000);
            this.stopTimer(); //stops the timer when the game is over
            this.flashGameOver().then(async () => {
                this.ctx.fillStyle = "rgba(0,0,0,0.6)"; //dark overlay to make the game over message more visible
                this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
                this.ctx.fillStyle = "#fff";
                this.ctx.font = `${this.scale}px monospace`;
                this.ctx.textAlign = "center";
                this.ctx.fillText("Game Over", this.canvas.width / 2, this.canvas.height / 2);
                if (this.onGameOver)
                    this.onGameOver();
                const initialLength = 2; //starts the snake off at 2 pixels in lenghth
                const foodsCollected = Math.max(0, this.snake.length - initialLength); //calculates the number of food collected based on the length of the snake
                const minutesSurvived = Math.floor(elapsedSec / 60);
                const delta = foodsCollected * 10 + minutesSurvived * 20; //calculates the points to be awarded based on the food collected and time survive
                let awardedText = "No points awarded."; //deafult message if the game fails to award points 
                try {
                    if (delta > 0) {
                        const userIdStr = localStorage.getItem("userId"); //checks if the user is logged in and has a valid ID
                        if (userIdStr) {
                            const res = await window.api.awardPoints(Number(userIdStr), delta, "snake");
                            if (res && res.success && typeof res.points === "number") {
                                localStorage.setItem("points", String(res.points));
                                const profilePointsEl = document.getElementById("profile-points");
                                if (profilePointsEl)
                                    profilePointsEl.value = String(res.points);
                                awardedText = `You earned ${delta} points!`; //message to show how many points were earned
                            }
                            else {
                                console.error("awardPoints failed:", res); //error message if system crashes
                            }
                        }
                        else {
                            const cur = Number(localStorage.getItem("points") ?? "0"); //databse will update when a user logs back in
                            const newTotal = cur + delta;
                            localStorage.setItem("points", String(newTotal));
                            const profilePointsEl = document.getElementById("profile-points");
                            if (profilePointsEl)
                                profilePointsEl.value = String(newTotal);
                            awardedText = `You earned ${delta} points!`; //fallback system and message if the user is logged out mid way through the game
                        }
                    }
                }
                catch (e) {
                    console.error("Error awarding the points (snake):", e); //error message 
                }
                this.showGameMessage("Game Over", `You survived ${this.formatTime(elapsed)}. ${awardedText}`, [
                    { label: "Restart Game", action: () => { this.resetState(); this.start(); } },
                    { label: "Quit Game", action: () => { this.stop(); const modal = document.getElementById("snake-modal"); const overlay = document.querySelector(".game-overlay"); modal?.classList.remove("active"); overlay?.classList.remove("active"); } }
                ]);
            });
        }
        async flashGameOver() {
            const original = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
            for (let i = 0; i < 3; i++) {
                this.ctx.fillStyle = "rgba(255,0,0,0.12)";
                this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
                await this.delay(120);
                this.ctx.putImageData(original, 0, 0);
                await this.delay(120);
            }
        }
        delay(ms) {
            return new Promise(res => setTimeout(res, ms)); //utility function for creating delays which is used in the game over flash effect
        }
        showGameMessage(titleText, bodyText, actions) {
            const existing = document.getElementById("ws-message-overlay"); //uses the same styling as the message in the word search game
            if (existing)
                existing.remove();
            const overlay = document.createElement("div"); //creates the overlay for the message
            overlay.id = "ws-message-overlay"; //sets the styling for the overlay to cover the entire game area and centers the message box
            overlay.style.position = "fixed";
            overlay.style.inset = "0";
            overlay.style.display = "flex";
            overlay.style.alignItems = "center";
            overlay.style.justifyContent = "center";
            overlay.style.background = "rgba(0,0,0,0.6)";
            overlay.style.zIndex = "2000";
            overlay.setAttribute("role", "presentation");
            const box = document.createElement("div");
            box.style.background = "#0f2419";
            box.style.border = "2px solid #1ec870";
            box.style.padding = "18px";
            box.style.borderRadius = "10px";
            box.style.width = "420px";
            box.style.maxWidth = "90%";
            box.style.color = "#e6ffe7";
            box.style.textAlign = "center";
            box.style.boxShadow = "0 8px 32px rgba(0,0,0,0.4)";
            box.setAttribute("role", "dialog");
            box.setAttribute("aria-modal", "true");
            box.setAttribute("aria-label", titleText);
            const t = document.createElement("h3");
            t.textContent = titleText;
            t.style.marginTop = "0";
            box.appendChild(t);
            const p = document.createElement("p");
            p.textContent = bodyText;
            p.style.marginBottom = "14px";
            box.appendChild(p);
            const actionsContainer = document.createElement("div"); //loads the action buttons and styles it to center
            actionsContainer.style.display = "flex";
            actionsContainer.style.justifyContent = "center";
            actionsContainer.style.gap = "10px";
            let firstButton = null; //button styling
            actions.forEach((a, idx) => {
                const btn = document.createElement("button");
                btn.textContent = a.label;
                btn.style.padding = "8px 12px";
                btn.style.borderRadius = "6px";
                btn.style.border = "none";
                btn.style.cursor = "pointer";
                btn.style.fontWeight = "700";
                btn.style.background = "#1ec870";
                btn.style.color = "#0d2217";
                btn.addEventListener("click", () => {
                    overlay.remove();
                    try {
                        a.action();
                    }
                    catch (e) {
                        console.error(e);
                    }
                });
                actionsContainer.appendChild(btn);
                if (idx === 0)
                    firstButton = btn;
            });
            box.appendChild(actionsContainer);
            overlay.appendChild(box);
            document.body.appendChild(overlay);
            if (firstButton) {
                setTimeout(() => firstButton.focus(), 0);
            }
        }
        render() {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height); //clears the canvas before rendering the new state
            const bgCss = getComputedStyle(this.canvas).backgroundColor || "rgb(19,50,29)"; //gets the background color from the canvas styles to use as the base color
            const base = this.parseColor(bgCss);
            this.ctx.fillStyle = this.rgbToCss(base);
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            const snakeHeadColor = "#8AFF49"; //light green color for the snake head to make it stand out from the body
            const snakeBodyColor = "#4FB33A"; //darker green color for the snake body
            const foodColor = "#c43b3b";
            this.ctx.fillStyle = foodColor; //color for the food is a bright red to make it easily distinguishable
            this.ctx.fillRect(this.food.x * this.scale, this.food.y * this.scale, this.scale, this.scale);
            for (let i = 0; i < this.snake.length; i++) {
                const p = this.snake[i];
                this.ctx.fillStyle = (i === this.snake.length - 1) ? snakeHeadColor : snakeBodyColor;
                this.ctx.fillRect(p.x * this.scale, p.y * this.scale, this.scale, this.scale);
                this.ctx.strokeStyle = "rgba(0,0,0,0.18)";
                this.ctx.lineWidth = 1;
                this.ctx.strokeRect(p.x * this.scale + 0.5, p.y * this.scale + 0.5, this.scale - 1, this.scale - 1);
            }
        }
        attachListeners() {
            window.addEventListener("keydown", this.boundKeyHandler); //keyboard input for controlling the snake
            document.addEventListener("visibilitychange", this.boundVisibilityHandler);
        }
        detachListeners() {
            window.removeEventListener("keydown", this.boundKeyHandler);
            document.removeEventListener("visibilitychange", this.boundVisibilityHandler);
        }
        handleKey(e) {
            switch (e.key) {
                case "ArrowUp":
                case "w":
                case "W":
                    this.setNextDir(0, -1);
                    e.preventDefault();
                    break;
                case "ArrowDown":
                case "s":
                case "S":
                    this.setNextDir(0, 1);
                    e.preventDefault();
                    break;
                case "ArrowLeft":
                case "a":
                case "A":
                    this.setNextDir(-1, 0);
                    e.preventDefault();
                    break;
                case "ArrowRight":
                case "d":
                case "D":
                    this.setNextDir(1, 0);
                    e.preventDefault();
                    break;
            }
        }
        setNextDir(x, y) {
            if (this.dir.x === -x && this.dir.y === -y && this.snake.length > 1)
                return;
            this.nextDir = { x, y };
        }
        pause() {
            if (this.intervalId !== null) {
                clearInterval(this.intervalId);
                this.intervalId = null;
            }
            this.running = false;
            this.stopTimer();
        }
        resume() {
            if (!this.running) {
                this.running = true;
                if (this.intervalId === null) {
                    this.intervalId = window.setInterval(() => this.tick(), this.tickMs);
                }
                if (this.startTime) { //restarts the timer
                    if (this.timerIntervalId === null) {
                        this.timerIntervalId = window.setInterval(() => {
                            if (!this.startTime || !this.timerEl)
                                return;
                            const elapsed = Date.now() - this.startTime;
                            this.timerEl.textContent = this.formatTime(elapsed);
                        }, 250);
                    }
                }
            }
        }
        handleVisibilityChange() {
            if (document.hidden) {
                this.pause();
            }
            else {
                this.resume();
            }
        }
        parseColor(input) {
            input = input.trim();
            if (input.startsWith("rgb")) {
                const nums = input.match(/rgba?\(([^)]+)\)/);
                if (nums) {
                    const parts = nums[1].split(",").map(s => parseFloat(s.trim()));
                    return { r: Math.round(parts[0]), g: Math.round(parts[1]), b: Math.round(parts[2]) };
                }
            }
            else if (input.startsWith("#")) {
                let hex = input.slice(1);
                if (hex.length === 3)
                    hex = hex.split("").map(h => h + h).join("");
                const num = parseInt(hex, 16);
                return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
            }
            return { r: 19, g: 50, b: 29 };
        }
        shadeRgb(c, percent) {
            const clamp = (v) => Math.max(0, Math.min(255, Math.round(v)));
            return { r: clamp(c.r + (255 - c.r) * percent), g: clamp(c.g + (255 - c.g) * percent), b: clamp(c.b + (255 - c.b) * percent) };
        }
        rgbToCss(c) {
            return `rgb(${c.r}, ${c.g}, ${c.b})`;
        }
    }
});
//# sourceMappingURL=snake.js.map