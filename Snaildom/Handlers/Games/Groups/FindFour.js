'use strict';

const Group = require('./Group');

class FindFour extends Group {
  constructor(opts, game) {
    super({...opts, maxClients: 2}, game);

    this.registerEvents();
  }

  onUpdate(data, client) {
    const {action} = data;

    switch(action) {
      case 'ready':
        if(this.clients.length >= 2)
          this.start();
      break;
      case 'place':
        if(this.started && !client.spectator) {
          const {row} = data;
          const playerId = this.clients.indexOf(client) + 1; // Player's id in the lobby

          if(playerId == this.turn) {
            this.placeChip(row);

            if(!this.checkWin()) {
              this.turn = this.turn == 2 ? 1 : 2;
              this.update('place', {
                row: row
              }, client);
            }
          }
        }
    }
  }

  placeChip(row) {
    this.lastRow = row;

    const turn = this.turn;
    const rowIndex = row - 1;

    for(var i in this.board) {
      var rowArr = this.board[i];

      if(rowArr[rowIndex] == 0) {
        this.board[i][rowIndex] = turn;

        break;
      }
    }
  }

  checkWin() {
    const win = winner => {
      this.win(winner);

      return true;
    };
    const vWinner = this.vertical();

    if(vWinner)
      return win(vWinner);

    const hWinner = this.horizontal();

    if(hWinner)
      return win(hWinner);

    const dWinner = this.diagonal();

    if(dWinner)
      return win(dWinner);
  }

  column(column) {
    var currentPlayer = this.clients[this.turn - 1];
    var currentPlayerId = this.turn;

    var streak = 0;

    for(var i in this.board) {
      const row = this.board[i];

      if(row[column] == currentPlayerId) {
        ++streak;

        if(streak >= 4)
          return currentPlayer;
      } else
        streak = 0;
    }

    return false;
  }

  vertical() {
    var rows = this.board.length;

    for(var column = 0; column < rows; column++) {
      var result = this.column(column);

      if(result !== false)
        return result;
    }

    return false;
  }

  horizontal() {
    var rows = this.board.length;

    var currentPlayer = this.clients[this.turn - 1];
    var currentPlayerId = this.turn;

    var streak = 0;

    for(var row = 0; row < rows; row++) {
      var columns = this.board[row].length;

      for(var column = 0; column < columns; column++) {
        if(this.board[row][column] === currentPlayerId) {
          ++streak;

          if(streak === 4)
            return currentPlayer;
        } else
          streak = 0;
      }
    }

    return false;
  }

  diagonal() {
    var currentPlayer = this.clients[this.turn - 1];
    var currentPlayerId = this.turn;

    var rows = this.board.length;
    var streak = 0;

    for(var row = 0; row < rows; row++) {
      var columns = this.board[row].length;

      for(var column = 0; column < columns; column++) {
        if(this.board[row][column] === currentPlayerId) {
          if(this.board[row + 1] && this.board[row + 1][column + 1] === currentPlayerId &&
             this.board[row + 2] && this.board[row + 2][column + 2] === currentPlayerId &&
             this.board[row + 3] && this.board[row + 3][column + 3] === currentPlayerId) {
            return currentPlayer;
          }

          if(this.board[row - 1] && this.board[row - 1][column - 1] === currentPlayerId &&
             this.board[row - 2] && this.board[row - 2][column - 2] === currentPlayerId &&
             this.board[row - 3] && this.board[row - 3][column - 3] === currentPlayerId) {
            return currentPlayer;
          }

          if(this.board[row - 1] && this.board[row - 1][column + 1] === currentPlayerId &&
             this.board[row - 2] && this.board[row - 2][column + 2] === currentPlayerId &&
             this.board[row - 3] && this.board[row - 3][column + 3] === currentPlayerId) {
            return currentPlayer;
          }
        }
      }
    }

    return false;
  }

  win(client) {
    const winnerIndex = this.clients.indexOf(client) + 1;

    this.update('win', {
      turn: winnerIndex,
      row: this.lastRow
    });
    this.reset();

    // TODO (VERY IMPORTANT): Fix the fucking last piece being added by the loser on the winner's screen. Sounds like a client issue but I can't fucking decompile the stupid game. There's got to be a way.
    // TODO #2: This hasn't been thorougly tested and tracked yet but I'm certain the winning algorithm is flawed and broken. Should reiterate over this in the future.
    
    for(var i in this.clients) {
      const sclient = this.clients[i];

      if(!sclient.spectator && sclient != client) {
        if(sclient.ip == client.ip)
          return;

        sclient.addGold(5);
        break;
      }
    }

    client.addGold(10);
  }

  start() {
    this.reset();

    this.started = true;
    this.turn = 1;

    this.update('begin', {turn: this.turn});
  }

  reset() {
    this.board = [
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    ];
    this.started = false;
    this.lastRow = null;
  }

  registerEvents() {
    this.addEvent(this, 'update', this.onUpdate.bind(this));
  }
}

module.exports = FindFour;