class AudioController {
    constructor() {
        this.holeSelection = new Audio('audio/hole_selection.mp3');
        this.move = new Audio('audio/peg_moving.mp3');
        this.multipleChoices = new Audio('audio/multiple_choices.mp3');
        this.endGame = new Audio('audio/end_game.mp3');
        this.notPossible = new Audio('audio/move_not_possible.mp3');
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
        this.soundEffect = new AudioController();
        this.firstMove = true;
        this.pegSelected = false;
        this.audio = document.querySelector('#audioControl > i');
        this.stopwatch = document.querySelector('.stopwatch');
        this.movePossible = 0;
        this.seconds = 0;
        this.minutes = 0;
        this.remainderSeconds = 0;
        this.formattedTime;
        this.pegsMovement = [];
        this.pegCount = 14;
        this.interval;
    }

    selectFirstHole() { //select first hole to start the game
        const pegHoles = document.querySelectorAll('.peg-hole');
        for(let hole of pegHoles) {
            hole.addEventListener('click', () => this.initializeBoard(`${hole.dataset.id}`));
        }
    }

    initializeBoard(hole) {
        if(!this.pegSelected) {
            if(this.audio.classList.contains('bi-volume-up')) {
                this.soundEffect.holeSelectionAudio();
            }    
            this.displayPegs(hole);
        }            
        this.pegSelected = true;
    }

    displayPegs(holeException) {
        const pegHoles = document.querySelectorAll('.peg-hole');
        for(let hole of pegHoles) {
            if(hole.dataset.id != holeException) {
                let pegImg = document.createElement("img");
                pegImg.src = "images/peg.png";
                pegImg.id = `peg${hole.dataset.id}`;
                pegImg.alt = "peg";
                pegImg.classList.add('peg');
                pegImg.addEventListener('click', () => this.movePeg(hole.dataset.id))
    
                // Append the image to the div
                hole.appendChild(pegImg);
            } else {
                hole.classList.add('empty'); 
            }
        }        
    }

    movePeg(id) {
        //console.log('peg ' + id);
        //get the hole container id where the peg is currently located
        const holeId = document.querySelector(`#peg${id}`).parentNode.dataset.id;
        console.log('hole ' + holeId);
        if(this.firstMove) {
            this.startStopwatch();
        }

        //get the list of moves possible for the peg selected
        const moveOptions = PEG_GAMEPLAY.find((Obj) => Obj.id === holeId).moveOptions;
        for(let move of moveOptions) {
            const holeFrom = document.querySelector(`div[data-id='${holeId}`);
            const holeReceiver = document.querySelector(`div[data-id='${move.move}`);
            const holeAdjacent = document.querySelector(`div[data-id='${move.remove}`);
            //console.log(holeFrom, holeReceiver, holeAdjacent);
            //if adjacent hole is not empty and receiving hole empty, move is possible
            if(holeReceiver.classList.contains('empty') && !holeAdjacent.classList.contains('empty')) { 
                this.pegsMovement.push([holeFrom, holeReceiver, holeAdjacent]);
                this.movePossible++;
            }
        }

        console.log(this.movePossible);
        //activate sound effect if no move possible
        if(!this.movePossible) {
            if(this.audio.classList.contains('bi-volume-up')) {
               this.soundEffect.notPossibleAudio();
            } 
        }
        
        if(this.movePossible > 1) { //multiple moves possible
            console.log('multiple');
        } else if(this.movePossible === 1) { //only one move possible
            console.log(this.pegsMovement[0]);
            const [pegFromContainer, pegToContainer, pegRemoveContainer] = this.pegsMovement[0];
            console.log(pegFromContainer, pegToContainer, pegRemoveContainer);
            pegToContainer.classList.add('possibility'); //highlight move before moving the peg
            setTimeout(() => {
                //move peg
                console.dir(pegToContainer);
                pegToContainer.appendChild(pegFromContainer.firstElementChild);
                if(this.audio.classList.contains('bi-volume-up')) {
                    this.soundEffect.movePegAudio();
                }

                //remove adjacent peg
                this.removePeg(pegRemoveContainer);

                pegFromContainer.classList.add('empty');
                pegToContainer.classList.remove('possibility', 'empty');
            }, 300);

            //check if moves are possible
            setTimeout(() => {
                this.movePossible = 0;
                if(this.isGameOver()) {
                    this.gameOver();
                };
            }, 500);
        }

        //RESET
        this.firstMove = false;
        this.pegsMovement = [];
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
        console.dir(pegLefts);

        for(let hole of pegLefts) {
            //get the list of moves possible for the peg selected
            const moveOptions = PEG_GAMEPLAY.find((Obj) => Obj.id === hole.dataset.id).moveOptions;
            for(let move of moveOptions) {
                //const holeFrom = document.querySelector(`div[data-id='${hole.dataset.id}`);
                const holeReceiver = document.querySelector(`div[data-id='${move.move}`);
                const holeAdjacent = document.querySelector(`div[data-id='${move.remove}`);
                console.dir(holeReceiver);
                console.dir(holeAdjacent);
                //if adjacent hole is not empty and receiving hole empty, move is possible
                if(holeReceiver.classList.contains('empty') && !holeAdjacent.classList.contains('empty')) { 
                    //this.pegsMovement.push([holeFrom, holeReceiver, holeAdjacent]);
                    this.movePossible++;
                }
            }
        }

        //no more move possible
        if(this.movePossible === 0) {
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
        const modalTime = document.querySelector("#modalTime");
        const modalPegsLeft = document.querySelector("#pegsLeft");
        const modalSkillMessage = document.querySelector("#skillMessage");
        const modalSkillMsgDesc = document.querySelector("#skillMessageDescription");

        let inputTime = this.stopwatch.textContent.split(':');
        let minutes = parseInt(inputTime[0]);
        let seconds = parseInt(inputTime[1]);
        let timeMsg = '';

        if(minutes > 0) {

            timeMsg = `${minutes} minutes and ${seconds} seconds`;

        } else {

            timeMsg = `${seconds} seconds`;

        }
    
        modalTime.textContent = timeMsg;

        //define message to display based on the number of pegs left
        if(this.pegCount >= 5) {

            modalPegsLeft.textContent = `${this.pegCount} pegs left`;
            modalSkillMessage.innerHTML = `Your level is: <b>Peg Solitaire Beginner</b>`;
            modalSkillMsgDesc.innerHTML = 'Beginners have a basic understanding of the game but still have room for improvement in terms of strategy.';

        } else if(this.pegCount > 2) {

            modalPegsLeft.textContent = `${this.pegCount} pegs left`;
            modalSkillMessage.innerHTML = `Your level is: <b>Peg Solitaire Intermediate</b>`;
            modalSkillMsgDesc.innerHTML = 'Intermediate players have developed some proficiency and can solve the puzzle with relatively few pegs remaining.';

        } else if(this.pegCount === 2) {

            modalPegsLeft.textContent = `${this.pegCount} pegs left`;
            modalSkillMessage.innerHTML = `Your level is: <b>Peg Solitaire Advanced</b>`;
            modalSkillMsgDesc.innerHTML = 'Advanced players are skilled and can solve the puzzle with just two pegs left, demonstrating a good grasp of the game\'s strategy.';

        } else {

            modalPegsLeft.textContent = `${this.pegCount} peg left`;
            modalSkillMessage.innerHTML = `Your level is: <b>Peg Solitaire Expert</b>`;
            modalSkillMsgDesc.innerHTML = 'Experts are highly skilled players who consistently solve the puzzle with one peg remaining, showcasing a deep understanding of Peg Solitaire strategy.';

        }
        
        setTimeout(() => {
            if(this.audio.classList.contains('bi-volume-up')) {
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