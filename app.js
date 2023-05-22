const grid = document.getElementById('grid-container');
const btnRandomMap = document.getElementById('btn-random-map');
const btnStartPosition = document.getElementById('btn-start-position');
const btnGoalPosition = document.getElementById('btn-goal-position');
const btnBFS = document.getElementById('btn-bfs');
const btnDFS = document.getElementById('btn-dfs')

let startNode;
let goalNode;
let numRows = 20;
let numCols = 20;
let isRandom = false;
let isStartSelected = false;
let isGoalSelected = false;
let pathFound = false;
let isSearching = true;
let isBFS = false;
let isDFS = false;
let canSearchBFS = false;
let canSearchDFS = false;

function generateGrid() {
    for (row = 0; row < numRows; row++) {
        for (col = 0; col < numCols; col++) {
            const cell = document.createElement('div');
            cell.classList.add('cell')
            cell.id = `cell-${row}-${col}`;
            //Generate a random value and if its less value, create water> Cannot traverse through;
            if (isRandom && Math.random() < 0.2) {
                cell.classList.add('wall')
            }
            grid.appendChild(cell);
        }
    }
}

function regenerate() {
    //Loops through entire original grid and removes each element, and generates a new grid.
    while (grid.firstChild) {
        grid.firstChild.remove();
    }
    //Reset buttons on regenerate
    if (btnStartPosition.disabled) {
        btnStartPosition.disabled = false;
    }
    if (btnGoalPosition.disabled) {
        btnGoalPosition.disabled = false;
    }
    //Clear start/goal node from memory
    startNode = null;
    goalNode = null;
    isBFS = false;
    isDFS = false;
    btnBFS.disabled = false;
    btnDFS.disabled = false;
    generateGrid();
}

function setStartPosition(row, col) {
    let cell = document.getElementById(`cell-${row}-${col}`);
    try {
        if (!cell.classList.contains('wall') && (!cell.classList.contains('goal'))) {
            cell.classList.add('start')
            startNode = { row, col };
            btnStartPosition.disabled = true;
        } else {
            if (cell.classList.contains('wall')) {
                alert('Cannot place starting position in water! Please start on grass!')
            } else {
                if (cell.classList.contains('goal')) {
                    alert('Cannot place starting position on goal node! Please start on grass!')
                }
            }
        }
        console.log('Start position', startNode)
    } catch (err) {
        console.log(err)
    }
}

function setGoalPosition(row, col) {
    let cell = document.getElementById(`cell-${row}-${col}`);
    try {
        if (!cell.classList.contains('wall') && (!cell.classList.contains('start'))) {
            cell.classList.add('goal');
            goalNode = { row, col };
            btnGoalPosition.disabled = true;
        } else {
            alert('Cannot place goal position in water! Please place on grass!')
        }
        console.log('End position', goalNode)
    } catch (err) {
        console.log(err)
    }

}

function isWall(row, col) {
    let cell = document.getElementById(`cell-${row}-${col}`);
    if (cell.classList.contains('wall')) {
        return true;
    }
}

//If is not oob, is valid move.
function isValid(row, col) {
    if ((row >= 0 && row < numRows) && (col >= 0 && col < numCols)) {
        return true;
    }
}

btnRandomMap.addEventListener('click', () => {
    isRandom = true;
    regenerate()
})

//Using these functions to disable button once selected.
btnStartPosition.addEventListener('click', () => {
    isStartSelected = true;
});

btnGoalPosition.addEventListener('click', () => {
    isGoalSelected = true;
})

btnBFS.addEventListener('click', () => {
    isBFS = true;
    graphTraversal(startNode, goalNode);
    btnBFS.disabled = true;
    btnDFS.disabled = true;

})

btnDFS.addEventListener('click', () => {
    isDFS = true;
    graphTraversal(startNode, goalNode);
    btnDFS.disabled = true;
    btnBFS.disabled = true;
})

grid.addEventListener('click', (event) => {
    let cellId = event.target.id;
    console.log('Cellid', cellId);
    const [row, col] = cellId.split('-').slice(1).map(Number);

    if (isStartSelected) {
        setStartPosition(row, col)
    }
    if (isGoalSelected) {
        setGoalPosition(row, col);
    }
    //allows me to only place one start
    isStartSelected = false;
    isGoalSelected = false;

})

function graphTraversal(startNode, goalNode) {
    //Keeps track of already visited nodes.
    let closedList = new Set();
    //Array of nodes not yet visited.
    let openList = [];
    //dictionary to ref parent of node
    let parent = {};

    //Function to enqueue based on various conditions.
    function enqueue(row, col, parentNode) {
        //Create a key for each node enqueued.
        let key = row + '-' + col;
        //If not oob, and does not already exist in closed list.
        if ((isValid(row, col)) && (!closedList.has(key)) && (!isWall(row, col))) {
            openList.push({ row, col });
            closedList.add(key);
            parent[key] = parentNode;
        }
    }

    enqueue(startNode.row, startNode.col, null);
    let openListHistory = [openList.slice()];

    console.log('open first', openList)
    console.log('closed list first', closedList)
    //While there are still nodes to explore.
    while (openList.length > 0) {
        //Pop node from openList and enqueue it's neighbors;
        console.log('open', openList)

        let cell;

        //BFS or DFS
        if (isBFS) {
            cell = openList.shift();
        }
        if (isDFS) {
            cell = openList.pop();
        }
        //let cell = openList.shift();
        let row = cell.row;
        let col = cell.col;

        //Enqueue the neighbors
        enqueue(row, col - 1, { row, col }); //Left
        enqueue(row, col + 1, { row, col }); // Right
        enqueue(row - 1, col, { row, col }); // Up
        enqueue(row + 1, col, { row, col }); //Down

        openListHistory.push(openList.slice());
        //console.log('closed', closedList)
        //If row, col index are equal to goalNode row and col index. We have reached the end node.
        if (row === goalNode.row && col === goalNode.col) {
            pathFound = true;
            console.log('Reached goal node: ', 'row', row, 'col', col);
            break;
        }
    }

    const path = findPath(parent, goalNode);
    console.log('path', path);
    console.log('openListHistory: ', openListHistory)
    console.log('Parent: ', parent)

    highlightOpenList(openListHistory);

    if (pathFound) {
        setTimeout(() => {
            highlightPath(path);
        }, 5000);
    } else {
        alert('no path available!')
    }
}

//Function to construct path back to start node by using parent key.
function findPath(parent, currentNode) {
    const path = [];
    while (currentNode) {
        //Start from goal node, adding each node thereafters parents to path..
        path.push(currentNode);
        currentNode = parent[`${currentNode.row}-${currentNode.col}`]
    }
    path.reverse();
    console.log(path);
    return path;
}

//For each element in path, color each cell with some time delay.
function highlightPath(path) {
    path.forEach((node, index) => {
        const { row, col } = node;
        const cell = document.getElementById(`cell-${row}-${col}`);
        setTimeout(() => {
            cell.classList.remove('openList')
            cell.classList.add('visited');
        }, 100 * index)
    });
}

function highlightOpenList(openListHistory) {
    openListHistory.forEach(function (innerArray, i) {
        innerArray.forEach(function (element, j) {
            // Access each element and perform operations
            const { row, col } = element;
            const cell = document.getElementById(`cell-${row}-${col}`);
            //Color each cell after some time..
            setTimeout(() => {
                cell.classList.add('openList');
            }, 25 * i);
        });
    });
}

generateGrid();

