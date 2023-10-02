//GLOBAL VARIABLES
const PEG_HOLE = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15'];
const MOVE_OPTIONS = [['3','10'], [], [], [], [], [], [], [], [], ['1', '3', '12', '15'], [], ['3', '5', '10', '15'], [], [], []];
const PEG_TO_REMOVE = [['2','6'], [], [], [], [], [], [], [], [], ['6', '7', '11', '13'], [], ['8', '9', '11', '14'], [], [], []];

let EVENTS_ARR = [];
let EVENTS_PEG_HOLE_ARR = [];

//1 = 0; 2 = 1 index
let FUNCTION_DROP;
let FUNCTION_DRAG_OVER;
let FROM_HOLE_NUMBER = 0;
let TO_HOLE_NUMBER = 0;
let MOVES_ALLOWED = [];

function initializeBoard() {
    
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
    console.log(MOVES_ALLOWED);
/*
    for(move of movesAllowed) {
       const pegToMove = document.querySelector(`#pegHole${pegHole[move]} > img`);
       console.log(`#pegHole${pegHole[move]}`);
       functionDrag = (event) => drag(event);
       pegToMove.addEventListener('dragstart', functionDrag);
       eventsArr = []; //empty array from previous info
       eventsArr.push(`#pegHole${pegHole[move]}`, 0, 0, functionDrag);
       eventListenerpegHoleArr.push(eventsArr);
    }*/

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
    event.dataTransfer.setData("text", draggedPeg);
   
}

function drop(event) {

    event.preventDefault();

    const moveAlowedIdx = PEG_HOLE.findIndex((element) => element === FROM_HOLE_NUMBER[0]);
    //console.log(moveAlowedIdx);

    const moveAlowed = MOVES_ALLOWED.findIndex((element) => element === moveAlowedIdx);
    //console.log(moveAlowed);

    //check if move is allowed
    if(moveAlowed >= 0) {

        var data = event.dataTransfer.getData("text");
        //get the number of the hole in which the peg is dropped
        const toHole = event.target.id;
        //extract the number part pegHole15 returns 15
        TO_HOLE_NUMBER = toHole.match(/(\d+)/);
        event.target.appendChild(document.getElementById(data));
        //call function to remove the peg jumped over

        //remove peg jumped over
        removePeg(FROM_HOLE_NUMBER[0],TO_HOLE_NUMBER[0]);

    } else {

       alert('Move not allowed!');

    }

}

function removePeg(FROM_HOLE_NUMBER,TO_HOLE_NUMBER) {
    
    console.log(`from ${FROM_HOLE_NUMBER} to ${TO_HOLE_NUMBER}`);
    
    //locate array index for hole where peg was dragged from
    const foundIdxFrom = PEG_HOLE.findIndex((element) => element === FROM_HOLE_NUMBER);
    //locate array index for hole where peg was dropped in based on where it was dragged from
    const foundIdxFromTo = MOVE_OPTIONS[foundIdxFrom].findIndex((element) => element === TO_HOLE_NUMBER);

    //locate array index of hole where peg need to be remove
    const foundPegToRemove = PEG_TO_REMOVE[foundIdxFrom][foundIdxFromTo];
    
    console.log('remove '+ foundPegToRemove);

    //remove peg from hole
    const pegHoleContainer = document.querySelector(`#pegHole${foundPegToRemove}`);
    const pegToRemove = pegHoleContainer.firstChild;
    pegHoleContainer.removeChild(pegToRemove);

    //declare hole empty
    pegHoleContainer.classList.add('empty');
    document.querySelector(`#pegHole${FROM_HOLE_NUMBER}`).classList.add('empty');

    //remove class empty to hole receiving peg
    document.querySelector(`#pegHole${TO_HOLE_NUMBER}`).classList.remove('empty');

    //reinitialize board events
    reinitializeBoard();

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
    console.log(emptyHoles);
    


}

initializeBoard();