const { EmbedBuilder } = require('discord.js');
const { loadScores } = require('../data/scores');

async function handleRank(message) {
  const scores = loadScores();
  const guildScores = scores[message.guild.id];

  if (!guildScores || Object.keys(guildScores).length === 0) {
    return message.reply('Nenhum jogador no ranking ainda. Use !pokemonstart para começar!');
  }

  const sorted = Object.entries(guildScores)
    .map(([userId, data]) => ({ userId, ...data }))
    .sort((a, b) => {
      if (b.totalHits !== a.totalHits) return b.totalHits - a.totalHits;
      return a.username.localeCompare(b.username);
    })
    .slice(0, 10);

  const lines = sorted.map((entry, i) => {
    return `**${i + 1}.** <@${entry.userId}> — ${entry.totalHits} acerto(s)`;
  });

  const embed = new EmbedBuilder()
    .setTitle('🏆 Ranking — WhosThatBot')
    .setDescription(lines.join('\n'))
    .setColor(0xf1c40f);

  await message.channel.send({ embeds: [embed] });
}

module.exports = { handleRank };
