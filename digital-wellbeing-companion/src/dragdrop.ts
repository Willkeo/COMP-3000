document.addEventListener("DOMContentLoaded", () => {
    const gameContainer = document.getElementById("dragdrop-game") as HTMLElement;  //gets the games main container
    const gameModal = document.getElementById("dragdrop-modal") as HTMLElement; 
    const gameOverlay = document.querySelector(".game-overlay") as HTMLElement;  //gets the overlay
    const closeBtn = document.getElementById("dragdrop-close-btn") as HTMLButtonElement;  //gets the close button

    const playBtn = document.getElementById("dragdrop-play-btn") as HTMLButtonElement;
    playBtn?.addEventListener("click", () => {
        gameModal.classList.add("active");  //shows the game screen
        gameOverlay.classList.add("active");  //shows the overlay
        initializeDragDropGame();  //initializes the game to ensure everything loads correctly
    });

    closeBtn?.addEventListener("click", closeGame);  //x button to close the game
    gameOverlay?.addEventListener("click", closeGame);

    function closeGame() {
        gameModal.classList.remove("active");  //closes the game screen
        gameOverlay.classList.remove("active"); 
    }

    function initializeDragDropGame() {
        
    }
});