"use strict";
document.addEventListener("DOMContentLoaded", () => {
    const gameContainer = document.getElementById("wordsearch-game"); //gets the games main container
    const gameModal = document.getElementById("wordsearch-modal");
    const gameOverlay = document.querySelector(".game-overlay");
    const closeBtn = document.getElementById("wordsearch-close-btn"); //gets the close button
    const playBtn = document.getElementById("wordsearch-play-btn");
    playBtn?.addEventListener("click", () => {
        gameModal.classList.add("active"); //shows the games screen after button click
        gameOverlay.classList.add("active");
        initializeWordSearchGame(); //initializes the game for loading
    });
    closeBtn?.addEventListener("click", closeGame);
    gameOverlay?.addEventListener("click", closeGame);
    let timerInterval = null;
    function closeGame() {
        gameModal.classList.remove("active"); // closes the game screen
        gameOverlay.classList.remove("active");
        cleanupGame();
    }
    function cleanupGame() {
        if (timerInterval !== null) {
            clearInterval(timerInterval);
            timerInterval = null;
        }
        const dynamic = gameModal.querySelector(".wordsearch-dynamic");
        if (dynamic)
            dynamic.remove();
    }
    function initializeWordSearchGame() {
        cleanupGame();
        const placeholders = Array.from(gameModal.querySelectorAll("*")).filter(el => (el.textContent ?? "").trim() === "Game content will load here");
        placeholders.forEach(p => p.remove());
        const WORDS = shuffleArray([
            "CAT", "DOG", "GRASS", "HOUSE", "GAMING", "DIGITAL", "COMPUTER", "HEALTH", "SUN", "WIN" //list of words to be found in the puzzle, they can be subject to change
        ]);
        const maxWordLength = Math.max(...WORDS.map(w => w.length));
        const gridSize = Math.max(10, maxWordLength + 3); //minimum 10x10 
        const dynamicWrapper = document.createElement("div"); //creates the dynamic content wrapper for the game to add the game elements
        dynamicWrapper.className = "wordsearch-dynamic";
        dynamicWrapper.innerHTML = `
            <div class="wordsearch-header">
                <div>Time: <span id="ws-timer">00:00</span></div>
            </div>
            <div class="ws-tip" role="note" aria-live="polite">
                Tip: words may appear backwards, vertically, horizontally or diagonally.
            </div>
            <div class="wordsearch-body">
                <div id="ws-grid-container" style="flex:1;"></div>
                <div class="ws-controls">
                    <div class="ws-controls-inner">
                        <input id="ws-input" type="text" placeholder="Type a word..." />
                        <button id="ws-submit">Submit</button>
                    </div>
                    <div style="margin-top:12px;">
                        <div>Words remaining: <span id="ws-remaining-count">0</span></div>
                    </div>
                    <div class="found-list" style="margin-top:12px;">
                        <div>Found:</div>
                        <ul id="ws-found-list" style="list-style:none; padding-left:8px; margin-top:8px;"></ul>
                    </div>
                </div>
            </div>
            <div id="ws-message" style="margin-top:12px;"></div>
        `;
        gameModal.appendChild(dynamicWrapper);
        const gridContainer = document.getElementById("ws-grid-container"); //declares the elements to be used in the game
        const inputEl = document.getElementById("ws-input");
        const submitBtn = document.getElementById("ws-submit");
        const timerEl = document.getElementById("ws-timer");
        const remainingEl = document.getElementById("ws-remaining-count");
        const foundListEl = document.getElementById("ws-found-list");
        const messageEl = document.getElementById("ws-message");
        let timeStart = null; //the timer starts when the game is loaded
        let foundWords = new Set();
        let placedWords = [];
        const grid = createEmptyGrid(gridSize);
        placedWords = placeWordsOnGrid(grid, WORDS);
        fillEmptyCells(grid);
        renderGrid(gridContainer, grid);
        updateRemainingCount();
        startTimer();
        submitBtn.addEventListener("click", handleSubmit); //users can submit their found words
        inputEl.addEventListener("keydown", (e) => {
            if (e.key === "Enter")
                handleSubmit();
        });
        function handleSubmit() {
            const raw = inputEl.value.trim().toUpperCase(); //reads the users input and formats it for checking
            if (raw === "")
                return; //will ignore empty submissions
            inputEl.value = "";
            messageEl.textContent = "";
            if (foundWords.has(raw)) {
                messageEl.textContent = `"${raw}" already found`; //prevents users from submitting the same word multiple times
                return;
            }
            const matched = placedWords.find(p => p.word === raw);
            if (!matched) {
                messageEl.textContent = `"${raw}" is not in the puzzle`; //handles incorrect answers
                return;
            }
            foundWords.add(raw); //marks the word as found and removes it from the remaining count, also adds it to the found list
            markWordFound(matched);
            updateRemainingCount();
            addFoundWordToList(raw, foundListEl);
            showGameMessage("Found a word!", `You found "${raw}".`, [
                { label: "Continue", action: () => { inputEl.focus(); } } //users can continue playing
            ]);
            if (foundWords.size === placedWords.length) {
                stopTimer();
                const elapsed = formatElapsedSeconds(Math.floor(((Date.now() - (timeStart ?? Date.now())) / 1000))); //when a user complete the word search they will be shown a message 
                showGameMessage("Well done!", `All words found in ${elapsed}.`, [
                    { label: "Play again", action: () => { initializeWordSearchGame(); } },
                    { label: "Close", action: () => { closeGame(); } }
                ]);
            }
        }
        function updateRemainingCount() {
            if (!remainingEl)
                return;
            const remaining = Math.max(0, placedWords.length - foundWords.size);
            remainingEl.textContent = String(remaining);
        }
        function addFoundWordToList(word, listEl) {
            if (!listEl)
                return;
            if (Array.from(listEl.querySelectorAll("li")).some(li => (li.textContent ?? "") === word))
                return;
            const li = document.createElement("li");
            li.className = "ws-found-list-item"; //list is styled to look like the rest of the modal
            li.textContent = word;
            li.style.marginBottom = "6px";
            li.style.fontWeight = "700";
            listEl.appendChild(li);
        }
        function startTimer() {
            timeStart = Date.now(); //starts the timer and updates the display every 500ms
            timerEl.textContent = "00:00";
            if (timerInterval !== null)
                clearInterval(timerInterval);
            timerInterval = window.setInterval(() => {
                const elapsedSec = Math.floor(((Date.now() - (timeStart ?? Date.now())) / 1000)); //calculates the time in seconds and updates the timer
                timerEl.textContent = formatElapsedSeconds(elapsedSec);
            }, 500);
        }
        function stopTimer() {
            if (timerInterval !== null) {
                clearInterval(timerInterval);
                timerInterval = null;
            }
        }
        function markWordFound(pw) {
            for (const pos of pw.positions) {
                const cell = gridContainer.querySelector(`[data-row="${pos.r}"][data-col="${pos.c}"]`); //in the css the background of the letters will change when found
                if (cell) {
                    cell.classList.add("ws-found");
                }
            }
        }
    }
    function showGameMessage(titleText, bodyText, actions) {
        const existing = document.getElementById("ws-message-overlay");
        if (existing)
            existing.remove();
        const overlay = document.createElement("div"); //creates an overlay for the message to be displayed on top of the game content
        overlay.id = "ws-message-overlay"; //ensures it is shown always and ontop of the game content
        overlay.style.position = "fixed";
        overlay.style.inset = "0";
        overlay.style.display = "flex";
        overlay.style.alignItems = "center";
        overlay.style.justifyContent = "center";
        overlay.style.background = "rgba(0,0,0,0.6)";
        overlay.style.zIndex = "2000";
        overlay.setAttribute("role", "presentation");
        const box = document.createElement("div"); //creates the message box to display the message and actions to the user
        box.style.background = "#0f2419";
        box.style.border = "2px solid #1ec870";
        box.style.padding = "18px";
        box.style.borderRadius = "10px";
        box.style.width = "420px";
        box.style.maxWidth = "90%";
        box.style.color = "#e6ffe7"; //styled to match the rest of the app
        box.style.textAlign = "center";
        box.style.boxShadow = "0 8px 32px rgba(0,0,0,0.4)";
        box.setAttribute("role", "dialog");
        box.setAttribute("aria-modal", "true");
        box.setAttribute("aria-label", titleText);
        const t = document.createElement("h3"); //creates the title for the message box
        t.textContent = titleText;
        t.style.marginTop = "0";
        box.appendChild(t);
        const p = document.createElement("p"); //creates the body text for the message box
        p.textContent = bodyText;
        p.style.marginBottom = "14px";
        box.appendChild(p);
        const actionsContainer = document.createElement("div"); //creates the container for the action buttons to be displayed in a row
        actionsContainer.style.display = "flex";
        actionsContainer.style.justifyContent = "center";
        actionsContainer.style.gap = "10px";
        let firstButton = null; //keeps track of the first button to set focus for accessibility reasons
        actions.forEach((a, idx) => {
            const btn = document.createElement("button"); //these are styling for the buttons used on the popups ingame
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
    function createEmptyGrid(size) {
        const g = [];
        for (let r = 0; r < size; r++) {
            const row = [];
            for (let c = 0; c < size; c++)
                row.push("");
            g.push(row);
        }
        return g;
    }
    const DIRS = [
        { dr: 0, dc: 1 },
        { dr: 0, dc: -1 },
        { dr: 1, dc: 0 },
        { dr: -1, dc: 0 },
        { dr: 1, dc: 1 },
        { dr: 1, dc: -1 },
        { dr: -1, dc: 1 },
        { dr: -1, dc: -1 }
    ];
    function placeWordsOnGrid(grid, words) {
        const size = grid.length;
        const placed = []; //keeps track of the placed words and their positions for checking user input later
        const shuffledWords = shuffleArray(words.slice()); //shuffles the words to ensure a different layout each time the game is played
        for (const rawWord of shuffledWords) {
            const word = rawWord.toUpperCase();
            const placeStr = Math.random() < 0.5 ? word : word.split('').reverse().join(''); //randomly decides to place the word backwards or forwards for added difficulty
            let placedThis = null;
            for (let attempt = 0; attempt < 500 && !placedThis; attempt++) {
                const dir = DIRS[Math.floor(Math.random() * DIRS.length)];
                const len = placeStr.length;
                const maxR = size - (dir.dr === 1 ? len : dir.dr === -1 ? len : 0);
                const maxC = size - (dir.dc === 1 ? len : dir.dc === -1 ? len : 0);
                const minR = dir.dr === -1 ? len - 1 : 0;
                const minC = dir.dc === -1 ? len - 1 : 0;
                const rStart = randomInt(minR, maxR - 1);
                const cStart = randomInt(minC, maxC - 1);
                let fits = true;
                const positions = []; //checks if the word can fit in the chosen position and direction without conflicting with already placed words
                for (let i = 0; i < len; i++) { //this ensures words dont block each other and to ensure they are all present in the grid
                    const r = rStart + dir.dr * i;
                    const c = cStart + dir.dc * i;
                    if (r < 0 || r >= size || c < 0 || c >= size) {
                        fits = false;
                        break;
                    }
                    const cell = grid[r][c];
                    if (cell !== "" && cell !== placeStr[i]) {
                        fits = false;
                        break;
                    }
                    positions.push({ r, c });
                }
                if (!fits)
                    continue;
                for (let i = 0; i < len; i++) {
                    const p = positions[i];
                    grid[p.r][p.c] = placeStr[i];
                }
                placedThis = { word, positions };
                placed.push(placedThis);
            }
            if (!placedThis) {
                const fallback = bruteForcePlace(grid, placeStr, word); //if the random placement fails after many attempts, it will try to place the word using a brute force method which checks every possible position and direction
                if (fallback)
                    placed.push(fallback); //this is to ensure all words are placed
                else
                    console.warn(`Failed to place word: ${word}`);
            }
        }
        return placed;
    }
    function bruteForcePlace(grid, placeStr, canonicalWord) {
        const size = grid.length;
        for (let r = 0; r < size; r++) { //checks every cell in the grid as a potential starting point for the word
            for (let c = 0; c < size; c++) {
                for (const dir of DIRS) {
                    const positions = [];
                    let fits = true;
                    for (let i = 0; i < placeStr.length; i++) {
                        const rr = r + dir.dr * i;
                        const cc = c + dir.dc * i;
                        if (rr < 0 || rr >= size || cc < 0 || cc >= size) {
                            fits = false;
                            break;
                        }
                        const ch = grid[rr][cc];
                        if (ch !== "" && ch !== placeStr[i]) {
                            fits = false;
                            break;
                        }
                        positions.push({ r: rr, c: cc });
                    }
                    if (!fits)
                        continue;
                    for (let i = 0; i < placeStr.length; i++) {
                        const p = positions[i];
                        grid[p.r][p.c] = placeStr[i];
                    }
                    return { word: (canonicalWord ?? placeStr), positions }; //if the word is placed successfully, it returns the placed word and its positions
                }
            }
        }
        return null;
    }
    function fillEmptyCells(grid) {
        const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"; //all letters to be used
        for (let r = 0; r < grid.length; r++) {
            for (let c = 0; c < grid.length; c++) {
                if (grid[r][c] === "") {
                    grid[r][c] = letters.charAt(Math.floor(Math.random() * letters.length));
                }
            }
        }
    }
    function renderGrid(container, grid) {
        container.innerHTML = ""; //clears any existing content in the grid container before rendering the new grid
        const size = grid.length;
        const table = document.createElement("div"); //creates a div to hold the grid, this is styled as a grid in CSS to layout the cells to make sure it is styled to the rest of the app
        table.className = "ws-grid";
        table.style.display = "grid";
        table.style.gridTemplateColumns = `repeat(${size}, var(--ws-cell-size))`;
        table.style.gridTemplateRows = `repeat(${size}, var(--ws-cell-size))`;
        table.style.gap = "var(--ws-gap)";
        for (let r = 0; r < size; r++) {
            for (let c = 0; c < size; c++) {
                const cell = document.createElement("div");
                cell.className = "ws-cell";
                cell.setAttribute("data-row", String(r));
                cell.setAttribute("data-col", String(c));
                cell.setAttribute("role", "gridcell");
                cell.textContent = grid[r][c];
                table.appendChild(cell);
            }
        }
        container.appendChild(table);
    }
    function randomInt(min, maxInclusive) {
        return Math.floor(Math.random() * (maxInclusive - min + 1)) + min;
    }
    function shuffleArray(arr) {
        //this is used to randomize the order of the words and their placement in the grid
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }
    function formatElapsedSeconds(sec) {
        const minutes = Math.floor(sec / 60);
        const seconds = sec % 60;
        return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    }
});
//# sourceMappingURL=wordsearch.js.map