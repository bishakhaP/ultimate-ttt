const boardContainer = document.querySelector("#board-container");
let cells;
let turnO = true;
let boardWinners = Array(9).fill(null); // Global array to track grid winners


let winning_grid = [
    [0, 1, 2],
    [0, 3, 6],
    [0, 4, 8],
    [1, 4, 7],
    [2, 5, 8],
    [2, 4, 6],
    [3, 4, 5],
    [6, 7, 8],
];

window.onload = function() {
    setGame();
    setupEventListener();
}

let setGame = () => {
        for (let i = 0; i < 9; i++) {
          const largeGrid = document.createElement("div");
          largeGrid.classList.add("large-grid");
          largeGrid.dataset.gridIndex = i; // Track grid index for logic
    
          // Create 9 cells inside each large grid
          for (let j = 0; j < 9; j++) {
            const cell = document.createElement("div");
            cell.classList.add("cell");
            cell.dataset.cellIndex = j; // Track cell index for logic
            largeGrid.appendChild(cell);
          }
    
          boardContainer.appendChild(largeGrid);
        }
    cells = document.querySelectorAll(".cell");
    }

let setupEventListener = () =>{
    cells.forEach((cell) => {
        cell.addEventListener("click", handleCellClick);
        cell.addEventListener("mouseover", hoverstart);
        cell.addEventListener("mouseout", hoverend);
    })
}

let hoverstart = (event) => {
    const cell = event.target;
    cell.classList.add("XorOhovered");
    if(turnO){
        cell.innerText = "O";
    }else{
        cell.innerText = "X";
    }
}

let hoverend = (event) => {
    const cell = event.target;
    cell.classList.remove("XorOhovered");
    cell.innerText = "";
}

let allowedGridIndex = null;

let handleCellClick = (event) => {
    
    const cell = event.target;
    // cellIndex = cell.dataset.cellIndex;
    
    const grid = cell.closest(".large-grid");
    const gridIndex = grid.dataset.gridIndex;
    console.log(gridIndex);
    

    cell.classList.remove("XorOhovered")
    cell.removeEventListener("mouseover", hoverstart);
    cell.removeEventListener("mouseout", hoverend);
    
    if (allowedGridIndex !== null && gridIndex !== allowedGridIndex.toString()) {
            console.log(`You can only play in grid ${allowedGridIndex}`);
            return;
            }

    cell.innerText = turnO ? "O" : "X";
    cell.classList.add("XorO");
    cell.removeEventListener("click", handleCellClick);

    turnO = !turnO;

    const cellIndex = cell.dataset.cellIndex;
    allowedGridIndex = cellIndex;

    checkAllGrids();
    validateNextGrid();
    checkBoardWinner(); // Check for final winner

    const boardWinner = checkBoardWinner();
    if (boardWinner) {
        if (boardWinner === "Draw") {
            console.log("The game is a draw!");
        } else {
            console.log(`The winner is ${boardWinner}`);
        }
        endGame(boardWinner); // Call a function to handle the end of the game
    }

}

const validateNextGrid = () => {
    const allLargeGrids = document.querySelectorAll(".large-grid");
    let gridPlayable = false;

    allLargeGrids.forEach((grid) => {
        grid.classList.remove("highlight-grid"); // Remove highlight first
        if (allowedGridIndex === null || grid.dataset.gridIndex === allowedGridIndex.toString()) {
            const gridCells = grid.querySelectorAll(".cell");
            const isGridFull = Array.from(gridCells).every((cell) => cell.innerText !== "");

            if (!isGridFull) {
                grid.classList.add("highlight-grid"); // Add highlight to playable grids
                grid.classList.remove("disabled-grid");
                gridPlayable = true;
            } else {
                grid.classList.add("disabled-grid");
            }
        } else {
            grid.classList.add("disabled-grid");
        }
    });

    // If no playable grid, reset allowedGridIndex and highlight all
    if (!gridPlayable) {
        allowedGridIndex = null;
        allLargeGrids.forEach((grid) => {
            grid.classList.remove("disabled-grid");
            grid.classList.add("highlight-grid");
        });
    }
};

const highlightAllowedGrid = () => {
    const allLargeGrids = document.querySelectorAll(".large-grid");
    allLargeGrids.forEach((grid) => {
        if (allowedGridIndex === null || grid.dataset.gridIndex === allowedGridIndex.toString()) {
            grid.classList.remove("disabled-grid");
        } else {
            grid.classList.add("disabled-grid");
        }
    });
};


// Function to check win in a single grid

const checkGridWinner = (gridCells) => {
    for (let pattern of winning_grid) {
        const pos1 = gridCells[pattern[0]];
        const pos2 = gridCells[pattern[1]];
        const pos3 = gridCells[pattern[2]];

        if (!pos1 || !pos2 || !pos3) {
            continue; // Skip this pattern if any cell is undefined
        }

        if (pos1.innerText !== "" && pos1.innerText === pos2.innerText && pos2.innerText === pos3.innerText) {
            return pos1.innerText; // Return the winner ("X" or "O")
        }
    }
    return null; // No winner
};



// Check all grids for a win in them

const checkAllGrids = () => {
    const allLargeGrids = document.querySelectorAll(".large-grid");

    allLargeGrids.forEach((grid, index) => {
        const gridCells = grid.querySelectorAll(".cell");
        const winner = checkGridWinner(gridCells); // Check for a winner in the current grid

        if (winner && boardWinners[index] === null) { 
            // Only update if the grid winner hasn't been set yet
            boardWinners[index] = winner; 
            console.log(`Grid ${index} has a winner: ${winner}`);
            markGridWinner(grid, winner); // Mark the grid visually
        }
    });

    console.log("Updated boardWinners:", boardWinners); // Debugging
};



const markGridWinner = (grid, winner) => {
    grid.innerText = winner
    grid.classList.add("disabled-grid"); // Visually disable the grid
    grid.classList.add("disabled-style");
};


const checkBoardWinner = () => {
    console.log("Checking meta board with boardWinners:", boardWinners); // Debugging

    // Check for a winning pattern on the "meta" board
    for (let pattern of winning_grid) {
        const pos1 = boardWinners[pattern[0]];
        const pos2 = boardWinners[pattern[1]];
        const pos3 = boardWinners[pattern[2]];

        console.log(`Checking meta board pattern ${pattern}:`, pos1, pos2, pos3); // Debugging

        if (pos1 && pos1 === pos2 && pos2 === pos3) {
            console.log(`The final winner is ${pos1}`);
            return pos1; // Return the overall winner ("X" or "O")
        }
    }

    // Check for a draw (all grids are decided but no winning pattern)
    const isDraw = boardWinners.every((winner) => winner !== null);
    if (isDraw) {
        console.log("The game is a draw!");
        return "Draw";
    }

    return null; // No winner yet
};


const endGame = (winner) => {
    const allLargeGrids = document.querySelectorAll(".large-grid");
    allLargeGrids.forEach((grid) => {
        grid.classList.add("disabled-grid");
    });

    if (winner === "Draw") {
        alert("It's a draw! Game over.");
    } else {
        boardContainer.innerText = `${winner} wins`;
        boardContainer.classList.add("finalWins");
    }
};