
const fs = require('fs');
const dotenv = require('dotenv');
const Sequelize = require('sequelize');
const { Client, Intents, Collection } = require('discord.js');

dotenv.config();

const seq = new Sequelize('database', 'user', 'password', {
    host: 'localhost',
    dialect: 'sqlite',
    logging: false,
    storage: 'database.sqlite'
});

const Pools = seq.define('pools', {
    name: { type: Sequelize.STRING, defaultValue: 'Tension Pool', allowNull: false },
    count: { type: Sequelize.INTEGER, defaultValue: 0 },
    active: { type: Sequelize.BOOLEAN, defaultValue: true },
    // formula: { type: Sequelize.INTEGER, defaultValue: 0 },
    userid: Sequelize.INTEGER,
    guildid: Sequelize.INTEGER
});

Pools.sync();

//Init client
const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

client.commands = new Collection();

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.data.name, command);
}

client.once('ready', () => {
    console.log('Ready!');
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const command = client.commands.get(interaction.commandName);

    if (!command) return;

    try {
        await command.execute(interaction, Pools);
    } catch (error) {
        console.error(error);
        return interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
    }
});


//start bot
client.login(process.env.TOKEN)