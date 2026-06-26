# WhosThatBot

Bot do Discord com minigame **"Quem é esse Pokémon?"** usando a [PokéAPI](https://pokeapi.co).

## Comandos

| Comando | Descrição |
|---------|-----------|
| `!pokemonstart` | Inicia uma rodada no canal |
| `!pokemonranking` | Exibe o ranking do servidor |

## Como jogar

1. Use `!pokemonstart` para começar uma rodada
2. O bot envia a silhueta de um Pokémon aleatório e dicas do tipo
3. Digite o nome do Pokémon no chat (sem `!`) para palpitar
4. Acertando, você ganha **1 ponto**
5. O ranking mostra quem tem mais acertos no servidor

## Dicas

- **60s**: dica da primeira letra
- **95s**: dica da quantidade de letras
- **120s**: tempo total para acertar (se ninguém acertar, o Pokémon é revelado)

## Setup

```bash
npm install
cp .env.example .env
# colocar o token do Discord no .env
npm start
```

Requer **Node.js 18+** e a intent **Message Content** ativada no [Discord Developer Portal](https://discord.com/developers/applications).
# WhosThatBot
