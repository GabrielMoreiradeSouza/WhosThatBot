class Round {
  constructor(channelId) {
    this.channelId = channelId;
    this.pokemonId = null;
    this.pokemonName = '';
    this.types = [];
    this.spriteUrl = '';
    this.attempts = 0;
    this.isActive = false;
    this.winnerId = null;
    this.winnerAttempts = 0;
    this.startedAt = null;
  }

  startRound(pokemonData) {
    this.pokemonId = pokemonData.id;
    this.pokemonName = pokemonData.name;
    this.types = pokemonData.types;
    this.spriteUrl = pokemonData.spriteUrl;
    this.attempts = 0;
    this.isActive = true;
    this.winnerId = null;
    this.winnerAttempts = 0;
    this.startedAt = new Date();
  }

  registerGuess() {
    this.attempts += 1;
    return this.attempts;
  }

  isMaxAttemptsReached() {
    return this.attempts >= 10;
  }

  endRound(winnerId, winnerAttempts) {
    this.isActive = false;
    this.winnerId = winnerId || null;
    this.winnerAttempts = winnerAttempts || 0;
  }
}

module.exports = { Round };
