/*const gamePlay = [
    {"cardHolder1": {
            "moves": { "first": "3", "second": "10"},
            "remove": { "first": "2", "second": "6"}
        }
    },
] ;*/

const dotHolder = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15'];
const moveOptions = [['3','10'], [], [], [], [], [], [], [], [], ['1', '3', '12', '15'], [], ['3', '5', '10', '15'], [], [], []];
const dotRemove = [['2','6'], [], [], [], [], [], [], [], [], ['6', '7', '11', '13'], [], ['8', '9', '11', '14'], [], [], []];

let movesAllowed = [];
let eventListenerDotArr = [];
let eventListenerDotHolderArr = [];


//1 = 0; 2 = 1 index
let functionDrag;
let functionDrop;
let functionAllowDrop;

function startGame() {
    
    functionDrop = (event) => drop(event);
    functionAllowDrop = (event) => allowDrop(event);
    document.querySelector(`#dotHolder15`).addEventListener('drop', functionDrop);
    document.querySelector(`#dotHolder15`).addEventListener('dragover', functionAllowDrop);

    for(let i = 0; i < moveOptions.length; i++) {
        const found = moveOptions[i].find((element) => element === '15');
        if(found > 0){
            movesAllowed.push(i);
        }
    }

    for(move of movesAllowed) {
       const dotToMove = document.querySelector(`#dotHolder${dotHolder[move]} > img`);
       functionAllowDrop = (event) => allowDrop(event);
       document.querySelector(`#dotHolder${dotHolder[move]}`).addEventListener('drop', functionAllowDrop);
       console.log(dotToMove);
       functionDrag = (event) => drag(event);
       dotToMove.setAttribute("draggable", true);
       dotToMove.addEventListener('dragstart', functionDrag);
    }

}

function allowDrop(event) {
    event.preventDefault();
}

function drag(event) {
    event.dataTransfer.setData("text", event.target.id);
}

function drop(event) {
    event.preventDefault();
    var data = event.dataTransfer.getData("text");
    event.target.appendChild(document.getElementById(data));
  }

startGame();