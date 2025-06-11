import { navigateTo, socket } from '../main.js';

export function renderSongSelectionScreen(container, data) {
    const { roomCode, players } = data;

    // Song file paths - these will be loaded dynamically
    const songFiles = [
        { id: 'song1', dataFile: '/game/assets/data/song1.json' },
        { id: 'song2', dataFile: '/game/assets/data/song2.json' },
        { id: 'song3', dataFile: '/game/assets/data/song3.json' },
    ];

    let availableSongs = [];
    let selectedSong = null;
    let currentPreviewAudio = null;
    let isLoading = true;

    container.innerHTML = `
        <main class="song-selection-screen">
            <div class="selection-header">
                <h1>Seleccionar Canción</h1>
                <div class="room-info">
                    <span>Sala: ${roomCode}</span>
                    <span>Jugadores: ${players.length}/2</span>
                </div>
            </div>
            <div class="songs-grid" id="songs-grid">
                <div class="loading-songs">Cargando canciones...</div>
            </div>
            <div class="selection-footer">
                <button id="select-song-btn" class="btn primary" disabled>
                    Seleccionar Canción
                </button>
                <div id="loading-message" class="loading-message" style="display: none;">
                    Cargando canción...
                </div>
            </div>
        </main>
    `;

    // Function to load all songs from beatmap files
    async function loadAllSongs() {
        try {
            const songPromises = songFiles.map(async (songFile) => {
                const response = await fetch(songFile.dataFile);
                if (!response.ok)
                    throw new Error(`Failed to load ${songFile.id}`);

                const songData = await response.json();

                return {
                    id: songFile.id,
                    image: songData.image,
                    title: songData.title,
                    audio: songData.audio,
                    bpm: songData.bpm,
                    offset: songData.offset,
                    lanes: songData.lanes,
                    notes: songData.notes,
                    duration:
                        songData.notes.length > 0
                            ? Math.max(
                                  ...songData.notes.map((note) => note.time)
                              ) + 2000
                            : 180000,
                };
            });

            availableSongs = await Promise.all(songPromises);
            renderSongsGrid();
            isLoading = false;
        } catch (error) {
            console.error('Error loading songs:', error);
            document.getElementById('songs-grid').innerHTML = `
                <div class="error-message">Error al cargar las canciones. Por favor, recarga la página.</div>
            `;
        }
    }

    // Function to render songs grid after loading
    function renderSongsGrid() {
        document.getElementById('songs-grid').innerHTML = availableSongs
            .map(
                (song) => `
            <div class="song-card" data-song-id="${song.id}">
                <div class="song-image">
                    <img src="${song.image}" alt="${song.title}" class="song-cover" />
                </div>
                <div class="song-info">
                    <h3>${song.title}</h3>
                    <p class="lanes-info">${song.lanes} Líneas</p>
                    <p class="bpm-info">${song.bpm} BPM</p>
                </div>
                <div class="song-actions">
                    <button class="btn preview-btn" data-song-id="${song.id}">
                        <span class="preview-text">Preview</span>
                        <span class="preview-stop" style="display: none;">Stop</span>
                    </button>
                </div>
            </div>
        `
            )
            .join('');

        // Add event listeners after rendering
        addEventListeners();
    }

    // Function to add event listeners to dynamically created elements
    function addEventListeners() {
        // Song card click handlers
        document.querySelectorAll('.song-card').forEach((card) => {
            card.addEventListener('click', (e) => {
                if (e.target.closest('.preview-btn')) return;

                const songId = card.dataset.songId;
                selectedSong = songId;
                updateSelectedSong(songId);
            });
        });

        // Preview button handlers
        document.querySelectorAll('.preview-btn').forEach((btn) => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();

                const songId = btn.dataset.songId;
                const song = availableSongs.find((s) => s.id === songId);

                if (btn.classList.contains('playing')) {
                    stopCurrentPreview();
                } else {
                    stopCurrentPreview();

                    try {
                        currentPreviewAudio = new Audio(song.audio);
                        currentPreviewAudio.volume = 0.5;
                        currentPreviewAudio.currentTime = 30;

                        currentPreviewAudio
                            .play()
                            .then(() => {
                                btn.classList.add('playing');
                                btn.querySelector(
                                    '.preview-text'
                                ).style.display = 'none';
                                btn.querySelector(
                                    '.preview-stop'
                                ).style.display = 'inline';
                            })
                            .catch((error) => {
                                console.error('Error playing preview:', error);
                            });

                        setTimeout(() => {
                            if (currentPreviewAudio === currentPreviewAudio) {
                                stopCurrentPreview();
                            }
                        }, 15000);

                        currentPreviewAudio.addEventListener(
                            'ended',
                            stopCurrentPreview
                        );
                    } catch (error) {
                        console.error('Error creating audio preview:', error);
                    }
                }
            });
        });
    }

    // Function to load complete song data
    async function loadSongData(songId) {
        const song = availableSongs.find((s) => s.id === songId);
        if (!song) throw new Error('Song not found');
        return song;
    }

    // Function to show loading state
    function showLoading(show = true) {
        const loadingDiv = document.getElementById('loading-message');
        const selectBtn = document.getElementById('select-song-btn');

        loadingDiv.style.display = show ? 'block' : 'none';
        selectBtn.disabled = show || !selectedSong;
        selectBtn.textContent = show ? 'Cargando...' : 'Seleccionar Canción';
    }

    // Function to update selected song UI
    function updateSelectedSong(songId) {
        document.querySelectorAll('.song-card').forEach((card) => {
            card.classList.remove('selected');
        });

        if (songId) {
            const songCard = document.querySelector(
                `[data-song-id="${songId}"]`
            );
            if (songCard) {
                songCard.classList.add('selected');
            }
        }

        const selectBtn = document.getElementById('select-song-btn');
        selectBtn.disabled = !songId || isLoading;
    }

    // Function to stop current preview
    function stopCurrentPreview() {
        if (currentPreviewAudio) {
            currentPreviewAudio.pause();
            currentPreviewAudio.currentTime = 0;
            currentPreviewAudio = null;
        }

        document.querySelectorAll('.preview-btn').forEach((btn) => {
            btn.classList.remove('playing');
            btn.querySelector('.preview-text').style.display = 'inline';
            btn.querySelector('.preview-stop').style.display = 'none';
        });
    }

    // Select song button handler
    document
        .getElementById('select-song-btn')
        .addEventListener('click', async () => {
            if (!selectedSong || isLoading) return;

            try {
                showLoading(true);
                stopCurrentPreview();

                const songData = await loadSongData(selectedSong);

                socket.emit('game:select_song', {
                    roomCode,
                    selectedSong: songData,
                });
            } catch (error) {
                showLoading(false);
                console.error('Error selecting song:', error);
                alert(
                    'Error al cargar la canción. Por favor, intenta de nuevo.'
                );
            }
        });

    // Socket event listeners
    socket.on('game:song_selected', (data) => {
        if (data.roomCode === roomCode) {
            showLoading(false);

            // Pre-load the song audio
            const audio = new Audio(data.song.audio);
            audio.preload = 'auto';

            // Navigate to game screen with selected song
            navigateTo('/game', {
                roomCode,
                players,
                selectedSong: data.song,
                gameState: data.gameState,
                gameAudio: audio, // Pass the audio object
            });
        }
    });

    socket.on('game:error', (error) => {
        showLoading(false);
        console.error('Game error:', error);
        alert(error.message || 'Error del juego');
    });

    // Cleanup function
    const cleanup = () => {
        stopCurrentPreview();
        socket.off('game:song_selected');
        socket.off('game:error');
    };

    // Store cleanup function for potential use
    container.cleanup = cleanup;

    // Load songs on initialization
    loadAllSongs();
}
