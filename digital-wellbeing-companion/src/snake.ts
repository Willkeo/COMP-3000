document.addEventListener("DOMContentLoaded", () => {
    const gameContainer = document.getElementById("snake-game") as HTMLElement;  //gets the game main container
    const gameModal = document.getElementById("snake-modal") as HTMLElement;  
    const gameOverlay = document.querySelector(".game-overlay") as HTMLElement;  //gets the overlay
    const closeBtn = document.getElementById("snake-close-btn") as HTMLButtonElement;  //gets the close button

    const playBtn = document.getElementById("snake-play-btn") as HTMLButtonElement;
    playBtn?.addEventListener("click", () => {
        gameModal.classList.add("active");  //shows the game screen
        gameOverlay.classList.add("active");  
        initializeSnakeGame();  //initializes the game so that everything loads correctly
    });

    closeBtn?.addEventListener("click", closeGame);
    gameOverlay?.addEventListener("click", closeGame);

    function closeGame() {
        gameModal.classList.remove("active");  //closes the game screen
        gameOverlay.classList.remove("active");  
    }

    function initializeSnakeGame() {
       
    }
});