"use strict";
document.addEventListener("DOMContentLoaded", () => {
    const gameContainer = document.getElementById("dragdrop-game"); //gets the games main container
    const gameModal = document.getElementById("dragdrop-modal");
    const gameOverlay = document.querySelector(".game-overlay"); //gets the overlay
    const closeBtn = document.getElementById("dragdrop-close-btn"); //gets the close button
    const playBtn = document.getElementById("dragdrop-play-btn");
    playBtn?.addEventListener("click", () => {
        gameModal.classList.add("active"); //shows the game screen
        gameOverlay.classList.add("active"); //shows the overlay
        initializeDragDropGame(); //initializes the game to ensure everything loads correctly
    });
    closeBtn?.addEventListener("click", closeGame); //x button to close the game
    gameOverlay?.addEventListener("click", closeGame);
    function closeGame() {
        gameModal.classList.remove("active"); //closes the game screen
        gameOverlay.classList.remove("active");
    }
    function initializeDragDropGame() {
    }
});
//# sourceMappingURL=dragdrop.js.map