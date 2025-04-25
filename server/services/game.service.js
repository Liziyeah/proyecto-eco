class GameService {
    constructor() {
      this.games = {};
    }
  
    createGame() {
      const gameId = generateId();
      this.games[gameId] = {
        players: [],
        song: null,
        scores: {},
        status: 'waiting'
      };
      return gameId;
    }
  
    addPlayer(gameId, playerId, username) {
      // Lógica para añadir jugador
    }
  
    startGame(gameId, song) {
      // Iniciar juego
    }
  }