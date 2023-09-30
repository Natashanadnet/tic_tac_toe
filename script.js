"use strict";

const gameBoard = (() => {
  const rows = 3;
  const columns = 3;
  const board = [];
  const createBoard = () => {
    for (let i = 0; i < rows; i++) {
      board[i] = [];
      for (let j = 0; j < columns; j++) {
        board[i].push(null);
      }
    }
  };

  const getBoard = () => board;

  const isValid = (positionArray) => {
    if (board[positionArray[0]][positionArray[1]] === null) {
      return true;
    } else false;
  };

  const addToken = (positionArray, player) => {
    if (board[positionArray[0]][positionArray[1]] === null) {
      board[positionArray[0]][positionArray[1]] = player.token;
    }
  };

  const checkboard = (player) => {
    let playerPositions = board.reduce((acc, row, index) => {
      row.forEach((cell, colIndex) => {
        if (cell === player.token) {
          acc.push(colIndex);
        }
      });
      return acc;
    }, []);
    return playerPositions;
  };

  const randomMove = () => {
    let randomNum = Math.floor(Math.random() * 3);
    return randomNum;
  };

  const randomPosition = () => {
    let row = randomMove();
    let column = randomMove();
    while (!isValid([row, column])) {
      row = randomMove();
      column = randomMove();
    }
    return [row, column];
  };

  const checkSpaces = () => {
    let spaces = 0;
    board.forEach((row) => {
      row.forEach((column) => {
        if (column === null) {
          spaces++;
        }
      });
    });
    return spaces;
  };

  const checkVertical = (player) => {
    let playerPositions = checkboard(player);
    let counter = playerPositions.reduce((obj, cell) => {
      if (obj[cell] === undefined) {
        obj[cell] = 1;
      } else {
        obj[cell]++;
      }
      return obj;
    }, {});
    let values = Object.values(counter);
    return values.includes(3);
  };

  const checkHorizontal = (player) => {
    let playerPositions = checkboard(player).join("");
    return playerPositions.includes("012");
  };

  const checkDiagonal = (player) => {
    let diagonal1 = [board[0][0], board[1][1], board[2][2]];
    let diagonal2 = [board[0][2], board[1][1], board[2][0]];
    let count1 = 0;
    let count2 = 0;
    for (let i = 0; i < diagonal1.length; i++) {
      diagonal1[i] === player.token ? count1++ : (count1 += 0);
      diagonal2[i] === player.token ? count2++ : (count1 += 0);
    }
    return count1 === 3 || count2 === 3;
  };

  const checkAllLines = (player) => {
    let diagonal = checkDiagonal(player);
    let vertical = checkVertical(player);
    let horizontal = checkHorizontal(player);
    return diagonal || vertical || horizontal;
  };

  return {
    createBoard,
    getBoard,
    addToken,
    randomPosition,
    isValid,
    checkSpaces,
    checkAllLines,
  };
})();

const player = (username, token, human) => {
  let score = 0;
  const getScore = () => score;
  const setScore = () => {
    score += 1;
  };
  return { username, token, human, getScore, setScore };
};

const game = (() => {
  let player1;
  let player2;

  const createPlayers = () => {
    let name = uiController.getUsername();
    let token = uiController.getUserToken();
    player1 = player(name, token, true);
    token = token === "x" ? "o" : "x";
    player2 = player("Computer", token, false);
    return [player1, player2];
  };

  const checkWinner = () => {
    let player1Pos = gameBoard.checkAllLines(player1);
    let player2Pos = gameBoard.checkAllLines(player2);
    let winner;

    if (player1Pos && player2Pos) {
      player1.setScore();
      player2.setScore();
      winner = "Tie";
    } else if (player1Pos) {
      player1.setScore();
      winner = player1;
    } else if (player2Pos) {
      player2.setScore();
      winner = player2;
    }
    return winner;
  };

  const gameRound = (players, position) => {
    if (gameBoard.isValid(position)) {
      gameBoard.addToken(position, players[0]);
      uiController.updateBoardUi(position, players[0]);
      let winner = checkWinner();
      if (gameBoard.checkSpaces() > 0 && winner === undefined) {
        let compPosition = gameBoard.randomPosition();
        gameBoard.addToken(compPosition, players[1]);
        uiController.updateBoardUi(compPosition, players[1]);
        winner = checkWinner();
      }
      return winner;
    }
  };

  return { createPlayers, checkWinner, gameRound };
})();

const uiController = (() => {
  const form = document.getElementById("start-modal");
  const startBtn = document.querySelector(".start-btn");
  const restartBtn = document.querySelector(".restart-btn");
  const startModal = document.getElementById("modal");
  const iconEmoji = document.querySelector(".icon-emoji");
  const inputPlayerName = document.getElementById("player-name");
  const inputPlayerChar = form.elements["char-input"];
  const scoreSection = document.querySelector(".scores");
  const uiUsername = document.querySelector(".ui-username");
  const uiScores = document.querySelectorAll("[data-scores]");
  const rows = document.querySelectorAll(".row");
  const boardCells = document.querySelectorAll("[data-cell]");
  const winningModal = document.getElementById("winning-modal");
  const closeWinningBtn = document.querySelectorAll("[data-close-winning]");
  const winningText = document.querySelector(".winning-modal-text");
  let playerName;
  let playerToken;

  startBtn.addEventListener("click", () => {
    startModal.showModal();
  });

  const getForm = () => form;

  const formManager = (e) => {
    e.preventDefault();

    playerName =
      inputPlayerName.value === "" ? "Player One" : inputPlayerName.value;
    inputPlayerChar.forEach((option) => {
      if (option.checked) {
        playerToken = option.value;
      }
    });

    iconEmoji.classList.add("hidden");
    scoreSection.classList.remove("hidden");
    startModal.close();
    startBtn.classList.add("hidden");
    uiUsername.textContent = playerName;
  };

  const getUsername = () => {
    return playerName;
  };

  const getUserToken = () => {
    return playerToken;
  };

  const updateScore = (player1, player2) => {
    uiScores.forEach((score, index) => {
      index === 0
        ? (score.textContent = player1.getScore())
        : (score.textContent = player2.getScore());
    });
  };

  const clearBoard = () => {
    boardCells.forEach((cell) => (cell.textContent = ""));
  };

  const removeStyles = () => {
    boardCells.forEach((cell) => {
      cell.classList.remove("x");
      cell.classList.remove("o");
    });
  };

  const getRows = () => rows;

  const updateBoardUi = (positionArray, player) => {
    rows.forEach((row) => {
      if (row.dataset.row === `${positionArray[0]}`) {
        let cell = row.querySelector(`[data-cell="${positionArray[1]}"]`);
        cell.classList.add(`${player.token}`);
        cell.textContent = player.token;
      }
    });
  };

  const getPosition = () => boardCells;

  const showWinningModal = (modalMessage) => {
    winningModal.showModal();
    winningText.textContent = modalMessage;
    closeWinningBtn.forEach((btn) => {
      btn.addEventListener("click", () => {
        winningModal.close();
        uiController.clearBoard();
        uiController.removeStyles();
      });
    });
  };

  restartBtn.addEventListener("click", () => {
    window.location.reload();
  });

  return {
    getForm,
    getUsername,
    getUserToken,
    updateScore,
    clearBoard,
    formManager,
    getRows,
    updateBoardUi,
    getPosition,
    removeStyles,
    showWinningModal,
  };
})();

const start = (() => {
  let players;
  let boardCell;

  gameBoard.createBoard();

  uiController.getForm().addEventListener("submit", (e) => {
    uiController.formManager(e);
    players = game.createPlayers();

    boardCell = uiController.getPosition();
    boardCell.forEach((cell) =>
      cell.addEventListener("click", (e) => {
        let cell = +e.target.dataset.cell;
        let row = +e.target.parentElement.dataset.row;
        let winner = game.gameRound(players, [row, cell]);

        console.log(winner);

        if (winner !== undefined || gameBoard.checkSpaces() === 0) {
          let modalMessage;
          if (winner !== undefined) {
            modalMessage =
              winner !== "Tie" ? `${winner.username} wins!` : "It's a tie!";
          } else if (winner === undefined) {
            modalMessage = "Nobody wins!";
          }

          console.log(modalMessage);
          uiController.showWinningModal(modalMessage);
          uiController.updateScore(...players);
          gameBoard.createBoard();
        }
      })
    );
  });
})();
