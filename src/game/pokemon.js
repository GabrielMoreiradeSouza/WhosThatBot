const axios = require('axios');
const sharp = require('sharp');

const POKEAPI_BASE = 'https://pokeapi.co/api/v2';

async function fetchRandomPokemon() {
  const countRes = await axios.get(`${POKEAPI_BASE}/pokemon?limit=0`);
  const total = countRes.data.count;
  const id = Math.floor(Math.random() * total) + 1;
  const pokemonRes = await axios.get(`${POKEAPI_BASE}/pokemon/${id}`);
  const data = pokemonRes.data;

  return {
    id: data.id,
    name: data.name,
    types: data.types.map(t => t.type.name),
    spriteUrl: data.sprites.other?.['official-artwork']?.front_default
      || data.sprites.front_default,
  };
}

async function createSilhouette(spriteUrl) {
  const res = await axios.get(spriteUrl, { responseType: 'arraybuffer' });
  const buffer = Buffer.from(res.data);
  const metadata = await sharp(buffer).metadata();
  const silhouette = await sharp({
    create: {
      width: metadata.width,
      height: metadata.height,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 1 },
    },
  })
    .composite([{ input: buffer, blend: 'dest-in' }])
    .png()
    .toBuffer();
  return silhouette;
}

const typeNames = {
  normal: 'Normal', fire: 'Fogo', water: 'Água', electric: 'Elétrico',
  grass: 'Grama', ice: 'Gelo', fighting: 'Lutador', poison: 'Venenoso',
  ground: 'Terra', flying: 'Voador', psychic: 'Psíquico', bug: 'Inseto',
  rock: 'Pedra', ghost: 'Fantasma', dragon: 'Dragão', dark: 'Sombrio',
  steel: 'Aço', fairy: 'Fada',
};

module.exports = { fetchRandomPokemon, createSilhouette, typeNames };
