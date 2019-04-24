'use strict';

const Group = require('./Group');

class FindFour extends Group {
  constructor(opts, game) {
    super({...opts, maxClients: 2}, game);

    this.registerEvents();
  }

  onUpdate(data, client) {
    const {action} = data;
    const clients = this.get('clients');
    const turn = this.get('turn');

    switch(action) {
      case 'ready':
        if(clients.length >= 2)
          this.start();
      break;
      case 'place':
        if(this.get('started') && !client.spectator) {
          const {row} = data;
          const playerId = clients.indexOf(client) + 1; // Player's id in the lobby

          if(playerId == turn) {
            this.placeChip(row);

            if(!this.checkWin()) {
              this.set('turn', turn == 2 ? 1 : 2);
              this.update('place', {
                row
              }, client);
            }
          }
        }
    }
  }

  placeChip(row) {
    this.set('lastRow', row);

    const turn = this.get('turn');
    const rowIndex = row - 1;

    const board = this.get('board');

    for(var i in board) {
      var rowArr = board[i];

      if(rowArr[rowIndex] == 0) {
        board[i][rowIndex] = turn;
        this.set('board', board);

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
    const clients = this.get('clients');
    const turn = this.get('turn');
    const board = this.get('board');

    var currentPlayer = clients[turn - 1];
    var currentPlayerId = turn;

    var streak = 0;

    for(var i in board) {
      const row = board[i];

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
    const board = this.get('board');
    var rows = board.length;

    for(var column = 0; column < rows; column++) {
      var result = this.column(column);

      if(result !== false)
        return result;
    }

    return false;
  }

  horizontal() {
    const board = this.get('board');
    const clients = this.get('clients');
    const turn = this.get('turn');

    var rows = board.length;

    var currentPlayer = clients[turn - 1];
    var currentPlayerId = turn;

    var streak = 0;

    for(var row = 0; row < rows; row++) {
      var columns = board[row].length;

      for(var column = 0; column < columns; column++) {
        if(board[row][column] === currentPlayerId) {
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
    const clients = this.get('clients');
    const board = this.get('board');
    const turn = this.get('turn');

    var currentPlayer = clients[turn - 1];
    var currentPlayerId = turn;

    var rows = board.length;
    var streak = 0;

    for(var row = 0; row < rows; row++) {
      var columns = board[row].length;

      for(var column = 0; column < columns; column++) {
        if(board[row][column] === currentPlayerId) {
          if(board[row + 1] && board[row + 1][column + 1] === currentPlayerId &&
             board[row + 2] && board[row + 2][column + 2] === currentPlayerId &&
             board[row + 3] && board[row + 3][column + 3] === currentPlayerId) {
            return currentPlayer;
          }

          if(board[row - 1] && board[row - 1][column - 1] === currentPlayerId &&
             board[row - 2] && board[row - 2][column - 2] === currentPlayerId &&
             board[row - 3] && board[row - 3][column - 3] === currentPlayerId) {
            return currentPlayer;
          }

          if(board[row - 1] && board[row - 1][column + 1] === currentPlayerId &&
             board[row - 2] && board[row - 2][column + 2] === currentPlayerId &&
             board[row - 3] && board[row - 3][column + 3] === currentPlayerId) {
            return currentPlayer;
          }
        }
      }
    }

    return false;
  }

  win(client) {
    const clients = this.get('clients');
    const winnerIndex = clients.indexOf(client) + 1;

    this.update('win', {
      turn: winnerIndex,
      row: this.get('lastRow')
    });
    this.reset();

    // TODO (VERY IMPORTANT): Fix the fucking last piece being added by the loser on the winner's screen. Sounds like a client issue but I can't fucking decompile the stupid game. There's got to be a way.
    // TODO #2: This hasn't been thorougly tested and tracked yet but I'm certain the winning algorithm is flawed and broken. Should reiterate over this in the future.

    for(var i in clients) {
      const sclient = clients[i];

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

    this.set('started', true);
    this.set('turn', 1);

    this.update('begin', { turn: this.get('turn') });
  }

  reset() {
    this.set('board', [
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    ]);
    this.set('started', false);
    this.set('lastRow', null);
  }

  registerEvents() {
    this.addEvent(this, 'update', this.onUpdate.bind(this));
  }
}

module.exports = FindFour;