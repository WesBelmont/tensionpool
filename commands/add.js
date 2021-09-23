const { SlashCommandBuilder } = require('@discordjs/builders');
const Roll = require('roll');
// const fetch = require('node-fetch');

const roll = new Roll()

module.exports = {
    data: new SlashCommandBuilder()
        .setName('add')
        .setDescription('Add one dice to the Tension Pool')
        .addNumberOption(option => option.setName('quantity').setDescription('Add X dice to the Tension Pool')),
    async execute(interaction, Pools) {
        //set increment
        const increment = interaction.options.getNumber('quantity') || 1;
        const userid = interaction.user.id;
        const guildid = interaction.guildId;

        if (increment > 6) return interaction.reply({ content: 'You cannot add more than six dice at a time.', ephemeral: true });

        // find the pool
        let pool = await Pools.findOne({ where: { userid: userid, guildid: guildid } });

        //set the count
        let count = increment;
        if (pool) count += pool.count;

        //if the pool is not full post the current number
        if (count < 6) {
            interaction.reply({ content: 'Dice added' });
            interaction.channel.send(':game_die:'.repeat(count));
        }
        //otherwise clear the pool
        else {
            count -= 6
            //check for complication
            const tensionroll = roll.roll('6d6').rolled;
            if (tensionroll.find(el => el == 1)) {
                //roll a complication
                const complication = roll.roll('1d8+1d12').result;
                interaction.reply({ content: `Complication #${complication} (1d8+1d12)`, ephemeral: true });
                interaction.channel.send(`\`[${tensionroll}]\` What was that!?`);
            }
            //no complication
            else interaction.reply(`\`[${tensionroll}]\`Hmmm.. I guess it was nothing.`);
            if (count > 0) interaction.channel.send(':game_die:'.repeat(count));
        }
        if (pool) {
            Pools.update({ count: count }, { where: { userid: userid, guildid: guildid } });
        } else {
            Pools.create({ count: count, userid: userid, guildid: guildid });
        }

    },
};