document.addEventListener("DOMContentLoaded", getReady);

function getReady() {
    const game = new GameBoard();
    game.showObjectiveModal();
}