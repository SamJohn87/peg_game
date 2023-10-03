//GLOBAL VARIABLES
const PEG_HOLE = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15'];
const MOVE_OPTIONS = [['3','10'], ['4', '11'], ['1', '5', '10', '12'], ['2', '11'], ['3', '12'], ['8', '13'], ['9', '14'], ['6', '13'], ['7', '14'], ['1', '3', '12', '15'], ['2', '4'], ['3', '5', '10', '15'], ['6', '8'], ['7', '9'], ['10', '12']];
const PEG_TO_REMOVE = [['2','6'], ['3', '7'], ['2', '4', '7', '8'], ['3', '8'], ['4', '9'], ['7', '10'], ['8', '11'], ['7', '11'], ['8', '12'], ['6', '7', '11', '13'], ['7', '8'], ['8', '9', '11', '14'], ['10', '11'], ['11', '12'], ['13', '14']];

let EVENTS_ARR = [];
let EVENTS_PEG_HOLE_ARR = [];

//1 = 0; 2 = 1 index
let FUNCTION_DROP;
let FUNCTION_DRAG_OVER;
let FROM_HOLE_NUMBER = 0;
let TO_HOLE_NUMBER = 0;
let MOVES_ALLOWED = []; //keeps track of how many moves are possible

const WRONG_MOVE_MODAL = new bootstrap.Modal(document.querySelector('#wrongMoveModal'));
const GAME_COMPLETE_MODAL = new bootstrap.Modal(document.querySelector('#gameCompletedModal'));
const GAMEPLAY_MODAL = new bootstrap.Modal(document.querySelector('#gamePlayModal'));
const BTN_START_GAME = document.querySelector('#btnStartGame');
const STOPWATCH = document.querySelector('.stopwatch');
const BTN_PLAY = document.querySelector('#linkGameplay');
const BTN_RESET_GAME = document.querySelector('#btnResetGame');
const BTN_PLAY_AGAIN = document.querySelector('#btnPlayAgain');
let FIRST_MOVE = true; //will be use to start the stopwatch after the first move
let SECONDS = 0;
let INTERVAL;
let PEGS_LEFT; //number of pegs on the board
let FIRST_PEG_HOLE = '15';

// Show the gameplay modal when the page is loaded
document.addEventListener("DOMContentLoaded", function () {
    GAMEPLAY_MODAL.show();
});

//btn eventlisteners
BTN_PLAY.addEventListener('click', showGameplay);
const INIT_FUNCTION = () => initializeBoard(FIRST_PEG_HOLE);
BTN_START_GAME.addEventListener('click', INIT_FUNCTION);
BTN_RESET_GAME.addEventListener('click', INIT_FUNCTION);
BTN_PLAY_AGAIN.addEventListener('click', INIT_FUNCTION);



function initializeBoard(firstPegHole) {

    GAMEPLAY_MODAL.hide();
    GAME_COMPLETE_MODAL.hide();
    //console.log(firstPegHole);

    //remove all pegs
    removeAllPegs();

    //reset
    MOVES_ALLOWED = []; 
    EVENTS_PEG_HOLE_ARR = [];
    FIRST_MOVE = true;
    PEGS_LEFT = 14;
    updatePegsLeft();
    clearInterval(INTERVAL);
    STOPWATCH.textContent = "00:00";
    SECONDS = 0

    //display pegs in empty peg holes except the one selected
    createPegImgs(firstPegHole);

    //use array MOVE_OPTIONS to determine moves allowed based on empty holes
    for(let i = 0; i < MOVE_OPTIONS.length; i++) {

        const found = MOVE_OPTIONS[i].find((element) => element === firstPegHole);

        if(found > 0){

            MOVES_ALLOWED.push(i);

        }
    }

    //console.log(MOVES_ALLOWED);

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
            pegImg.draggable = true;
            pegImg.alt = "peg";

            // Append the image to the div
            pegContainer.appendChild(pegImg);
            //console.log(`peg ${i} created`);

            pegImg.addEventListener('dragstart', (event) => dragStart(event));

        } else {

            //add event listener to empty hole selected
            //console.log(pegContainer);
            FUNCTION_DROP = (event) => drop(event);
            FUNCTION_DRAG_OVER = (event) => dragOver(event);
            pegContainer.addEventListener('drop', FUNCTION_DROP);
            pegContainer.addEventListener('dragover', FUNCTION_DRAG_OVER);
            pegContainer.classList.add('empty'); //identify hole as empty
            EVENTS_ARR.push(`#pegHole${firstPegHole}`, FUNCTION_DROP, FUNCTION_DRAG_OVER);
            EVENTS_PEG_HOLE_ARR.push(EVENTS_ARR);
            EVENTS_ARR = [];

        }

    }

    //console.log(EVENTS_ARR);
    //console.log(`first ${EVENTS_PEG_HOLE_ARR}`);

}

function dragOver(event) {

    event.preventDefault();

}

function dragStart(event) {

    const draggedPeg = event.target.id;
    //get the number of the hole from which the peg was taken
    const draggedPegHole = document.querySelector(`#${draggedPeg}`).parentNode.id;
    //extract the number part pegHole15 returns 15
    FROM_HOLE_NUMBER = draggedPegHole.match(/(\d+)/);
    event.dataTransfer.setData("text/plain", draggedPeg);
   
}

function drop(event) {

    event.preventDefault();
    let alertMessage = false;
    
    if(FIRST_MOVE) {

        //start stopwatch
        startStopwatch();
        FIRST_MOVE = false;

    }

    //console.log('move array ' + MOVES_ALLOWED);
    //console.log('from hole number ' + FROM_HOLE_NUMBER[0]);

    const moveAlowedIdx = PEG_HOLE.findIndex((element) => element === FROM_HOLE_NUMBER[0]);
    //console.log('moveallowedidx ' + moveAlowedIdx);

    const moveFound = MOVES_ALLOWED.findIndex((element) => element === moveAlowedIdx);
    //console.log('move allowed ' + moveAlowed);

    //check if move is allowed
    if(moveFound >= 0) {

        //console.log(MOVE_OPTIONS[moveAlowedIdx]);

        const data = event.dataTransfer.getData("text/plain");
        //get the number of the hole in which the peg is dropped
        const toHole = event.target.id;
        //extract the number part pegHole15 returns 15
        TO_HOLE_NUMBER = toHole.match(/(\d+)/);

        const moveAllowed = MOVE_OPTIONS[moveAlowedIdx].findIndex((element) => element === TO_HOLE_NUMBER[0]);
        //console.log('TO_HOLE_NUMBER ' + TO_HOLE_NUMBER[0]);
        //console.log('moveAllowed ' + moveAllowed);

        if(moveAllowed >= 0) {

            //console.log('test' + data);
            event.target.appendChild(document.getElementById(data));
            //call function to remove peg jumped over
            removePeg(FROM_HOLE_NUMBER[0],TO_HOLE_NUMBER[0]);

        } else {

            alertMessage = true;

        }

    } else {

        alertMessage = true;

    }

    if(alertMessage) {

        WRONG_MOVE_MODAL.show();

    }

}

function removePeg(FROM_HOLE_NUMBER,TO_HOLE_NUMBER) {
    
    //console.log(`to ${TO_HOLE_NUMBER}`);
    
    //locate array index for hole where peg was dragged from
    const foundIdxFrom = PEG_HOLE.findIndex((element) => element === FROM_HOLE_NUMBER);
    //locate array index for hole where peg was dropped in based on where it was dragged from
    const foundIdxFromTo = MOVE_OPTIONS[foundIdxFrom].findIndex((element) => element === TO_HOLE_NUMBER);

    //locate array index of hole where peg need to be remove
    const foundPegToRemove = PEG_TO_REMOVE[foundIdxFrom][foundIdxFromTo];
    
    //console.log('remove '+ foundPegToRemove);

    //remove peg from hole
    const pegHoleContainer = document.querySelector(`#pegHole${foundPegToRemove}`);
    const pegToRemove = pegHoleContainer.firstChild;
    pegHoleContainer.removeChild(pegToRemove);

    //declare hole empty
    pegHoleContainer.classList.add('empty');
    document.querySelector(`#pegHole${FROM_HOLE_NUMBER}`).classList.add('empty');

    //remove class empty to hole receiving peg
    document.querySelector(`#pegHole${TO_HOLE_NUMBER}`).classList.remove('empty');

    //update pegs counter
    PEGS_LEFT--;
    updatePegsLeft();

    //reinitialize board events
    reinitializeBoard();


}

function reinitializeBoard() {
    
    //remove events from peg holes
    for(let pegHoleEvent of EVENTS_PEG_HOLE_ARR) {
        
        const pegContainer = document.querySelector(pegHoleEvent[0]);
        pegContainer.removeEventListener('drop', pegHoleEvent[1]);
        pegContainer.removeEventListener('dragover', pegHoleEvent[2]);
        
    }

    //empty global event listener arrays
    EVENTS_PEG_HOLE_ARR = [];
    EVENTS_ARR = [];
    MOVES_ALLOWED = [];

    //locate empty pegh holes
    const emptyHoles = document.querySelectorAll('.empty');
    setMoveAllowed(emptyHoles);
    //console.log(EVENTS_PEG_HOLE_ARR);

}

function setMoveAllowed(emptyHoles) {

    for(let hole of emptyHoles) {
        
        //add ondrop and ondragover events to empty peg holes
        FUNCTION_DROP = (event) => drop(event);
        FUNCTION_DRAG_OVER = (event) => dragOver(event);
        hole.addEventListener('drop', FUNCTION_DROP);
        hole.addEventListener('dragover', FUNCTION_DRAG_OVER);
        //save event definition for later removal
        EVENTS_ARR.push(`#${hole.id}`, FUNCTION_DROP, FUNCTION_DRAG_OVER);
        EVENTS_PEG_HOLE_ARR.push(EVENTS_ARR);
        EVENTS_ARR = []

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

        modalPegsLeft.textContent = `${PEGS_LEFT} pegs left.`;
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
    
    GAME_COMPLETE_MODAL.show();
}

function showGameplay() {

    //display close button
    const btnCloseGameplay = document.querySelector('#btnCloseGameplay');
    btnCloseGameplay.classList.remove('d-none');
    //hide start button 
    BTN_START_GAME.classList.add('d-none');
    GAMEPLAY_MODAL.show();

}

function removeAllPegs() {

    for(let i = 1; i <= 15; i++) {

        const pegContainer = document.querySelector(`#pegHole${i}`);
        pegContainer.classList.remove('empty');
        nodeChild = pegContainer.firstChild;

        if(nodeChild) {

            pegContainer.removeChild(nodeChild);

        }

    }

     //remove events from peg holes
     for(let pegHoleEvent of EVENTS_PEG_HOLE_ARR) {
        
        const pegContainer = document.querySelector(pegHoleEvent[0]);
        pegContainer.removeEventListener('drop', pegHoleEvent[1]);
        pegContainer.removeEventListener('dragover', pegHoleEvent[2]);
        
    }

}