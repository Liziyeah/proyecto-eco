export class SongSelectionScreen {
    constructor(container, socket, roomId, playerId) {
        this.container = container;
        this.socket = socket;
        this.roomId = roomId;
        this.playerId = playerId;
        this.selectedSong = null;
        this.selectedDifficulty = 'Medio'; // Default difficulty
    }

    render() {
        // Get username from localStorage
        const username = localStorage.getItem('username') || 'Usuario';

        // Mock song list - in a real app, you'd fetch this from the server
        const songs = [
            {
                id: 1,
                title: 'Welcome to the Black Parade',
                difficulty: 'Medio',
                image: 'https://upload.wikimedia.org/wikipedia/en/7/72/My_Chemical_Romance_-_Welcome_to_the_Black_Parade_single_cover.jpg',
            },
            {
                id: 2,
                title: 'Helena',
                difficulty: 'Fácil',
                image: 'https://upload.wikimedia.org/wikipedia/en/d/d4/My_Chemical_Romance_-_Helena.png',
            },
            {
                id: 3,
                title: 'Famous Last Words',
                difficulty: 'Difícil',
                image: 'https://upload.wikimedia.org/wikipedia/en/1/19/Famous_Last_Words_single_cover.jpg',
            },
            {
                id: 4,
                title: 'Teenagers',
                difficulty: 'Fácil',
                image: 'https://upload.wikimedia.org/wikipedia/en/2/29/Teenagers_my_chemical_romance.jpg',
            },
            {
                id: 5,
                title: 'I’m Not Okay (I Promise)',
                difficulty: 'Medio',
                image: 'https://upload.wikimedia.org/wikipedia/en/1/16/I%27m_Not_Okay_%28I_Promise%29.jpg',
            },
        ];

        const songList = songs
            .map(
                (song) => `
            <div class="song-item" data-id="${song.id}">
                <img src="${song.image}" alt="${song.title}">
                <div class="song-info">
                    <span class="song-title">${song.title}</span>
                    <span class="song-difficulty">${song.difficulty}</span>
                </div>
            </div>
        `
            )
            .join('');

        this.container.innerHTML = `
            <div class="song-selection-screen">
                <div class="user-card">
                    <img src="https://earth-rider.com/wp-content/uploads/2013/02/icon-rock-n-roll-guitarist.png" alt="user-profile">
                    <span>${username}</span>
                    <div class="player-badge player-${
                        this.playerId || 0
                    }">Jugador ${(this.playerId || 0) + 1}</div>
                </div>
                
                <div class="selected-song">
                    <img id="selected-song-image" src="https://via.placeholder.com/150" alt="Selected song">
                    <h2 id="selected-song-title">Selecciona una canción</h2>
                </div>
                
                <div class="difficulty-selector">
                    <h3>Dificultad</h3>
                    <div class="difficulty-buttons">
                        <button class="difficulty-btn" data-difficulty="Fácil">Fácil</button>
                        <button class="difficulty-btn selected" data-difficulty="Medio">Medio</button>
                        <button class="difficulty-btn" data-difficulty="Difícil">Difícil</button>
                    </div>
                </div>
                
                <button id="ready-button" disabled>Estoy Listo</button>
                
                <div class="song-list">
                    <h3>CANCIONES</h3>
                    <div class="song-items">
                        ${songList}
                    </div>
                </div>
            </div>
        `;

        // Set up event handlers
        this.setupEventHandlers();
    }

    setupEventHandlers() {
        // Song selection
        const songItems = this.container.querySelectorAll('.song-item');
        songItems.forEach((item) => {
            item.addEventListener('click', () => {
                // Remove selected class from all songs
                songItems.forEach((s) => s.classList.remove('selected'));

                // Add selected class to this song
                item.classList.add('selected');

                // Update selected song info
                const songId = item.dataset.id;
                const songTitle = item.querySelector('.song-title').textContent;
                const songImage = item.querySelector('img').src;

                this.selectedSong = songId;
                this.container.querySelector(
                    '#selected-song-title'
                ).textContent = songTitle;
                this.container.querySelector('#selected-song-image').src =
                    songImage;

                // Enable ready button
                this.container.querySelector('#ready-button').disabled = false;
            });
        });

        // Difficulty selection
        const difficultyButtons =
            this.container.querySelectorAll('.difficulty-btn');
        difficultyButtons.forEach((btn) => {
            btn.addEventListener('click', () => {
                // Remove selected class from all buttons
                difficultyButtons.forEach((b) =>
                    b.classList.remove('selected')
                );

                // Add selected class to this button
                btn.classList.add('selected');

                // Update selected difficulty
                this.selectedDifficulty = btn.dataset.difficulty;
            });
        });

        // Ready button
        const readyButton = this.container.querySelector('#ready-button');
        readyButton.addEventListener('click', () => {
            if (!this.selectedSong) {
                alert('Por favor selecciona una canción primero.');
                return;
            }

            // Emit player ready event
            this.socket.emit('player-ready', {
                roomId: this.roomId,
                playerId: this.playerId,
                songId: this.selectedSong,
                difficulty: this.selectedDifficulty,
            });

            // Update button state
            readyButton.textContent = 'Esperando al otro jugador...';
            readyButton.disabled = true;
        });
    }

    updateConnectionStatus(status) {
        // Could add connection status indicator if needed
    }
}
