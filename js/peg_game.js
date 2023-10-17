/* MODALS */
const GAME_COMPLETE_MODAL = new bootstrap.Modal(document.querySelector('#gameCompletedModal'));
const OBJECTIVE_MODAL = new bootstrap.Modal(document.querySelector('#objectiveModal'));
const PEG_HOLE_SELECT_MODAL = new bootstrap.Modal(document.querySelector('#pegHoleSelectModal'));
const BTN_PLAY = document.querySelector('#linkGameplay');
const BTN_START_GAME = document.querySelector('#btnStartGame');
const BTN_RESET_GAME = document.querySelector('#btnResetGame');
const BTN_PLAY_AGAIN = document.querySelector('#btnPlayAgain');
const BTN_GOT_IT = document.querySelector('#btnGotIt');
const BTN_AUDIO = document.querySelector('#audioControl');
const AUDIO_CONTAINER = document.querySelector('#audioControl');
const IMG_AUDIO = AUDIO_CONTAINER.firstElementChild;
//btn eventlisteners
BTN_PLAY.addEventListener('click', showGameplay);
BTN_GOT_IT.addEventListener('click', selectHole);
BTN_START_GAME.addEventListener('click', startGame);
BTN_AUDIO.addEventListener('click', controlAudio);
/*********/

document.addEventListener("DOMContentLoaded", getReady);

function getReady() {
    OBJECTIVE_MODAL.show();
}

function showGameplay() {
    GAMEPLAY_MODAL.show();
}


function selectHole() {
    PEG_HOLE_SELECT_MODAL.hide();
}


function startGame() {
    OBJECTIVE_MODAL.hide();
    PEG_HOLE_SELECT_MODAL.show();

    let game = new GameBoard();
    game.selectFirstHole();
}



/*
//btn eventlisteners
BTN_PLAY.addEventListener('click', showGameplay);
BTN_GOT_IT.addEventListener('click', selectHole);
BTN_START_GAME.addEventListener('click', startGame);
BTN_LETS_GO.addEventListener('click', closeGameplayModal);
BTN_AUDIO.addEventListener('click', controlAudio);

function startGame() {

    OBJECTIVE_MODAL.hide();
    PEG_HOLE_SELECT_MODAL.show();

    //add event listener on every hole of the board to select the starting hole
    for(let i = 1; i <= 15; i++) {

        const pegContainer = document.querySelector(`#pegHole${i}`);
        const function_start = () => initializeBoard(`${i}`);
        pegContainer.addEventListener('click', function_start);
        FUNCTION_START.push(function_start); //index 0 is for hole1

    }

}

function selectHole() {

    PEG_HOLE_SELECT_MODAL.hide();

}

function closeGameplayModal() {

    GAMEPLAY_MODAL.hide();

}


function initializeBoard(firstPegHole) {

    //console.log(FIRST_MOVE);

    if (FIRST_MOVE) {

        if(IMG_AUDIO.classList.contains('bi-volume-up')) {
            soundEffect.holeSelectionAudio();
        }
        
        GAMEPLAY_MODAL.show();
        const INIT_FUNCTION = () => initializeBoard(firstPegHole);
        BTN_RESET_GAME.addEventListener('click', INIT_FUNCTION);
        BTN_PLAY_AGAIN.addEventListener('click', INIT_FUNCTION);

    }

    //reset
    MOVES_ALLOWED = []; 
    EVENTS_PEG_HOLE_ARR = [];
    FIRST_MOVE = true;
    PEGS_LEFT = 14;
    updatePegsLeft();
    clearInterval(INTERVAL);
    STOPWATCH.textContent = "00:00";
    SECONDS = 0

    GAME_COMPLETE_MODAL.hide();
    
    //console.log(firstPegHole); 

    //remove all pegs
    removeAllPegs();
    

    //display pegs in empty peg holes except the one selected
    createPegImgs(firstPegHole);

    //use array MOVE_OPTIONS to determine moves allowed based on empty holes
    for(let i = 0; i < MOVE_OPTIONS.length; i++) {

        const found = MOVE_OPTIONS[i].find((element) => element === firstPegHole);

        if(found > 0){

            MOVES_ALLOWED.push(i);
            //add event listener on pegs which can be moved
            const pegToMove = document.querySelector(`#pegHole${i+1}`).firstElementChild;
            pegToMove.classList.add('moveable'); //add class which will change peg size to indicate peg can be moved
            FUNCTION_PEG = () => movePeg(i);
            pegToMove.addEventListener('click', FUNCTION_PEG);
            EVENTS_ARR.push(`#pegHole${i+1}`, FUNCTION_PEG);
            EVENTS_PEG_HOLE_ARR.push(EVENTS_ARR);
            EVENTS_ARR =[];
        }
    }

    //console.log(MOVES_ALLOWED);
    //console.log(EVENTS_PEG_HOLE_ARR);

}

function createPegImgs(firstPegHole) {

    //add peg in every hole except the one selected to start empty
    for(let i = 1; i <= 15; i++) {

        const pegContainer = document.querySelector(`#pegHole${i}`);
        //console.log(pegContainer);
        
        if(i != Number(firstPegHole)) {

            let pegImg = document.createElement("img");
            pegImg.src = "images/peg.png";
            pegImg.id = `peg${i}`;
            //pegImg.draggable = true;
            pegImg.alt = "peg";
            pegImg.classList.add('peg');

            // Append the image to the div
            pegContainer.appendChild(pegImg);
            //console.log(`peg ${i} created`);

        } else {

            pegContainer.classList.add('empty'); //identify hole as empty

        }

    }

    //console.log(EVENTS_ARR);
    //console.log(`first ${EVENTS_PEG_HOLE_ARR}`);

}

function movePeg(pegHoleIdx) {
    
    //console.log('move the peg please');

    const allPossibilities = document.querySelectorAll('.possibility');
    allPossibilities.forEach((element) => element.classList.remove('possibility'));  

    const allselected = document.querySelectorAll('.selected');
    allselected.forEach((element) => element.classList.remove('selected'));

    if(FIRST_MOVE) {
        startStopwatch();
        FIRST_MOVE = false;
    }
        
    const moves = MOVE_OPTIONS[pegHoleIdx];
    const pegHole = pegHoleIdx+1;
    let possibility = [];

    //check how many moves are possible
    for(let i = 0; i < moves.length; i++) {

        //console.log('other factor ' + PEG_TO_REMOVE[pegHoleIdx]);
        //console.log(document.querySelector(`#pegHole${moves[i]}`).classList.contains('empty') + ' ' + moves[i]);
        if(document.querySelector(`#pegHole${moves[i]}`).classList.contains('empty') && !document.querySelector(`#pegHole${PEG_TO_REMOVE[pegHoleIdx][i]}`).classList.contains('empty')) {

            possibility.push(moves[i]);

        }

    }

    //console.log(possibility);
    //console.log(EVENTS_PEG_HOLE_ARR[0]);

    const pegFromContainer = document.querySelector(`#pegHole${pegHole}`);
    const pegToMove = pegFromContainer.firstElementChild;

    if(possibility.length === 1) { //only one move possible, so just move the peg and remove the adjacent peg

        //console.log('first element ' + pegToMove.id);
        const pegToContainer = document.querySelector(`#pegHole${possibility[0]}`);

        //remove event listener before moving peg
        for(let event_f of EVENTS_PEG_HOLE_ARR) {
           
            if(event_f[0] === `#${pegFromContainer.id}`) {
                
                pegToMove.removeEventListener('click', event_f[1]);
                //pegToMove.classList.remove('moveable');

            }

        }
        
        //move peg
        const pegHoleReceiver = document.querySelector(`#pegHole${possibility[0]}`);
        pegHoleReceiver.classList.add('possibility');
        setTimeout(() => {
            pegToContainer.appendChild(pegToMove);
            if(IMG_AUDIO.classList.contains('bi-volume-up')) {
                soundEffect.movePegAudio();
            }
            //remove adjacent peg
            removePeg(`${pegHole}`,`${possibility[0]}`);
            pegHoleReceiver.classList.remove('possibility');
        }, 300);
        

        

    } else { //more than one move possible

        //keep peg to move evident to user
        pegToMove.classList.add('selected');
        if(IMG_AUDIO.classList.contains('bi-volume-up')) {
            soundEffect.multipleChoicesAudio();
        }

        //change background of empty hole
        //console.log('possibilities ' + possibility.length);
        for(let i = 0; i < possibility.length; i++) {
            
            const pegHoleReceiver = document.querySelector(`#pegHole${possibility[i]}`);
            pegHoleReceiver.classList.add('possibility');

            //add event listener
            //console.log(pegHole + ' ' + possibility[i]);
            FUNCTION_RECEIVE_PEG = () => receivePeg(`${pegHole}`, `${possibility[i]}`);
            pegHoleReceiver.addEventListener('click', FUNCTION_RECEIVE_PEG);
            EVENTS_ARR.push(`#pegHole${possibility[i]}`, FUNCTION_RECEIVE_PEG);
            EVENTS_PEG_HOLE_ARR.push(EVENTS_ARR);
            EVENTS_ARR = [];

        }

    }

}

function receivePeg(fromPegHole, toPegHole) {

    //console.log(fromPegHole, toPegHole);

    const pegFromContainer = document.querySelector(`#pegHole${fromPegHole}`);
    const pegToMove = pegFromContainer.firstElementChild;
    const pegToContainer = document.querySelector(`#pegHole${toPegHole}`);

    //remove event listener before moving peg
    for(let event_f of EVENTS_PEG_HOLE_ARR) {
        
        if(event_f[0] === `#${pegFromContainer.id}`) {
            
            pegToMove.removeEventListener('click', event_f[1]);
            //pegToMove.classList.remove('moveable');

        }

    }
    
    //move peg
    setTimeout(() => {
        pegToContainer.appendChild(pegToMove);
        if(IMG_AUDIO.classList.contains('bi-volume-up')) {
            soundEffect.movePegAudio();
        }
        //remove adjacent peg
        removePeg(`${fromPegHole}`,`${toPegHole}`);
    }, 300);
    

    

}

function removePeg(from_hole_number,to_hole_number) {
    
    //console.log(`from ${from_hole_number}`);
    //console.log(`to ${to_hole_number}`);
    //console.log(PEG_HOLE);
    
    
    //locate array index for hole where peg was dragged from
    const foundIdxFrom = PEG_HOLE.findIndex((element) => element === from_hole_number);
    //console.log(foundIdxFrom);
    //locate array index for hole where peg was dropped in based on where it was dragged from
    const foundIdxTo = MOVE_OPTIONS[foundIdxFrom].findIndex((element) => element === to_hole_number);

    //locate array index of hole where peg need to be remove
    const foundPegToRemove = PEG_TO_REMOVE[foundIdxFrom][foundIdxTo];
    
    //console.log('remove '+ foundPegToRemove);

    //remove peg from hole
    const pegHoleContainer = document.querySelector(`#pegHole${foundPegToRemove}`);
    const pegToRemove = pegHoleContainer.firstChild;
    //console.log(' container '+ pegHoleContainer.id);
    pegHoleContainer.removeChild(pegToRemove);

    //declare hole empty
    pegHoleContainer.classList.add('empty');
    document.querySelector(`#pegHole${from_hole_number}`).classList.add('empty');

    //remove class empty to hole receiving peg
    document.querySelector(`#pegHole${to_hole_number}`).classList.remove('empty');

    //update pegs counter
    PEGS_LEFT--;
    updatePegsLeft();

    //reinitialize board events
    reinitializeBoard();

}

function reinitializeBoard() {

    //console.log('reinitialize board');
    //console.log(EVENTS_PEG_HOLE_ARR);
    
    //remove events from peg holes
    for(let pegHoleEvent of EVENTS_PEG_HOLE_ARR) {

        //console.log(pegHoleEvent[0]);
        //console.log(pegHoleEvent[1]);
        const pegToChange = document.querySelector(pegHoleEvent[0]).firstElementChild;

        if(pegToChange) {

            pegToChange.removeEventListener('click', pegHoleEvent[1]);
            document.querySelector(pegHoleEvent[0]).removeEventListener('click', pegHoleEvent[1]);

        }

        //remove event listener if hole was once one of many possibilities
        document.querySelector(pegHoleEvent[0]).removeEventListener('click', pegHoleEvent[1]);
        
    }

    //remove classes from pegs and holes to reset game board mid-game
    const allMoveable = document.querySelectorAll('.moveable');
    allMoveable.forEach((element) => element.classList.remove('moveable'));

    const allPossibilities = document.querySelectorAll('.possibility');
    allPossibilities.forEach((element) => element.classList.remove('possibility'));  

    const allselected = document.querySelectorAll('.selected');
    allselected.forEach((element) => element.classList.remove('selected'));  

    //empty global event listener arrays
    EVENTS_PEG_HOLE_ARR = [];
    MOVES_ALLOWED = [];

    //locate empty pegh holes
    const emptyHoles = document.querySelectorAll('.empty');
    //console.log(emptyHoles);
    setMoveAllowed(emptyHoles);


}

function setMoveAllowed(emptyHoles) {

    for(let hole of emptyHoles) {

        //set allowed moves based on empty peg holes 
        const pegHoleNumber = hole.id.match(/(\d+)/);
        //console.log('number ' + pegHoleNumber[0]);

        for(let i = 0; i < MOVE_OPTIONS.length; i++) {

            const findMoveIdx = MOVE_OPTIONS[i].findIndex((element) => element === pegHoleNumber[0]);

            if(findMoveIdx >= 0){

                //console.log('test ' + PEG_TO_REMOVE[i][findMoveIdx]);
                //check if removal peg is present
                const isEmpty = document.querySelector(`#pegHole${PEG_TO_REMOVE[i][findMoveIdx]}`).classList.contains('empty');
                const isEmptyAdjacent = document.querySelector(`#pegHole${i+1}`).classList.contains('empty');
                //console.log(`index ${i}.${findMoveIdx} for #pegHole${PEG_TO_REMOVE[i][findMoveIdx]} is empty ${isEmpty}`);

                if(!isEmpty && !isEmptyAdjacent) {

                    MOVES_ALLOWED.push(i);

                    //add event listener on pegs which can be moved
                    const pegToMove = document.querySelector(`#pegHole${i+1}`).firstElementChild;

                    //do not add another event listener if event is already attached to peg
                    if(!pegToMove.classList.contains('moveable')) {

                        pegToMove.classList.add('moveable');
                        FUNCTION_PEG = () => movePeg(i);
                        pegToMove.addEventListener('click', FUNCTION_PEG);
                        EVENTS_ARR.push(`#pegHole${i+1}`, FUNCTION_PEG);
                        EVENTS_PEG_HOLE_ARR.push(EVENTS_ARR);
                        EVENTS_ARR =[];

                    }

                }

            }
        }  

    }

    //console.log('moves ' + MOVES_ALLOWED.length);

    if(MOVES_ALLOWED.length === 0) {
        gameOver();
    }
    //console.log(EVENTS_PEG_HOLE_ARR);

}

// Start the stopwatch
function startStopwatch() {

    INTERVAL = setInterval(() => {
        SECONDS++;
        const minutes = Math.floor(SECONDS / 60);
        const remainderSeconds = SECONDS % 60;
        const formattedTime = `${minutes.toString().padStart(2, '0')}:${remainderSeconds.toString().padStart(2, '0')}`;
        STOPWATCH.textContent = formattedTime;
    }, 1000);

}

// Function to update the attempts counter
function updatePegsLeft() {
    const pegsLeftCounter = document.getElementById("pegsLeftCounter");
    pegsLeftCounter.textContent = PEGS_LEFT;
}

function gameOver() {

    //stop stopwatch and show end of game modal
    clearInterval(INTERVAL);
    showGameCompletedModal();
    
}

// Function to show the game completion modal
function showGameCompletedModal() {

    const modalTime = document.querySelector("#modalTime");
    const modalPegsLeft = document.querySelector("#pegsLeft");
    const modalSkillMessage = document.querySelector("#skillMessage");
    const modalSkillMsgDesc = document.querySelector("#skillMessageDescription");

    let inputTime = STOPWATCH.textContent.split(':');
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
    if(PEGS_LEFT >= 5) {

        modalPegsLeft.textContent = `${PEGS_LEFT} pegs left`;
        modalSkillMessage.innerHTML = `Your level is: <b>Peg Solitaire Beginner</b>`;
        modalSkillMsgDesc.innerHTML = 'Beginners have a basic understanding of the game but still have room for improvement in terms of strategy.';

    } else if(PEGS_LEFT > 2) {

        modalPegsLeft.textContent = `${PEGS_LEFT} pegs left`;
        modalSkillMessage.innerHTML = `Your level is: <b>Peg Solitaire Intermediate</b>`;
        modalSkillMsgDesc.innerHTML = 'Intermediate players have developed some proficiency and can solve the puzzle with relatively few pegs remaining.';

    } else if(PEGS_LEFT === 2) {

        modalPegsLeft.textContent = `${PEGS_LEFT} pegs left`;
        modalSkillMessage.innerHTML = `Your level is: <b>Peg Solitaire Advanced</b>`;
        modalSkillMsgDesc.innerHTML = 'Advanced players are skilled and can solve the puzzle with just two pegs left, demonstrating a good grasp of the game\'s strategy.';

    } else {

        modalPegsLeft.textContent = `${PEGS_LEFT} peg left`;
        modalSkillMessage.innerHTML = `Your level is: <b>Peg Solitaire Expert</b>`;
        modalSkillMsgDesc.innerHTML = 'Experts are highly skilled players who consistently solve the puzzle with one peg remaining, showcasing a deep understanding of Peg Solitaire strategy.';

    }
    
    setTimeout(() => {
        if(IMG_AUDIO.classList.contains('bi-volume-up')) {
            soundEffect.endGameAudio();
        }
        GAME_COMPLETE_MODAL.show();
    }, 500);
    
}

function showGameplay() {

    GAMEPLAY_MODAL.show();

}

function removeAllPegs() {

    for(let i = 1; i <= 15; i++) {

        const pegContainer = document.querySelector(`#pegHole${i}`);
        //remove all classes attached to peg
        pegContainer.classList.remove('empty');
        pegContainer.classList.remove('selected');
        pegContainer.classList.remove('possibility');
        nodeElementChild = pegContainer.firstElementChild;

        //console.log('ok ' + nodeElementChild);

        if(nodeElementChild) {
            nodeElementChild.classList.remove('moveable');
            pegContainer.removeChild(nodeElementChild);
        }

        //remove click selection event
        pegContainer.removeEventListener('click', FUNCTION_START[i-1])

    }
    //console.log(FUNCTION_START);

}
*/
function controlAudio() {

    if(IMG_AUDIO.classList.contains('bi-volume-up')) {
        IMG_AUDIO.classList.remove('bi-volume-up');
        IMG_AUDIO.classList.add('bi-volume-mute');
    } else {
        IMG_AUDIO.classList.remove('bi-volume-mute');
        IMG_AUDIO.classList.add('bi-volume-up');
    }

}