class AudioController {
    constructor() {
        // Audio elements for different game events
        this.holeSelection = new Audio('audio/hole_selection.mp3');
        this.move = new Audio('audio/peg_moving.mp3');
        this.multipleChoices = new Audio('audio/multiple_choices.mp3');
        this.endGame = new Audio('audio/end_game.mp3');
        this.notPossible = new Audio('audio/move_not_possible.mp3');

        // Audio control button and icon
        this.audioControl = document.querySelector('#audioControl');
        this.btnAudio = audioControl.firstElementChild;
    }

    // Control audio mute/unmute
    controlAudio() {
        if (this.btnAudio.classList.contains('bi-volume-up')) {
            this.btnAudio.classList.remove('bi-volume-up');
            this.btnAudio.classList.add('bi-volume-mute');
        } else {
            this.btnAudio.classList.remove('bi-volume-mute');
            this.btnAudio.classList.add('bi-volume-up');
        }
    }

    // Play hole selection audio
    holeSelectionAudio() {
        this.holeSelection.play();
    }

    // Play peg movement audio
    movePegAudio() {
        this.move.play();
    }

    // Play audio for multiple move choices
    multipleChoicesAudio() {
        this.multipleChoices.play();
    }

    // Play audio for impossible move
    notPossibleAudio() {
        this.notPossible.play();
    }

    // Play audio for game completion
    endGameAudio() {
        this.endGame.play();
    }
}

class GameBoard {
    constructor() {
        // Audio and sound effect controller
        this.audio = document.querySelector('#audioControl > i');
        this.soundEffect = new AudioController();

        // Stopwatch elements
        this.stopwatch = document.querySelector('.stopwatch');
        this.remainderSeconds = 0;
        this.formattedTime;
        this.seconds = 0;
        this.minutes = 0;
        this.interval;

        // Game flow variables
        this.pegSelected = false; //indicate if player had selected the empty hole to start the game
        this.pegsMovement = []; //keeps track of pegs movement combination pegFromContainer, pegToContainer, pegToRemove
        this.movePossible = 0;  //count how many moves are possible for selected peg     
        this.firstMove = true; //indicate beginning of the game
        this.wrongMoves = 0; //if player click on unmoveable peg 3 times in a row gameplay modal will be shown  
        this.pegCount = 14; //keep track of remaining pegs

        //Modals
        this.gamePlayModal = new bootstrap.Modal(document.querySelector('#gameplayModal'));
    }

    // Show objective modal at the start of the game
    showObjectiveModal() {
        const objectiveModal = new bootstrap.Modal(document.querySelector('#objectiveModal'));
        const btnStartGame = document.querySelector('#btnStartGame');
        btnStartGame.addEventListener('click', () => { objectiveModal.hide(); this.selectHoleModal(); });
        objectiveModal.show();

    }

    // Show modal for selecting starting hole
    selectHoleModal() {
        const pegHoleSelectModal = new bootstrap.Modal(document.querySelector('#pegHoleSelectModal'));
        const btnGotIt = document.querySelector('#btnGotIt');
        pegHoleSelectModal.show();
        btnGotIt.addEventListener('click', () => { pegHoleSelectModal.hide(); this.selectFirstHole(); })

    }

    // Select first hole to start the game
    selectFirstHole() {
        // Event listener for selecting hole
        const pegHoles = document.querySelectorAll('.peg-hole');
        pegHoles.forEach((el) => { el.addEventListener('click', () => this.initializeBoard(`${el.dataset.id}`)); });

        // Event listener for showing/hiding gameplay modal
        const linkGamePlay = document.querySelector('#linkGameplay');
        linkGamePlay.addEventListener('click', () => { this.gamePlayModal.show(); });
        const btnLetsGo = document.querySelector('#btnLetsGo');
        btnLetsGo.addEventListener('click', () => { this.gamePlayModal.hide(); });

        // Event listener for controlling audio
        this.soundEffect.btnAudio.addEventListener('click', () => { this.soundEffect.controlAudio(); });
    }

    // Initialize game board with pegs
    initializeBoard(hole) {
        if (!this.pegSelected) {
            // Play hole selection audio
            if (this.audio.classList.contains('bi-volume-up')) {
                this.soundEffect.holeSelectionAudio();
            }

            // Event listener for resetting the game
            const btnResetGame = document.querySelector('#btnResetGame');
            btnResetGame.addEventListener('click', () => this.resetGame(`${hole}`));
            this.displayPegs(hole);
        }

        this.pegSelected = true;
    }

    // Reset the game
    resetGame(firstHole) {
        // Reset stopwatch
        this.remainderSeconds = 0;
        this.formattedTime;
        this.seconds = 0;
        this.minutes = 0;
        this.interval;

       // Reset game flow variables
        this.pegsMovement = [];
        this.movePossible = 0;
        this.pegSelected = false;
        this.firstMove = true;
        this.wrongMoves = 0;
        this.pegCount = 14;

        // Update info board
        this.updatePegsLeft();
        this.stopStopwatch();
        this.removeAllPegs();
        this.stopwatch.textContent = '00:00';

        // Reinitialize the board
        this.initializeBoard(firstHole);
    }

    // Remove all pegs from the board
    removeAllPegs() {
        const allHoles = document.querySelectorAll('.peg-hole');
        allHoles.forEach((hole) => {
            // Clear classes
            hole.classList.remove('possibility', 'empty');

            // Delete peg if exists
            const peg = hole.firstElementChild;
            if (peg) {
                hole.removeChild(peg);
            }

            // Clone and replace peg-hole to remove event listeners
            const clone = hole.cloneNode(true);
            hole.parentNode.replaceChild(clone, hole);
        });
    } 

    // Display pegs on the board
    displayPegs(holeException) {
        const pegHoles = document.querySelectorAll('.peg-hole');
        for (let hole of pegHoles) {
            if (hole.dataset.id != holeException) {
                let pegImg = document.createElement("img");
                pegImg.src = "images/peg.png";
                pegImg.id = `peg${hole.dataset.id}`;
                pegImg.alt = "peg";
                pegImg.classList.add('peg');
                pegImg.addEventListener('click', () => this.checkPegMove(hole.dataset.id))

                // Append the image to the div
                hole.appendChild(pegImg);
            } else {
                hole.classList.add('empty');
            }
        }
    }

    // Check if the peg movement is valid
    checkPegMove(id) {
        // Disable peg movement if player has to first choose from multiple movement options
        const arePossibilities = document.querySelectorAll('.possibility');
        if (arePossibilities.length > 0) {
            return;
        }

        // Get the hole container id where the peg is currently located
        const holeId = document.querySelector(`#peg${id}`).parentNode.dataset.id;
        if (this.firstMove) {
            this.startStopwatch();
        }

        // Get the list of moves possible for the peg selected
        const moveOptions = PEG_GAMEPLAY.find((Obj) => Obj.id === holeId).moveOptions;
        for (let move of moveOptions) {
            const holeFrom = document.querySelector(`div[data-id='${holeId}'`);
            const holeReceiver = document.querySelector(`div[data-id='${move.move}'`);
            const holeAdjacent = document.querySelector(`div[data-id='${move.remove}'`);

            // If adjacent hole is not empty and receiving hole empty, move is possible
            if (holeReceiver.classList.contains('empty') && !holeAdjacent.classList.contains('empty')) {
                this.pegsMovement.push([holeFrom, holeReceiver, holeAdjacent]);
                this.movePossible++;
            }
        }

        // Activate sound effect if no move is possible
        if (!this.movePossible) {
            if (this.audio.classList.contains('bi-volume-up')) {
                this.soundEffect.notPossibleAudio();
            }

            // Show gameplay modal if player clicks on unmovable peg 2 times in a row
            if (this.wrongMoves === 2) {
                const gamePlayModal = new bootstrap.Modal(document.querySelector('#gameplayModal'));
                const btnLetsGo = document.querySelector('#btnLetsGo');
                btnLetsGo.addEventListener('click', () => { gamePlayModal.hide(); });
                gamePlayModal.show();

                // Reset count
                this.wrongMoves = 0;
            } else {
                this.wrongMoves++;
            }
        }

        // Multiple moves possible
        if (this.movePossible > 1) {
            if (this.audio.classList.contains('bi-volume-up')) {
                this.soundEffect.multipleChoicesAudio();
            }

            for (let move of this.pegsMovement) {
                const [pegFromContainer, pegToContainer, pegRemoveContainer] = move;
                const possibility = move.find((node) => node.classList.contains('empty'));
                
                // Highlight hole as possible move
                possibility.classList.add('possibility');

                // Add even listener to hole where the player can move the peg to
                possibility.addEventListener('click', () => { this.receivePeg(pegFromContainer, pegToContainer, pegRemoveContainer); });
            }

        } else if (this.movePossible === 1) { // Only one move possible
            const [pegFromContainer, pegToContainer, pegRemoveContainer] = this.pegsMovement[0];

            // Highlight possible move before moving the peg
            pegToContainer.classList.add('possibility');
            this.receivePeg(pegFromContainer, pegToContainer, pegRemoveContainer);
        }

        // Reset
        this.firstMove = false;
        this.pegsMovement = [];
    }

    // Receive peg to the new hole
    receivePeg(pegFromContainer, pegToContainer, pegRemoveContainer) {
        // Block event listener if hole selected is empty
        if (pegFromContainer.classList.contains('empty')) {
            return;
        }

        setTimeout(() => {
            // Move peg
            this.movePeg(pegToContainer, pegFromContainer);

            // Remove adjacent peg
            this.removePeg(pegRemoveContainer);
        }, 300);

        // Check if moves are possible
        setTimeout(() => {
            this.movePossible = 0;
            if (this.isGameOver()) {
                this.gameOver();
            };
        }, 500);
    }

    // Move the peg from one hole to another
    movePeg(pegToContainer, pegFromContainer) {
        pegToContainer.appendChild(pegFromContainer.firstElementChild);
        if (this.audio.classList.contains('bi-volume-up')) {
            this.soundEffect.movePegAudio();
        }

        pegFromContainer.classList.add('empty');
        pegToContainer.classList.remove('empty');

        // Clear all posibilities indication
        const possibilities = document.querySelectorAll('.possibility');
        possibilities.forEach((el) => el.classList.remove('possibility'));
    }

    // Remove the peg from the hole
    removePeg(hole) {
        // Remove peg
        hole.removeChild(hole.firstElementChild);

        // Declare hole empty
        hole.classList.add('empty');
        this.pegCount--;
        this.updatePegsLeft();
    }

    // Update the count of remaining pegs
    updatePegsLeft() {
        const pegsLeftCounter = document.querySelector("#pegsLeftCounter");
        pegsLeftCounter.textContent = this.pegCount;
    }

    // Check if the game is over
    isGameOver() {

        // Get all hole with pegs
        const pegLefts = document.querySelectorAll('.peg-hole:not(.empty)');

        for (let hole of pegLefts) {
            // Get the list of moves possible for the peg selected
            const moveOptions = PEG_GAMEPLAY.find((Obj) => Obj.id === hole.dataset.id).moveOptions;
            for (let move of moveOptions) {
                const holeReceiver = document.querySelector(`div[data-id='${move.move}`);
                const holeAdjacent = document.querySelector(`div[data-id='${move.remove}`);

                // If adjacent hole is not empty and receiving hole empty, move is possible
                if (holeReceiver.classList.contains('empty') && !holeAdjacent.classList.contains('empty')) {
                    this.movePossible++;
                }
            }
        }

        // No more move possible
        if (this.movePossible === 0) {
            return true;
        } else {
            this.movePossible = 0;
            return false
        }
    }

    // Game over logic
    gameOver() {
        this.stopStopwatch();
        this.completeGameModal();
    }

    // Show modal with game completion details
    completeGameModal() {
        const gameCompleteModal = new bootstrap.Modal(document.querySelector('#gameCompletedModal'));
        const btnPlayAgain = document.querySelector('#btnPlayAgain');
        const modalTime = document.querySelector("#modalTime");
        const modalPegsLeft = document.querySelector("#pegsLeft");
        const modalSkillMessage = document.querySelector("#skillMessage");
        const modalSkillMsgDesc = document.querySelector("#skillMessageDescription");

        let inputTime = this.stopwatch.textContent.split(':');
        let minutes = parseInt(inputTime[0]);
        let seconds = parseInt(inputTime[1]);
        let timeMsg = '';

        // Event listener for playing again
        btnPlayAgain.addEventListener('click', () => { document.location.reload(); });

        if (minutes > 0) {

            timeMsg = `${minutes} minutes and ${seconds} seconds`;

        } else {

            timeMsg = `${seconds} seconds`;

        }

        modalTime.textContent = timeMsg;

        // Define message to display based on the number of pegs left
        if (this.pegCount >= 5) {
            modalPegsLeft.textContent = `${this.pegCount} pegs left`;
            modalSkillMessage.innerHTML = `Your level is: <b>Peg Solitaire Beginner</b>`;
            modalSkillMsgDesc.innerHTML = 'Beginners have a basic understanding of the game but still have room for improvement in terms of strategy.';
        } else if (this.pegCount > 2) {
            modalPegsLeft.textContent = `${this.pegCount} pegs left`;
            modalSkillMessage.innerHTML = `Your level is: <b>Peg Solitaire Intermediate</b>`;
            modalSkillMsgDesc.innerHTML = 'Intermediate players have developed some proficiency and can solve the puzzle with relatively few pegs remaining.';
        } else if (this.pegCount === 2) {
            modalPegsLeft.textContent = `${this.pegCount} pegs left`;
            modalSkillMessage.innerHTML = `Your level is: <b>Peg Solitaire Advanced</b>`;
            modalSkillMsgDesc.innerHTML = 'Advanced players are skilled and can solve the puzzle with just two pegs left, demonstrating a good grasp of the game\'s strategy.';
        } else {
            modalPegsLeft.textContent = `${this.pegCount} peg left`;
            modalSkillMessage.innerHTML = `Your level is: <b>Peg Solitaire Expert</b>`;
            modalSkillMsgDesc.innerHTML = 'Experts are highly skilled players who consistently solve the puzzle with one peg remaining, showcasing a deep understanding of Peg Solitaire strategy.';
        }

        // Show game completion modal
        setTimeout(() => {
            if (this.audio.classList.contains('bi-volume-up')) {
                this.soundEffect.endGameAudio();
            }
            gameCompleteModal.show();
        }, 500);
    }

    // Start the stopwatch
    startStopwatch() {
        this.interval = setInterval(() => {
            this.seconds++;
            this.minutes = Math.floor(this.seconds / 60);
            this.remainderSeconds = this.seconds % 60;
            this.formattedTime = `${this.minutes.toString().padStart(2, '0')}:${this.remainderSeconds.toString().padStart(2, '0')}`;
            this.stopwatch.textContent = this.formattedTime;
        }, 1000);
    }

    // Stop the stopwatch
    stopStopwatch() {
        clearInterval(this.interval);
    }
}