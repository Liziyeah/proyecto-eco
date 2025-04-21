const { Server } = require("socket.io");

let io;
let activeGames = new Map(); // Almacena los juegos activos
let players = new Map(); // Almacena la información de los jugadores

const initSocketInstance = (httpServer) => {
  io = new Server(httpServer, {
    path: "/real-time",
    cors: {
      origin: "*",
    },
  });

  io.on("connection", (socket) => {
    console.log("Cliente conectado: " + socket.id);

    // Registrar un jugador
    socket.on("register-player", (data) => {
      const { username } = data;
      players.set(socket.id, { 
        id: socket.id, 
        username, 
        score: 0,
        gameId: null
      });
      console.log(`Jugador registrado: ${username} (${socket.id})`);
    });

    // Selección de canción
    socket.on("select-song", (data) => {
      const { songId, mode, difficulty } = data;
      const player = players.get(socket.id);
      
      if (player) {
        let gameId;
        
        if (mode === "1vs1") {
          // Buscar juego esperando segundo jugador
          for (const [id, game] of activeGames.entries()) {
            if (game.mode === "1vs1" && game.players.length === 1 && game.status === "waiting") {
              gameId = id;
              break;
            }
          }
          
          // Si no hay juego, crear uno nuevo
          if (!gameId) {
            gameId = generateGameId();
            activeGames.set(gameId, {
              id: gameId,
              songId,
              difficulty,
              mode: "1vs1",
              players: [socket.id],
              status: "waiting"
            });
            socket.join(gameId);
            io.to(socket.id).emit("waiting-opponent");
          } else {
            // Unirse al juego existente
            const game = activeGames.get(gameId);
            game.players.push(socket.id);
            game.status = "ready";
            socket.join(gameId);
            
            // Notificar a todos los jugadores que el juego está listo
            io.to(gameId).emit("game-ready", { 
              gameId, 
              songId, 
              difficulty,
              players: game.players.map(id => players.get(id).username)
            });
            
            // Iniciar el juego después de 3 segundos
            setTimeout(() => {
              io.to(gameId).emit("start-game");
            }, 3000);
          }
        } else {
          // Modo single player
          gameId = generateGameId();
          activeGames.set(gameId, {
            id: gameId,
            songId,
            difficulty,
            mode: "single",
            players: [socket.id],
            status: "ready"
          });
          socket.join(gameId);
          
          // Notificar que el juego está listo
          io.to(gameId).emit("game-ready", { 
            gameId, 
            songId, 
            difficulty
          });
          
          // Iniciar el juego después de 3 segundos
          setTimeout(() => {
            io.to(gameId).emit("start-game");
          }, 3000);
        }
        
        // Actualizar el gameId del jugador
        player.gameId = gameId;
      }
    });

    // Registrar puntuación por nota
    socket.on("note-hit", (data) => {
      const { accuracy } = data;
      const player = players.get(socket.id);
      
      if (player && player.gameId) {
        // Calcular puntos según precisión
        let points = 0;
        if (accuracy === "perfect") points = 100;
        else if (accuracy === "good") points = 50;
        else if (accuracy === "ok") points = 25;
        
        // Actualizar puntuación
        player.score += points;
        
        // Emitir actualización de puntuación
        const game = activeGames.get(player.gameId);
        if (game) {
          io.to(player.gameId).emit("score-update", {
            playerId: socket.id,
            username: player.username,
            score: player.score,
            noteHit: accuracy
          });
        }
      }
    });

    // Fin de la canción
    socket.on("song-finished", () => {
      const player = players.get(socket.id);
      
      if (player && player.gameId) {
        const game = activeGames.get(player.gameId);
        
        if (game) {
          // Marcar al jugador como terminado
          player.finished = true;
          
          // Verificar si todos los jugadores han terminado
          const allFinished = game.players.every(playerId => 
            players.get(playerId)?.finished
          );
          
          if (allFinished) {
            // Preparar resultados
            const results = game.players.map(playerId => {
              const p = players.get(playerId);
              return {
                id: playerId,
                username: p.username,
                score: p.score
              };
            }).sort((a, b) => b.score - a.score);
            
            // Emitir resultados
            io.to(player.gameId).emit("game-results", results);
            
            // Limpiar juego
            setTimeout(() => {
              activeGames.delete(player.gameId);
              // Restablecer estado de los jugadores
              game.players.forEach(playerId => {
                const p = players.get(playerId);
                if (p) {
                  p.gameId = null;
                  p.score = 0;
                  p.finished = false;
                }
              });
            }, 10000);
          }
        }
      }
    });

    // Guardar correo para premio
    socket.on("save-email", (data) => {
      const { email } = data;
      const player = players.get(socket.id);
      
      if (player) {
        player.email = email;
        io.to(socket.id).emit("email-saved", { 
          message: "¡Correo registrado con éxito! Pronto recibirás información sobre el premio."
        });
        console.log(`Correo guardado para ${player.username}: ${email}`);
      }
    });

    // Desconexión
    socket.on("disconnect", () => {
      const player = players.get(socket.id);
      
      if (player && player.gameId) {
        const game = activeGames.get(player.gameId);
        if (game) {
          // Notificar a otros jugadores
          socket.to(player.gameId).emit("player-disconnected", {
            username: player.username
          });
          
          // Remover jugador del juego
          game.players = game.players.filter(id => id !== socket.id);
          
          // Si no quedan jugadores, eliminar el juego
          if (game.players.length === 0) {
            activeGames.delete(player.gameId);
          }
        }
      }
      
      // Eliminar jugador
      players.delete(socket.id);
      console.log("Cliente desconectado: " + socket.id);
    });
  });
};

// Función para emitir eventos desde el servidor
const emitEvent = (eventName, data, room = null) => {
  if (!io) {
    throw new Error("Socket.io instance is not initialized");
  }
  
  if (room) {
    io.to(room).emit(eventName, data);
  } else {
    io.emit(eventName, data);
  }
};

// Generar ID de juego
function generateGameId() {
  return Math.random().toString(36).substring(2, 9);
}

module.exports = {
  emitEvent,
  initSocketInstance,
  getActiveGames: () => activeGames,
  getPlayers: () => players
};