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
    //console.log(MOVES_ALLOWED);
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
    let alertMessage = '';

    console.log('move array ' + MOVES_ALLOWED);
    console.log('from hole number ' + FROM_HOLE_NUMBER[0]);

    const moveAlowedIdx = PEG_HOLE.findIndex((element) => element === FROM_HOLE_NUMBER[0]);
    console.log('moveallowedidx ' + moveAlowedIdx);

    const moveFound = MOVES_ALLOWED.findIndex((element) => element === moveAlowedIdx);
    //console.log('move allowed ' + moveAlowed);

    //check if move is allowed
    if(moveFound >= 0) {

        console.log(MOVE_OPTIONS[moveAlowedIdx]);

        const data = event.dataTransfer.getData("text");
        //get the number of the hole in which the peg is dropped
        const toHole = event.target.id;
        //extract the number part pegHole15 returns 15
        TO_HOLE_NUMBER = toHole.match(/(\d+)/);

        const moveAllowed = MOVE_OPTIONS[moveAlowedIdx].findIndex((element) => element === TO_HOLE_NUMBER[0]);
        //console.log('TO_HOLE_NUMBER ' + TO_HOLE_NUMBER[0]);
        console.log('moveAllowed ' + moveAllowed);

        if(moveAllowed >= 0) {

            console.log(' ok ');

            event.target.appendChild(document.getElementById(data));
            //call function to remove peg jumped over
            removePeg(FROM_HOLE_NUMBER[0],TO_HOLE_NUMBER[0]);

        } else {

            alertMessage = 'Move not allowed!';

        }

    } else {

        alertMessage = 'Move not allowed!';

    }

    if(alertMessage) {

        alert(alertMessage);

    }

}

function removePeg(FROM_HOLE_NUMBER,TO_HOLE_NUMBER) {
    
    console.log(`to ${TO_HOLE_NUMBER}`);
    
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
        console.log('number ' + pegHoleNumber[0]);

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

    console.log('moves ' + MOVES_ALLOWED);
    //console.log(EVENTS_PEG_HOLE_ARR);

}

initializeBoard();