# Snaildom Rewritten
Snaildom Rewritten is a server emulator for DamenSpike/Sauron's Snaildom.

## Features
- Navigation
- Shells
- Adding/Blocking users
- Inventory
- Chatting w/ basic commands
- Extensible Plugin System
- Games
- NPCs
- Quests
- Built-in admin panel (experimental)
- Advanced logging through Discord
- Recaptcha verification to prevent bots
## TODO
- Books (functioning but actual books missing)
- Beggar's quest.
- Reloading games & groups.
- Probably something else I'm forgetting about (like some bugfixes).

## Getting Started
**Note:** Snaildom Rewritten is far from complete as I don't have much time or motivation to complete it.

### Prerequisites
- [Node.js](https://nodejs.org)
- [MySQL Server](https://www.mysql.com/)
- [Redis](https://redis.io/)
- [Snaildom Media](https://github.com/pyrodash/snaildom-web)

### Installation
1. Extract the emulator.
2. Rename `config.json.sample` to `config.json` open it and change your database/server configuration. Remove the recaptcha field if you want to disable server-side recaptcha verification. (NOT RECOMMENDED)
3. Setup the emulator by running `npm run setup` in the terminal/console in the same directory as the emulator. This command will install all the dependencies and import the database based on the config you put in the `config.json` file.
4. Refer to the media repo to setup the game.

### Installing the discord logger
1. Create a discord bot through the [Discord Developer Portal](https://discordapp.com/developers/applications).
2. Navigate to `Plugins/Discord` and rename `config.json.sample` to `config.json`.
3. Place your bot token in the `config.json`.


### Usage
```
node run.js <server id>
```
**Example:**
```
node run.js 1
```

**Note:** Make sure Redis is running before turning on the server. The server cannot function without it.

Found a bug? Submit an issue!