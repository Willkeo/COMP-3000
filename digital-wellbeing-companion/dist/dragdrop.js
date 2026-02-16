"use strict";
document.addEventListener("DOMContentLoaded", () => {
    const gameContainer = document.getElementById("dragdrop-game"); //gets the games main container
    const gameModal = document.getElementById("dragdrop-modal");
    const gameOverlay = document.querySelector(".game-overlay"); //gets the overlay
    const closeBtn = document.getElementById("dragdrop-close-btn"); //gets the close button
    const playBtn = document.getElementById("dragdrop-play-btn");
    playBtn?.addEventListener("click", () => {
        gameModal.classList.add("active"); //shows the game screen
        gameOverlay.classList.add("active");
        initializeDragDropGame(); //initializes the game to ensure everything loads correctly
    });
    closeBtn?.addEventListener("click", closeGame); //x button to close the game
    gameOverlay?.addEventListener("click", closeGame);
    const DEFAULT_TIME_SECONDS = 60; //user have a minute to complete the game
    let timerInterval = null;
    let remainingSeconds = DEFAULT_TIME_SECONDS; //time loads before game starts
    let placedCount = 0;
    let totalTargets = 0;
    function closeGame() {
        stopTimer();
        gameModal.classList.remove("active"); //closes the game screen
        gameOverlay.classList.remove("active");
        if (gameContainer)
            gameContainer.innerHTML = "<p>Game content will load here</p>";
    }
    function initializeDragDropGame() {
        stopTimer();
        remainingSeconds = DEFAULT_TIME_SECONDS;
        placedCount = 0;
        gameContainer.innerHTML = ""; //wipes the previous game content to ensure a fresh start each time the game is played
        const title = document.createElement("h2"); //sets the game title at the top of the game screen
        title.className = "game-title";
        title.textContent = "Drag and Drop the correct shapes!";
        gameContainer.appendChild(title);
        const timerEl = document.createElement("div"); //time is places under the title and styled
        timerEl.id = "dd-timer";
        timerEl.style.textAlign = "center";
        timerEl.style.color = "#e6ffe7";
        timerEl.style.fontWeight = "700";
        timerEl.style.marginBottom = "8px";
        timerEl.textContent = formatTime(remainingSeconds);
        gameContainer.appendChild(timerEl);
        const dropZoneContainer = document.createElement("div"); //container for the drop zones where the shapes will be dragged to
        dropZoneContainer.className = "dropzones";
        const tray = document.createElement("div"); //container for the shapes that will be draggef too
        tray.className = "shape-tray";
        gameContainer.appendChild(dropZoneContainer);
        gameContainer.appendChild(tray);
        const uniqueTypes = shuffleArray([...new Set(shapes.map(s => s.type))]); //sets up randomising the slots
        totalTargets = uniqueTypes.length;
        uniqueTypes.forEach(type => {
            const zone = document.createElement("div"); //creating each drop zone
            zone.className = `dropzone`;
            zone.dataset.type = type;
            zone.dataset.filled = "false";
            const sizeMap = {
                circle: { w: 90, h: 90 }, //slots dimensions are based on the shape dimensions
                square: { w: 90, h: 90 },
                triangle: { w: 78, h: 78 },
                rectangle: { w: 120, h: 78 },
                oval: { w: 100, h: 78 },
                pentagon: { w: 90, h: 90 },
                hexagon: { w: 90, h: 90 },
                star: { w: 90, h: 90 },
                diamond: { w: 82, h: 82 },
                parallelogram: { w: 120, h: 78 },
            };
            const dims = sizeMap[type] ?? { w: 90, h: 90 };
            zone.style.width = `${dims.w}px`;
            zone.style.height = `${dims.h}px`;
            zone.addEventListener("dragover", e => e.preventDefault());
            zone.addEventListener("drop", e => {
                e.preventDefault();
                if (zone.dataset.filled === "true")
                    return;
                const shapeId = e.dataTransfer?.getData("text/plain"); //gets the id of the shape being dragged
                if (!shapeId)
                    return;
                const shape = shapes.find(s => s.id === shapeId); //finds the shape object based on the id 
                if (!shape)
                    return;
                const draggedEl = document.getElementById(shapeId);
                if (!draggedEl)
                    return;
                if (shape.type === type) {
                    zone.innerHTML = ""; //clears the drop zone of the placeholder
                    draggedEl.classList.add("placed");
                    draggedEl.setAttribute("draggable", "false");
                    draggedEl.classList.add("locked");
                    draggedEl.style.width = "85%"; //scales the shape down slightly to fit better within the drop zone and look visually appealing
                    draggedEl.style.height = "85%"; //same as above but for height
                    zone.appendChild(draggedEl);
                    zone.dataset.filled = "true";
                    placedCount += 1;
                    void checkCompletion();
                }
                else {
                    zone.classList.add("wrong");
                    setTimeout(() => zone.classList.remove("wrong"), 450); //adds a red border to indicate a mistake
                }
            });
            zone.innerHTML = getPlaceholderSVG(type, dims.w, dims.h); //sets the placeholder SVG for the drop zone based on the shape type
            dropZoneContainer.appendChild(zone);
        });
        const shuffledShapes = shuffleArray([...shapes]); //randomises the order of the shapes in the tray 
        shuffledShapes.forEach(shape => {
            const shapeWrapper = document.createElement("div"); //this changes each launch of the game
            shapeWrapper.id = shape.id;
            shapeWrapper.className = `shape ${shape.type}`;
            shapeWrapper.setAttribute("draggable", "true");
            const svg = getShapeSVG(shape.type, shape.color, 56, 56);
            shapeWrapper.innerHTML = svg;
            shapeWrapper.addEventListener("dragstart", e => {
                e.dataTransfer?.setData("text/plain", shape.id);
            });
            tray.appendChild(shapeWrapper); //adds the shape to the tray
        });
        startTimer(timerEl);
    }
    function startTimer(displayEl) {
        stopTimer();
        remainingSeconds = DEFAULT_TIME_SECONDS;
        if (displayEl)
            displayEl.textContent = formatTime(remainingSeconds); //updates the timer display with the initial time
        timerInterval = window.setInterval(() => {
            remainingSeconds -= 1;
            if (displayEl)
                displayEl.textContent = formatTime(remainingSeconds); //updates the timer display every second
            if (remainingSeconds <= 0) {
                stopTimer();
                onTimeUp();
            }
        }, 1000);
    }
    function stopTimer() {
        if (timerInterval !== null) {
            clearInterval(timerInterval);
            timerInterval = null;
        }
    }
    function formatTime(seconds) {
        const mm = Math.floor(seconds / 60).toString().padStart(2, "0");
        const ss = (seconds % 60).toString().padStart(2, "0");
        return `${mm}:${ss}`;
    }
    function onTimeUp() {
        showGameMessage("Game over", "Time is up!.", [
            { label: "Retry", action: () => { initializeDragDropGame(); } }, //users can retry from here however
            { label: "Close", action: () => { closeGame(); } }
        ]);
    }
    async function checkCompletion() {
        if (placedCount >= totalTargets) { //checks if all shapes have been placed correctly 
            stopTimer();
            const timeTaken = DEFAULT_TIME_SECONDS - remainingSeconds; // seconds elapsed
            let delta = 0;
            if (timeTaken <= 20)
                delta = 100; //awards points based on how quickly the user completed the game
            else if (timeTaken <= 30)
                delta = 50;
            else if (timeTaken <= 60)
                delta = 20;
            let awardedText = "No points awarded."; //message if no points are awarded
            try {
                if (delta > 0) {
                    const userIdStr = localStorage.getItem("userId"); //checks the user has a valid ID and is logged in before adding points
                    if (userIdStr) {
                        const res = await window.api.awardPoints(Number(userIdStr), delta, "dragdrop");
                        if (res && res.success && typeof res.points === "number") {
                            localStorage.setItem("points", String(res.points));
                            const profilePointsEl = document.getElementById("profile-points");
                            if (profilePointsEl)
                                profilePointsEl.value = String(res.points);
                            awardedText = `You earned ${delta} points!`; //succes message, taken from the wordsearch code
                        }
                        else {
                            console.error("awardPoints failed:", res); //error message incase the points system crashes
                        }
                    }
                    else {
                        const cur = Number(localStorage.getItem("points") ?? "0"); //will award no points if the account is not present
                        const newTotal = cur + delta;
                        localStorage.setItem("points", String(newTotal));
                        const profilePointsEl = document.getElementById("profile-points");
                        if (profilePointsEl)
                            profilePointsEl.value = String(newTotal);
                        awardedText = `You earned ${delta} points!`; //fallback message if the user is logged out midway through the game
                    }
                }
            }
            catch (e) {
                console.error("Error awarding points (dragdrop):", e); //error message
            }
            showGameMessage("Well done!", `Game completed in ${formatTime(timeTaken)}. ${awardedText}`, [
                { label: "Close", action: () => { closeGame(); } },
                { label: "Play again", action: () => { initializeDragDropGame(); } }
            ]);
        }
    }
    function showGameMessage(titleText, bodyText, actions) {
        const existing = document.getElementById("dd-message-overlay");
        if (existing)
            existing.remove();
        const overlay = document.createElement("div"); //creates an overlay to display the message on top of the game content
        overlay.id = "dd-message-overlay";
        overlay.style.position = "absolute";
        overlay.style.left = "0";
        overlay.style.top = "0";
        overlay.style.width = "100%";
        overlay.style.height = "100%";
        overlay.style.display = "flex";
        overlay.style.alignItems = "center";
        overlay.style.justifyContent = "center";
        overlay.style.background = "rgba(0,0,0,0.6)";
        overlay.style.zIndex = "40";
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
        const t = document.createElement("h3");
        t.textContent = titleText;
        t.style.marginTop = "0";
        box.appendChild(t);
        const p = document.createElement("p");
        p.textContent = bodyText;
        p.style.marginBottom = "14px";
        box.appendChild(p);
        const actionsContainer = document.createElement("div");
        actionsContainer.style.display = "flex";
        actionsContainer.style.justifyContent = "center";
        actionsContainer.style.gap = "10px";
        actions.forEach(a => {
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
                a.action();
            });
            actionsContainer.appendChild(btn);
        });
        box.appendChild(actionsContainer); //adds the action buttons to the message box
        overlay.appendChild(box); //adds the message box to the overlay
        gameContainer.appendChild(overlay); //adds the overlay to the game container so it appears on top of the game content
    }
    function shuffleArray(arr) {
        const a = [...arr];
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    }
    function getPlaceholderSVG(type, w, h) {
        const stroke = "rgba(255,255,255,0.25)"; //light transparent stroke to indicate the shape that should be placed in the drop zone, with a dashed outline
        const dash = "6 5";
        switch (type) {
            case "circle":
                return `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="${w / 2}" cy="${h / 2}" r="${Math.min(w, h) / 2 - 6}" fill="none" stroke="${stroke}" stroke-width="3" stroke-dasharray="${dash}" />  
                </svg>`;
            case "square":
                return `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
                    <rect x="5" y="5" width="${w - 10}" height="${h - 10}" rx="6" ry="6" fill="none" stroke="${stroke}" stroke-width="3" stroke-dasharray="${dash}" />
                </svg>`;
            case "rectangle":
                return `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
                    <rect x="5" y="8" width="${w - 10}" height="${h - 16}" rx="6" ry="6" fill="none" stroke="${stroke}" stroke-width="3" stroke-dasharray="${dash}" />
                </svg>`;
            case "oval":
                return `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
                    <ellipse cx="${w / 2}" cy="${h / 2}" rx="${(w / 2) - 6}" ry="${(h / 2) - 8}" fill="none" stroke="${stroke}" stroke-width="3" stroke-dasharray="${dash}" />
                </svg>`;
            case "triangle":
                return `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
                    <polygon points="${w / 2},6 ${6},${h - 6} ${w - 6},${h - 6}" fill="none" stroke="${stroke}" stroke-width="3" stroke-dasharray="${dash}" />
                </svg>`;
            case "pentagon":
                return `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
                    <polygon points="${w / 2},6 ${w - 8},${h * 0.36} ${w * 0.8},${h - 8} ${w * 0.2},${h - 8} ${8},${h * 0.36}" fill="none" stroke="${stroke}" stroke-width="3" stroke-dasharray="${dash}" />
                </svg>`;
            case "hexagon":
                return `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
                    <polygon points="${w * 0.25},6 ${w * 0.75},6 ${w - 6},${h / 2} ${w * 0.75},${h - 6} ${w * 0.25},${h - 6} ${6},${h / 2}" fill="none" stroke="${stroke}" stroke-width="3" stroke-dasharray="${dash}" />
                </svg>`;
            case "star":
                return `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
                    <polygon points="${w / 2},6 ${w * 0.62},${h * 0.36} ${w - 6},${h * 0.36} ${w * 0.69},${h * 0.62} ${w * 0.81},${h - 6} ${w / 2},${h * 0.75} ${w * 0.19},${h - 6} ${w * 0.31},${h * 0.62} ${6},${h * 0.36} ${w * 0.38},${h * 0.36}" fill="none" stroke="${stroke}" stroke-width="3" stroke-dasharray="${dash}" />
                </svg>`;
            case "diamond":
                return `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
                    <polygon points="${w / 2},6 ${w - 6},${h / 2} ${w / 2},${h - 6} ${6},${h / 2}" fill="none" stroke="${stroke}" stroke-width="3" stroke-dasharray="${dash}" />
                </svg>`;
            case "parallelogram":
                return `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
                    <polygon points="${w * 0.18},6 ${w - 6},6 ${w * 0.82},${h - 6} ${6},${h - 6}" fill="none" stroke="${stroke}" stroke-width="3" stroke-dasharray="${dash}" />
                </svg>`;
            default:
                return `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
                    <rect x="5" y="5" width="${w - 10}" height="${h - 10}" rx="6" ry="6" fill="none" stroke="${stroke}" stroke-width="3" stroke-dasharray="${dash}" />
                </svg>`;
        }
    }
    function getShapeSVG(type, color, w, h) {
        switch (type) {
            case "circle":
                return `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg"><circle cx="${w / 2}" cy="${h / 2}" r="${Math.min(w, h) / 2 - 2}" fill="${color}"/></svg>`;
            case "square":
                return `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="2" width="${w - 4}" height="${h - 4}" rx="6" ry="6" fill="${color}"/></svg>`;
            case "rectangle":
                return `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg"><rect x="1" y="${h * 0.15}" width="${w - 2}" height="${h * 0.7}" rx="6" ry="6" fill="${color}"/></svg>`;
            case "oval":
                return `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg"><ellipse cx="${w / 2}" cy="${h / 2}" rx="${w / 2 - 2}" ry="${h / 2 - 6}" fill="${color}"/></svg>`;
            case "triangle":
                return `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg"><polygon points="${w / 2},4 ${4},${h - 4} ${w - 4},${h - 4}" fill="${color}"/></svg>`;
            case "pentagon":
                return `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg"><polygon points="${w / 2},4 ${w - 6},${h * 0.38} ${w * 0.82},${h - 4} ${w * 0.18},${h - 4} ${6},${h * 0.38}" fill="${color}"/></svg>`;
            case "hexagon":
                return `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg"><polygon points="${w * 0.25},4 ${w * 0.75},4 ${w - 4},${h / 2} ${w * 0.75},${h - 4} ${w * 0.25},${h - 4} ${4},${h / 2}" fill="${color}"/></svg>`;
            case "star":
                return `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg"><polygon points="${w / 2},4 ${w * 0.62},${h * 0.36} ${w - 4},${h * 0.36} ${w * 0.68},${h * 0.62} ${w * 0.8},${h - 4} ${w / 2},${h * 0.76} ${w * 0.2},${h - 4} ${w * 0.32},${h * 0.62} ${4},${h * 0.36} ${w * 0.38},${h * 0.36}" fill="${color}"/></svg>`;
            case "diamond":
                return `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg"><polygon points="${w / 2},4 ${w - 4},${h / 2} ${w / 2},${h - 4} ${4},${h / 2}" fill="${color}"/></svg>`;
            case "parallelogram":
                return `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg"><polygon points="${w * 0.2},4 ${w - 4},4 ${w * 0.8},${h - 4} ${4},${h - 4}" fill="${color}"/></svg>`;
            default:
                return `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="2" width="${w - 4}" height="${h - 4}" rx="6" ry="6" fill="${color}"/></svg>`;
        }
    }
});
const shapes = [
    { id: "circle1", type: "circle", color: "red", complexity: 1 }, //array of shapes with their properties, complexity is used to determine how difficult the shape is to match
    { id: "square1", type: "square", color: "blue", complexity: 1 }, //10 was enough shapes to create a fun and engaging game without overwhelming the player
    { id: "triangle1", type: "triangle", color: "green", complexity: 2 },
    { id: "rectangle1", type: "rectangle", color: "yellow", complexity: 2 },
    { id: "oval1", type: "oval", color: "purple", complexity: 2 },
    { id: "pentagon1", type: "pentagon", color: "orange", complexity: 3 },
    { id: "hexagon1", type: "hexagon", color: "teal", complexity: 3 },
    { id: "star1", type: "star", color: "pink", complexity: 4 },
    { id: "diamond1", type: "diamond", color: "lime", complexity: 4 },
    { id: "parallelogram1", type: "parallelogram", color: "brown", complexity: 5 },
];
//# sourceMappingURL=dragdrop.js.map