document.addEventListener("DOMContentLoaded", () => {
    const gameContainer = document.getElementById("wordsearch-game") as HTMLElement;  //gets the games main container
    const gameModal = document.getElementById("wordsearch-modal") as HTMLElement;  
    const gameOverlay = document.querySelector(".game-overlay") as HTMLElement;  
    const closeBtn = document.getElementById("wordsearch-close-btn") as HTMLButtonElement;  //gets the close button

    const playBtn = document.getElementById("wordsearch-play-btn") as HTMLButtonElement;
    playBtn?.addEventListener("click", () => {
        gameModal.classList.add("active");  //shows the games screen after button click
        gameOverlay.classList.add("active"); 
        initializeWordSearchGame();  //initializes the game for loading
    });

    closeBtn?.addEventListener("click", closeGame);
    gameOverlay?.addEventListener("click", closeGame);

    function closeGame() {
        gameModal.classList.remove("active");  //closes the game screen
        gameOverlay.classList.remove("active");  
    }

    function initializeWordSearchGame() {
        
    }
});