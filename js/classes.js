class AudioController {
    constructor() {
        this.holeSelection = new Audio('audio/hole_selection.mp3');
        this.move = new Audio('audio/peg_moving.mp3');
        this.multipleChoices = new Audio('audio/multiple_choices.mp3');
        this.endGame = new Audio('audio/end_game.mp3');
        this.notPossible = new Audio('audio/move_not_possible.mp3');

        this.audioControl = document.querySelector('#audioControl');
        this.btnAudio = audioControl.firstElementChild;
    }

    controlAudio() {
        if (this.btnAudio.classList.contains('bi-volume-up')) {
            this.btnAudio.classList.remove('bi-volume-up');
            this.btnAudio.classList.add('bi-volume-mute');
        } else {
            this.btnAudio.classList.remove('bi-volume-mute');
            this.btnAudio.classList.add('bi-volume-up');
        }
    }

    holeSelectionAudio() {
        this.holeSelection.play();
    }

    movePegAudio() {
        this.move.play();
    }

    multipleChoicesAudio() {
        this.multipleChoices.play();
    }

    notPossibleAudio() {
        this.notPossible.play();
    }

    endGameAudio() {
        this.endGame.play();
    }
}

class GameBoard {
    constructor() {
        //audio 
        this.audio = document.querySelector('#audioControl > i');
        this.soundEffect = new AudioController();

        //stopwatch
        this.stopwatch = document.querySelector('.stopwatch');
        this.remainderSeconds = 0;
        this.formattedTime;
        this.seconds = 0;
        this.minutes = 0;
        this.interval;

        //gameflow
        this.pegSelected = false; //indicate if player had selected the empty hole to start the game
        this.pegsMovement = []; //keeps track of pegs movement combination pegFromContainer, pegToContainer, pegToRemove
        this.movePossible = 0;  //count how many moves are possible for selected peg     
        this.firstMove = true; //indicate beginning of the game
        this.wrongMoves = 0; //if player click on unmoveable peg 3 times in a row gameplay modal will be shown  
        this.pegCount = 14; //keep track of remaining pegs

        //modals
        this.gamePlayModal = new bootstrap.Modal(document.querySelector('#gameplayModal'));
    }

    showObjectiveModal() {
        const objectiveModal = new bootstrap.Modal(document.querySelector('#objectiveModal'));
        const btnStartGame = document.querySelector('#btnStartGame');
        btnStartGame.addEventListener('click', () => { objectiveModal.hide(); this.selectHoleModal(); });
        objectiveModal.show();

    }

    selectHoleModal() {
        const pegHoleSelectModal = new bootstrap.Modal(document.querySelector('#pegHoleSelectModal'));
        const btnGotIt = document.querySelector('#btnGotIt');
        pegHoleSelectModal.show();
        btnGotIt.addEventListener('click', () => { pegHoleSelectModal.hide(); this.selectFirstHole(); })

    }

    selectFirstHole() { //select first hole to start the game
        const pegHoles = document.querySelectorAll('.peg-hole');
        pegHoles.forEach((el) => { el.addEventListener('click', () => this.initializeBoard(`${el.dataset.id}`)); });

        //btn modal event listener
        const linkGamePlay = document.querySelector('#linkGameplay');
        linkGamePlay.addEventListener('click', () => { this.gamePlayModal.show(); });
        const btnLetsGo = document.querySelector('#btnLetsGo');
        btnLetsGo.addEventListener('click', () => { this.gamePlayModal.hide(); });

        this.soundEffect.btnAudio.addEventListener('click', () => { this.soundEffect.controlAudio(); });
    }

    initializeBoard(hole) {

        if (!this.pegSelected) {
            if (this.audio.classList.contains('bi-volume-up')) {
                this.soundEffect.holeSelectionAudio();
            }
            //event listener button reset game
            const btnResetGame = document.querySelector('#btnResetGame');
            btnResetGame.addEventListener('click', () => this.resetGame(`${hole}`));
            this.displayPegs(hole);
        }

        this.pegSelected = true;
    }

    resetGame(firstHole) {
        //console.log('reset game ' + firstHole);

        //stopwatch
        this.remainderSeconds = 0;
        this.formattedTime;
        this.seconds = 0;
        this.minutes = 0;
        this.interval;

        //gameflow
        this.pegsMovement = [];
        this.movePossible = 0;
        this.pegSelected = false;
        this.firstMove = true;
        this.wrongMoves = 0;
        this.pegCount = 14;

        this.updatePegsLeft();
        this.stopStopwatch();
        this.removeAllPegs();

        this.stopwatch.textContent = '00:00';

        this.initializeBoard(firstHole);
    }

    removeAllPegs() {
        //console.log('remove all pegs');
        const allHoles = document.querySelectorAll('.peg-hole');
        allHoles.forEach((hole) => {
            //clear classes
            hole.classList.remove('possibility', 'empty');

            //delete peg if exist
            const peg = hole.firstElementChild;
            if (peg) {
                hole.removeChild(peg);
            }

            //clone and replace peg-hole to remove event listeners
            const clone = hole.cloneNode(true);
            hole.parentNode.replaceChild(clone, hole);
        });
    }

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

    checkPegMove(id) {

        //disable peg movement if player have to first choose from multiple movement options
        const arePossibilities = document.querySelectorAll('.possibility');
        if (arePossibilities.length > 0) {
            return;
        }

        //console.log('peg ' + id);
        //get the hole container id where the peg is currently located
        const holeId = document.querySelector(`#peg${id}`).parentNode.dataset.id;
        //console.log('hole ' + holeId);
        if (this.firstMove) {
            this.startStopwatch();
        }

        //get the list of moves possible for the peg selected
        const moveOptions = PEG_GAMEPLAY.find((Obj) => Obj.id === holeId).moveOptions;
        for (let move of moveOptions) {
            const holeFrom = document.querySelector(`div[data-id='${holeId}'`);
            const holeReceiver = document.querySelector(`div[data-id='${move.move}'`);
            const holeAdjacent = document.querySelector(`div[data-id='${move.remove}'`);
            //console.log(holeFrom, holeReceiver, holeAdjacent);
            //if adjacent hole is not empty and receiving hole empty, move is possible
            if (holeReceiver.classList.contains('empty') && !holeAdjacent.classList.contains('empty')) {
                this.pegsMovement.push([holeFrom, holeReceiver, holeAdjacent]);
                this.movePossible++;
            }
        }

        //console.log('move possible ' + this.movePossible);
        //activate sound effect if no move possible
        if (!this.movePossible) {
            if (this.audio.classList.contains('bi-volume-up')) {
                this.soundEffect.notPossibleAudio();
            }

            //show gameplay modal with user selected wrong moves 2 times in a row
            if (this.wrongMoves === 2) {
                const gamePlayModal = new bootstrap.Modal(document.querySelector('#gameplayModal'));
                const btnLetsGo = document.querySelector('#btnLetsGo');
                btnLetsGo.addEventListener('click', () => { gamePlayModal.hide(); });
                gamePlayModal.show();
                //reset count
                this.wrongMoves = 0;
            } else {
                this.wrongMoves++;
            }
        }

        if (this.movePossible > 1) { //multiple moves possible
            //console.log('multiple');
            if (this.audio.classList.contains('bi-volume-up')) {
                this.soundEffect.multipleChoicesAudio();
            }

            //console.log(this.pegsMovement);
            for (let move of this.pegsMovement) {
                //console.log(move[0]);
                const [pegFromContainer, pegToContainer, pegRemoveContainer] = move;
                //console.log(pegFromContainer, pegToContainer, pegRemoveContainer);
                const possibility = move.find((node) => node.classList.contains('empty'));
                //highlight hole as possible move
                possibility.classList.add('possibility');
                //add even listener to hole where the player can move the peg to
                possibility.addEventListener('click', () => { this.receivePeg(pegFromContainer, pegToContainer, pegRemoveContainer); });
            }

        } else if (this.movePossible === 1) { //only one move possible
            //console.log(this.pegsMovement[0]);
            const [pegFromContainer, pegToContainer, pegRemoveContainer] = this.pegsMovement[0];
            //console.log(pegFromContainer, pegToContainer, pegRemoveContainer);
            //highlight possible move before moving the peg
            pegToContainer.classList.add('possibility');
            this.receivePeg(pegFromContainer, pegToContainer, pegRemoveContainer);
        }

        //RESET
        this.firstMove = false;
        this.pegsMovement = [];
    }

    receivePeg(pegFromContainer, pegToContainer, pegRemoveContainer) {
        //block event listener if hole selected is empty
        if (pegFromContainer.classList.contains('empty')) {
            return;
        }

        //console.log('receiving peg');
        //console.log(pegFromContainer, pegToContainer, pegRemoveContainer);

        setTimeout(() => {
            //console.dir(pegToContainer);
            //move peg
            this.movePeg(pegToContainer, pegFromContainer);

            //remove adjacent peg
            this.removePeg(pegRemoveContainer);
        }, 300);

        //check if moves are possible
        setTimeout(() => {
            this.movePossible = 0;
            if (this.isGameOver()) {
                this.gameOver();
            };
        }, 500);
    }

    movePeg(pegToContainer, pegFromContainer) {
        pegToContainer.appendChild(pegFromContainer.firstElementChild);
        if (this.audio.classList.contains('bi-volume-up')) {
            this.soundEffect.movePegAudio();
        }

        pegFromContainer.classList.add('empty');
        pegToContainer.classList.remove('empty');

        //clear all posibilities
        const possibilities = document.querySelectorAll('.possibility');
        possibilities.forEach((el) => el.classList.remove('possibility'));
    }

    removePeg(hole) {
        //console.log('remove peg');
        //remove peg
        hole.removeChild(hole.firstElementChild);
        //declare hole empty
        hole.classList.add('empty');
        this.pegCount--;
        this.updatePegsLeft();
    }

    updatePegsLeft() {
        const pegsLeftCounter = document.querySelector("#pegsLeftCounter");
        pegsLeftCounter.textContent = this.pegCount;
    }

    isGameOver() {

        //get all hole with pegs
        const pegLefts = document.querySelectorAll('.peg-hole:not(.empty)');
        //console.dir(pegLefts);

        for (let hole of pegLefts) {
            //get the list of moves possible for the peg selected
            const moveOptions = PEG_GAMEPLAY.find((Obj) => Obj.id === hole.dataset.id).moveOptions;
            for (let move of moveOptions) {
                const holeReceiver = document.querySelector(`div[data-id='${move.move}`);
                const holeAdjacent = document.querySelector(`div[data-id='${move.remove}`);

                //if adjacent hole is not empty and receiving hole empty, move is possible
                if (holeReceiver.classList.contains('empty') && !holeAdjacent.classList.contains('empty')) {
                    this.movePossible++;
                }
            }
        }

        //no more move possible
        if (this.movePossible === 0) {
            return true;
        } else {
            this.movePossible = 0;
            return false
        }
    }

    gameOver() {
        this.stopStopwatch();
        this.completeGameModal();
    }

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

        //even listener
        btnPlayAgain.addEventListener('click', () => { document.location.reload(); });

        if (minutes > 0) {

            timeMsg = `${minutes} minutes and ${seconds} seconds`;

        } else {

            timeMsg = `${seconds} seconds`;

        }

        modalTime.textContent = timeMsg;

        //define message to display based on the number of pegs left
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

        setTimeout(() => {
            if (this.audio.classList.contains('bi-volume-up')) {
                this.soundEffect.endGameAudio();
            }
            gameCompleteModal.show();
        }, 500);
    }

    startStopwatch() {
        this.interval = setInterval(() => {
            this.seconds++;
            this.minutes = Math.floor(this.seconds / 60);
            this.remainderSeconds = this.seconds % 60;
            this.formattedTime = `${this.minutes.toString().padStart(2, '0')}:${this.remainderSeconds.toString().padStart(2, '0')}`;
            this.stopwatch.textContent = this.formattedTime;
        }, 1000);
    }

    stopStopwatch() {
        clearInterval(this.interval);
    }
}