# Snaildom Rewritten
Snaildom Rewritten is a server emulator for DamenSpike/Sauron's Snaildom.

## Features
- Navigation
- Shells
- Singleplayer games
- Adding/Blocking users
## TODO
- Make a TODO list

## Getting Started
**Note:** Snaildom Rewritten is far from complete as I don't have much time or motivation to complete it.

### Prerequisites
- [Node.js](https://nodejs.org)
- [MySQL Server](https://www.mysql.com/)
- Snaildom Media - will be on another repository soon.

### Installation
1. Import the database SQL file to your database.
2. Extract the emulator.
3. Change your database/server configuration in the `config.json` file.
4. Install the NPM modules by running `npm install` in the terminal/console in the same directory as the emulator.
5. Refer to the media repo to setup the client.

### Usage
```
node run.js <server id>
```
**Example:**
```
node run.js 1
```