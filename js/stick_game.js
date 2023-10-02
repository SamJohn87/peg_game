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
let MOVES_ALLOWED = [];
let IS_GAME_OVER = false;
let MOVES_POSSIBLE = 0; //keeps track of how many moves are possible
//console.log('javascript connected');

const WRONG_MOVE_MODAL = new bootstrap.Modal(document.querySelector('#wrongMoveModal'));
const GAME_COMPLETE_MODAL = new bootstrap.Modal(document.querySelector('#gameCompletedModal'));
const GAMEPLAY_MODAL = new bootstrap.Modal(document.querySelector('#gamePlayModal'));
let FIRST_MOVE = true; //will be use to start the stopwatch after the first move
const STOPWATCH = document.querySelector('.stopwatch');
let SECONDS = 0;
let INTERVAL;
let PEGS_LEFT = 14; // Initialize the number of pegs on the board

// Show the difficulty selection modal when the page is loaded
document.addEventListener("DOMContentLoaded", function () {
    GAMEPLAY_MODAL.show();
});

function initializeBoard() {

    GAMEPLAY_MODAL.hide();
    
    const pegContainer = document.querySelector('#pegHole15');
    FUNCTION_DROP = (event) => drop(event);
    FUNCTION_DRAG_OVER = (event) => dragOver(event);
    pegContainer.addEventListener('drop', FUNCTION_DROP);
    pegContainer.addEventListener('dragover', FUNCTION_DRAG_OVER);
    pegContainer.classList.add('empty'); //identify hole as empty
    EVENTS_ARR.push('#pegHole15', FUNCTION_DROP, FUNCTION_DRAG_OVER);
    EVENTS_PEG_HOLE_ARR.push(EVENTS_ARR);

    for(let i = 0; i < MOVE_OPTIONS.length; i++) {

        const found = MOVE_OPTIONS[i].find((element) => element === '15');

        if(found > 0){

            MOVES_ALLOWED.push(i);

        }
    }

    //console.log(MOVES_ALLOWED);

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

//for mobile device interaction
/*function touchStart(event) {

    const draggedPeg = event.target.id;
    //get the number of the hole from which the peg was taken
    const draggedPegHole = document.querySelector(`#${draggedPeg}`).parentNode.id;
    //extract the number part pegHole15 returns 15
    FROM_HOLE_NUMBER = draggedPegHole.match(/(\d+)/);
    event.dataTransfer.setData("text/plain", draggedPeg);
   
}*/

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

        const data = event.dataTransfer.getData("text");
        //get the number of the hole in which the peg is dropped
        const toHole = event.target.id;
        //extract the number part pegHole15 returns 15
        TO_HOLE_NUMBER = toHole.match(/(\d+)/);

        const moveAllowed = MOVE_OPTIONS[moveAlowedIdx].findIndex((element) => element === TO_HOLE_NUMBER[0]);
        //console.log('TO_HOLE_NUMBER ' + TO_HOLE_NUMBER[0]);
        //console.log('moveAllowed ' + moveAllowed);

        if(moveAllowed >= 0) {

            //console.log(' ok ');
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

    //check if game is over
    checkGameOver();

}

function reinitializeBoard() {

    //console.log('reinitialize board');
    
    //remove events from peg hole
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

}

function setMoveAllowed(emptyHoles) {

    for(let hole of emptyHoles) {
        
        //add ondrop and ondragover events to empty peg holes
        FUNCTION_DROP = (event) => drop(event);
        FUNCTION_DRAG_OVER = (event) => dragOver(event);
        hole.addEventListener('drop', FUNCTION_DROP);
        hole.addEventListener('dragover', FUNCTION_DRAG_OVER);
        //save event definition for later removal
        EVENTS_ARR = [];
        EVENTS_ARR.push(`#${hole.id}`, FUNCTION_DROP, FUNCTION_DRAG_OVER);
        EVENTS_PEG_HOLE_ARR.push(EVENTS_ARR);

        //set allowed moves based on empty peg holes 
        const pegHoleNumber = hole.id.match(/(\d+)/);
        //console.log('number ' + pegHoleNumber[0]);

        for(let i = 0; i < MOVE_OPTIONS.length; i++) {

            const findMoveIdx = MOVE_OPTIONS[i].findIndex((element) => element === pegHoleNumber[0]);

            if(findMoveIdx >= 0){

                //console.log('test ' + PEG_TO_REMOVE[i][findMoveIdx]);
                //check if removal peg is present
                const isEmpty = document.querySelector(`#pegHole${PEG_TO_REMOVE[i][findMoveIdx]}`).classList.contains('empty');
                //console.log(isEmpty);

                if(!isEmpty) {

                    MOVES_ALLOWED.push(i);

                }

            }
        }     

    }

    //console.log('moves ' + MOVES_ALLOWED);
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

// Reset the game
function resetGame() {

    document.location.reload();

}

// Function to update the attempts counter
function updatePegsLeft() {
    const pegsLeftCounter = document.getElementById("pegsLeftCounter");
    pegsLeftCounter.textContent = PEGS_LEFT;
}

function checkGameOver() {

    //console.log('game is over?');

    //get all remaining pegs
    const pegsleft = document.querySelectorAll('div.peg-hole:not(.empty');
    MOVES_POSSIBLE = 0;
    //console.log('pegsleft length ' + pegsleft.length);
    
    for(let peg of pegsleft) {

        //console.log(peg.id);

        //replica of some part of code from function setMoveAllowed
        /*************************************************************/
        const holeNumber = peg.id.match(/(\d+)/);
        //console.log('number ' + holeNumber[0]);

        for(let i = 0; i < MOVE_OPTIONS.length; i++) {

            const findMoveIdx = MOVE_OPTIONS[i].findIndex((element) => element === holeNumber[0]);

            if(findMoveIdx >= 0){

                //console.log('test ' + PEG_TO_REMOVE[i][findMoveIdx]);
                //check if removal peg is present
                const isEmpty = document.querySelector(`#pegHole${PEG_TO_REMOVE[i][findMoveIdx]}`).classList.contains('empty');
                //console.log(isEmpty);

                if(!isEmpty) {

                    MOVES_POSSIBLE++;
                    //console.log('moves available than what ?');

                } /*else {
                    //console.log('no moves for available for ' + i)
                    console.log('no moves for available for ' + holeNumber[0])
                }*/

            }
        }
         /*************************************************************/

    }

    if(MOVES_POSSIBLE === 0) {

        //console.log('game over');
        clearInterval(INTERVAL);
        showGameCompletedModal();

    }
    
}

// Function to show the game completion modal
function showGameCompletedModal() {
    const modalTime = document.querySelector("#modalTime");
    const modalPegsLeft = document.querySelector("#pegsLeft");
    const modalSkillMessage = document.querySelector("#skillMessage");
    const modalSkillMsgDesc = document.querySelector("#skillMessageDescription");
    modalTime.textContent = STOPWATCH.textContent;

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