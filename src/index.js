require('dotenv').config();
const { Client, GatewayIntentBits, AttachmentBuilder, EmbedBuilder } = require('discord.js');
const { handlePokemonComecar } = require('./commands/pokemoncomecar');
const { handleRank } = require('./commands/rank');
const axios = require('axios');
const { awardPoints } = require('./data/scores');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const rounds = new Map();
const timers = new Map();

function clearTimers(channelId) {
  const t = timers.get(channelId);
  if (t) {
    clearTimeout(t.firstHint);
    clearTimeout(t.secondHint);
    clearTimeout(t.timeout);
    timers.delete(channelId);
  }
}

function setupTimers(channel, round) {
  const channelId = channel.id;
  const t = {};
  t.firstHint = setTimeout(() => {
    if (!round.isActive) return;
    const letter = round.pokemonName[0].toUpperCase();
    channel.send(`Dica: a primeira letra do nome é **${letter}**.`);
  }, 60000);

  t.secondHint = setTimeout(() => {
    if (!round.isActive) return;
    channel.send(`Dica: o nome tem **${round.pokemonName.length}** letras.`);
  }, 95000);

  t.timeout = setTimeout(async () => {
    if (!round.isActive) return;
    round.isActive = false;

    let spriteBuffer;
    try {
      const res = await axios.get(round.spriteUrl, { responseType: 'arraybuffer' });
      spriteBuffer = Buffer.from(res.data);
    } catch {
      spriteBuffer = null;
    }

    const files = [];
    if (spriteBuffer) {
      const attachment = new AttachmentBuilder(spriteBuffer, { name: 'pokemon.png' });
      files.push(attachment);
    }

    const embed = new EmbedBuilder()
      .setTitle('⏰ Tempo esgotado!')
      .setDescription(`O Pokémon era **${round.pokemonName}**!`)
      .setImage(spriteBuffer ? 'attachment://pokemon.png' : null)
      .setColor(0xed4245);

    await channel.send({ embeds: [embed], files });
    rounds.delete(channelId);
    clearTimers(channelId);
  }, 120000);

  timers.set(channelId, t);
}

client.once('ready', () => {
  console.log(`Bot logado como ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  const content = message.content.trim();

  if (content.startsWith('!pokemonstart')) {
    await handlePokemonComecar(message, rounds);
    if (rounds.has(message.channelId)) {
      setupTimers(message.channel, rounds.get(message.channelId));
    }
    return;
  }

  if (content.startsWith('!pokemonranking')) {
    return handleRank(message);
  }

  const round = rounds.get(message.channelId);
  if (!round || !round.isActive) return;

  const guess = content
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

  const correctName = round.pokemonName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

  if (guess === correctName) {
    round.registerGuess();
    round.isActive = false;

    let spriteBuffer;
    try {
      const res = await axios.get(round.spriteUrl, { responseType: 'arraybuffer' });
      spriteBuffer = Buffer.from(res.data);
    } catch {
      spriteBuffer = null;
    }

    const files = [];
    if (spriteBuffer) {
      const attachment = new AttachmentBuilder(spriteBuffer, { name: 'pokemon.png' });
      files.push(attachment);
    }

    const reward = await awardPoints(
      message.guild.id,
      message.author.id,
      message.author.username,
    );

    const embed = new EmbedBuilder()
      .setTitle('⭐ Acertou!')
      .setDescription(
        `Parabéns, ${message.author}! O Pokémon era **${round.pokemonName}**!\n\n` +
        `+**1** ponto! Total: **${reward.totalHits}** acerto(s)`
      )
      .setImage(spriteBuffer ? 'attachment://pokemon.png' : null)
      .setColor(0x57f287);

    await message.channel.send({ embeds: [embed], files });
    clearTimers(message.channelId);
    rounds.delete(message.channelId);
    return;
  }

  round.registerGuess();

  if (round.isMaxAttemptsReached()) {
    round.isActive = false;

    let spriteBuffer;
    try {
      const res = await axios.get(round.spriteUrl, { responseType: 'arraybuffer' });
      spriteBuffer = Buffer.from(res.data);
    } catch {
      spriteBuffer = null;
    }

    const files = [];
    if (spriteBuffer) {
      const attachment = new AttachmentBuilder(spriteBuffer, { name: 'pokemon.png' });
      files.push(attachment);
    }

    const embed = new EmbedBuilder()
      .setTitle('😢 Ninguém acertou!')
      .setDescription(`O Pokémon era **${round.pokemonName}**!`)
      .setImage(spriteBuffer ? 'attachment://pokemon.png' : null)
      .setColor(0xed4245);

    await message.channel.send({ embeds: [embed], files });
    clearTimers(message.channelId);
    rounds.delete(message.channelId);
  }
});

client.login(process.env.DISCORD_TOKEN);
