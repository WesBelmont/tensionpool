const { SlashCommandBuilder } = require('@discordjs/builders');
const Roll = require('roll');

const roll = new Roll()

module.exports = {
    data: new SlashCommandBuilder()
        .setName('roll-pool')
        .setDescription('Roll the dice in the pool.'),
    async execute(interaction, Pools) {
        const pool = await Pools.findOne({ where: { userid: interaction.user.id, guildid: interaction.guildId } })
        const tensionroll = roll.roll(`${pool.count}d6`).rolled
        if (tensionroll.find(el => el == 1)) {
            //roll a complication
            const complication = roll.roll('1d8+1d12').result;
            interaction.reply({ content: `Complication #${complication} (1d8+1d12)`, ephemeral: true });
            interaction.channel.send(`\`[${tensionroll}]\` What was that!?`);
        }
        //no complication
        else interaction.reply(`\`[${tensionroll}]\`Hmmm.. I guess it was nothing.`);
        interaction.channel.send(':game_die:'.repeat(pool.count));
    },
};