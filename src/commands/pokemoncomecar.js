const { AttachmentBuilder, EmbedBuilder } = require('discord.js');
const { fetchRandomPokemon, createSilhouette, typeNames } = require('../game/pokemon');
const { Round } = require('../game/round');

async function handlePokemonComecar(message, rounds) {
  if (rounds.has(message.channelId)) {
    return message.reply('Já existe uma rodada ativa neste canal! Use seus palpites no chat.');
  }

  let pokemon;
  try {
    pokemon = await fetchRandomPokemon();
  } catch (err) {
    console.error('Erro ao buscar Pokémon:', err.message);
    return message.reply('Não foi possível buscar um Pokémon. Tente novamente mais tarde.');
  }

  let silhouette;
  try {
    silhouette = await createSilhouette(pokemon.spriteUrl);
  } catch {
    return message.reply('Não foi possível gerar a silhueta do Pokémon. Tente novamente mais tarde.');
  }

  const typeHint = pokemon.types.length > 1
    ? `Tipo: ${pokemon.types.map(t => typeNames[t] || t).join(' / ')}`
    : `Tipo: ${typeNames[pokemon.types[0]] || pokemon.types[0]}`;

  const round = new Round(message.channelId);
  round.startRound(pokemon);
  rounds.set(message.channelId, round);

  const attachment = new AttachmentBuilder(silhouette, { name: 'silhouette.png' });
  const embed = new EmbedBuilder()
    .setTitle('Quem é esse Pokémon?')
    .setDescription(`${typeHint}\n\n⏱️ Você tem **2 minutos** para acertar!`)
    .setImage('attachment://silhouette.png')
    .setColor(0x2b2d31)
    .setFooter({ text: 'Dica em 60s | Dica em 95s | Acaba em 2min' });

  await message.channel.send({ embeds: [embed], files: [attachment] });
}

module.exports = { handlePokemonComecar };
