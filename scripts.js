document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('search-input');
    const searchResultsContainer = document.getElementById('search-results-container');
    const searchButton = document.getElementById('search-button');
    const songContainer = document.getElementById('song-container');
    const playerModal = document.getElementById('player-modal');
    const backBtn = document.getElementById('back-btn');
    const audioPlayer = document.getElementById('audio-player');
    const progressBar = document.getElementById('progress-bar');
    const playBtn = document.getElementById('play-btn');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const controlPanel = document.getElementById('music-control-panel');
    const controlPlayBtn = document.getElementById('control-play-btn');
    const controlNextBtn = document.getElementById('control-next-btn');
    const controlThumbnail = document.getElementById('control-thumbnail');
    const controlTitle = document.getElementById('control-song-title');
    const searchIcon = document.getElementById('search-icon');
    const searchPopup = document.getElementById('search-popup');
    const searchCloseBtn = document.getElementById('search-close-btn');
    const lyricsContainer = document.getElementById("lyricsContainer");
    const songList = document.getElementById("songListq");
    const searchContainer = document.getElementById("search-results-container");


    async function fetchWithRetry(url, options = {}, maxRetries = 3) {
        let attempts = 0;
        while (attempts < maxRetries) {
            try {
                const response = await fetch(url, options);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return await response.json();
            } catch (error) {
                attempts++;
                console.error(`Attempt ${attempts} failed - Error:`, error.message);
                if (attempts >= maxRetries) {
                    throw error;
                }
                // Wait for a short time before retrying (you can adjust this as needed)
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }
    }







    searchContainer.addEventListener("click", function() {
        searchPopup.style.display = 'none';
    });

    // Variables for lyrics synchronization
    let lyricsArray = [];
    let playlist = [];
    let currentSongIndex = 0;
    let isPlaying = false;
    let vId = "";

    searchIcon.addEventListener('click', function() {
        searchPopup.style.display = 'flex';
    });

    searchCloseBtn.addEventListener('click', function() {
        searchPopup.style.display = 'none';
    });

    const menuIcon = document.getElementById('menu-icon');
    const menuPopup = document.getElementById('menu-popup');
    const menuCloseBtn = document.getElementById('menu-close-btn');
    const menuHome = document.getElementById('menu-home');
    const menuPlaylist = document.getElementById('menu-playlist');
    const menuDownloads = document.getElementById('menu-downloads');
    const menuSettings = document.getElementById('menu-settings');

    document.addEventListener('click', function(event) {
        const isClickInsideMenu = menuPopup.contains(event.target);
        const isClickOnMenuIcon = menuIcon.contains(event.target);
        if (!isClickInsideMenu && !isClickOnMenuIcon) {
            menuPopup.style.display = 'none';
        }
    });

    let saveli = [];

    document.getElementById("openPopupBtnq").addEventListener("click", function() {
        document.getElementById("popupq").style.display = "flex";
        displaySongsq(saveli);
    });

    document.getElementById("closePopupBtnq").addEventListener("click", function() {
        document.getElementById("popupq").style.display = "none";
    });

    window.addEventListener("click", function(event) {
        const popup = document.getElementById("popupq");
        if (event.target === popup) {
            popup.style.display = "none";
        }
    });

    function displaySongsq(songs) {
        songList.innerHTML = '';
        songs.forEach((song, index) => {
            const songItem = document.createElement("div");
            songItem.classList.add("song-itemq");
            songItem.innerHTML = `
            <div class="song-titleq">${song.title}</div>
            <div class="song-artistq">${song.artists}</div>
        `;
            songItem.addEventListener("click", () => {
                playSongq(song, index, song.videoId);
                document.getElementById("popupq").style.display = "none";
            });
            songList.appendChild(songItem);
        });
    }

    async function playSongq(song, index, vidd) {
        currentSongIndex = index; // Always update the currentSongIndex when a song is clicked
        playlist = saveli; // Ensure the playlist is always the same
        await playSong(song);
    }

    async function playSong(song) {
      console.log(song.videoId);
        updatePlayerAndControlPanel(song.thumbnail, song.title, song.artists, song.videoId);
        showControlPanel();
        openPlayerModal();
        stopCurrentSong();
        vId = song.videoId;
        lyricsContainer.innerHTML = '';
        lyricsContainer.style.display = 'none';
        try {
            const audioUrl = await getAudioUrl(song.videoId);
            if (audioUrl) {
                audioPlayer.src = audioUrl;
                audioPlayer.play();
                isPlaying = true;
                syncProgressBar();
                syncLyrics();
                playBtn.innerHTML = '<img class="div-button" src="pause-button.png">';
                controlPlayBtn.innerHTML = '<img class="div-button" src="pause-button.png">';
                audioPlayer.addEventListener('ended', playNextSong);
                playBtn.addEventListener('click', togglePlayPause);
                controlPlayBtn.addEventListener('click', togglePlayPause);
                controlNextBtn.addEventListener('click', playNextSong);
                prevBtn.addEventListener('click', playPrevSong);
                nextBtn.addEventListener('click', playNextSong);
            } else {
                throw new Error('Failed to get audio URL');
            }
        } catch (error) {
            console.error('Error playing song:', error);
        }
    }

    async function playNextSong() {
        currentSongIndex = (currentSongIndex + 1) % playlist.length;
        const nextSong = playlist[currentSongIndex];
        await playSong(nextSong);
    }

    async function playPrevSong() {
        currentSongIndex = (currentSongIndex - 1 + playlist.length) % playlist.length;
        const prevSong = playlist[currentSongIndex];
        await playSong(prevSong);
    }

    document.getElementById("getLyricsButton").addEventListener("click", getlyrics);

    async function getlyrics() {
        const videoId = vId;
        lyricsContainer.innerHTML = '';
        lyricsContainer.style.display = "block";

        const cachedLyrics = localStorage.getItem(`lyrics_${videoId}`);

        if (cachedLyrics) {
            parseLyrics(cachedLyrics);
        } else {
            lyricsContainer.innerHTML = "Loading...";

            try {
                const data = await fetchWithRetry(`https://lyrics-gnqz.onrender.com/lyrics?video_id=${videoId}`);

                if (data.Responce === 200) {
                    const lyrics = data.lyrics;
                    let lyricsText = "";

                    for (const [time, lyric] of Object.entries(lyrics)) {
                        lyricsText += `${time} - ${lyric}\n`;
                    }

                    localStorage.setItem(`lyrics_${videoId}`, lyricsText);
                    parseLyrics(lyricsText);
                } else {
                    lyricsContainer.innerHTML = "Error fetching lyrics. Please try again.";
                }
            } catch (error) {
                lyricsContainer.innerHTML = "An error occurred. Please try again.";
            }
        }
    }

    function parseLyrics(lyricsText) {
        lyricsArray = lyricsText.split("\n").map(line => {
            const [time, text] = line.split(" - ");
            return { time: parseTime(time), text };
        });
    }

    function parseTime(time) {
        const [minutes, seconds] = time.split(":").map(Number);
        return minutes * 60 + seconds;
    }

    menuPopup.addEventListener('click', function(event) {
        event.stopPropagation();
    });

    menuIcon.addEventListener('click', function(event) {
        menuPopup.style.display = 'flex';
        event.stopPropagation();
    });

    menuCloseBtn.addEventListener('click', function(event) {
        menuPopup.style.display = 'none';
        event.stopPropagation();
    });

    menuHome.addEventListener('click', function(e) {
        e.preventDefault();
        menuPopup.style.display = 'none';
    });

    menuPlaylist.addEventListener('click', function(e) {
        e.preventDefault();
        menuPopup.style.display = 'none';
    });

    songContainer.innerHTML = '<div class="loader-home"></div>';

    menuDownloads.addEventListener('click', function(e) {
        e.preventDefault();
        menuPopup.style.display = 'none';
    });

    menuSettings.addEventListener('click', function(e) {
        e.preventDefault();
        menuPopup.style.display = 'none';
    });


    fetchWithRetry('https://apparent-karyn-nitinbhujwa-86b8a47b.koyeb.app/charts')
        .then(data => {
            displaySongs(data);
        })
        .catch(error => console.error('Error fetching song data:', error));


    function displaySongs(songs) {
        const fragment = document.createDocumentFragment();
        songs.forEach(song => {
            const songCard = createSongCard(song);
            fragment.appendChild(songCard);
        });
        songContainer.appendChild(fragment);
    }

    function createSongCard(song) {
        songContainer.innerHTML = '';
        const songCard = document.createElement('div');
        songCard.classList.add('song-card');

        const thumbnailWrapper = document.createElement('div');
        thumbnailWrapper.classList.add('song-thumbnail-wrapper');

        const songThumbnail = document.createElement('img');
        songThumbnail.src = song.thumbnail;
        songThumbnail.draggable = false;

        let ghd = song.title;
        songThumbnail.alt = ghd.length > 20 ? ghd.substring(0, 20) + "..." : ghd;
        songThumbnail.classList.add('song-thumbnail');
        thumbnailWrapper.appendChild(songThumbnail);

        songCard.appendChild(thumbnailWrapper);

        const songTitle = document.createElement('p');
        songTitle.textContent = ghd.length > 20 ? ghd.substring(0, 20) + "..." : ghd;
        songCard.appendChild(songTitle);

        const songViews = document.createElement('p');
        songViews.textContent = `Views: ${song.views}`;
        songCard.appendChild(songViews);

        const songArtists = document.createElement('p');
        const art = song.artists;
        songArtists.textContent = art.length > 20 ? 'Artists: ' + art.substring(0, 20) + "..." : 'Artists: ' + art;
        songCard.appendChild(songArtists);

        songCard.addEventListener('click', () => {

            createPlaylistAndPlay(song.videoId, song);
        });

        return songCard;
    }

    // Function to hide the popup
    function hidePopup() {
        const popup = document.getElementById("popupq");
        if (popup.style.display === "flex") {
            popup.style.display = "none";
            history.pushState(null, null, location.href); // Update history so back button works as expected
        }
    }

    // Add event listener for the popstate event (i.e., back button)
    window.addEventListener("popstate", function(event) {
        hidePopup();
    });




    // Example usage: Show the popup and update history


    async function createPlaylistAndPlay(videoId, song) {
        songList.innerHTML = '';
        playlist = [song]; // Reset the playlist to just the current song
        currentSongIndex = 0; // Reset the current song index
        updatePlayerAndControlPanel(song.thumbnail, song.title, song.artists, song.videoId);
        showControlPanel();
        openPlayerModal();
        stopCurrentSong();
        await playSong(song);
        const relatedSongs = await fetchRelatedSongs(videoId);
        if (relatedSongs.length > 1) {
            const firstSong = relatedSongs[0];
            const restSongs = relatedSongs.slice(1);
            for (let i = restSongs.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [restSongs[i], restSongs[j]] = [restSongs[j], restSongs[i]];
            }
            playlist = [firstSong, ...restSongs]; // Update the playlist with related songs
            saveli = playlist;
        } else {
            playlist = [...relatedSongs];
            saveli = playlist;
        }
    }

    async function fetchRelatedSongs(videoId) {
        try {
            return await fetchWithRetry(`https://get-related-songs.vercel.app/related_songs?video_id=${videoId}`);
        } catch (error) {
            console.error('Error fetching related songs:', error);
            return [];
        }
    }

    function syncLyrics() {
        audioPlayer.addEventListener('timeupdate', () => {
            const currentTime = audioPlayer.currentTime;
            updateLyrics(currentTime);
        });
    }

    function updateLyrics(currentTime) {
        let currentIndex = lyricsArray.findIndex(lyric => lyric.time > currentTime) - 1;
        if (currentIndex < 0) currentIndex = 0;

        const currentLyric = lyricsArray[currentIndex];
        const prevLyric = lyricsArray[currentIndex - 1] || { text: '' };
        const nextLyric = lyricsArray[currentIndex + 1] || { text: '' };

        lyricsContainer.innerHTML = `<div style="position:relative;line-height: 0.7;">
            <p style="opacity: 0.5;position:relative;margin-top: 0%; padding: 0;line-height: 1;">${prevLyric.text}</p>
            <p style="font-size: 1.5rem;margin:0;line-height: 1; font-weight: bold; color: #000000;">${currentLyric.text}</p>
            <p style="margin:auto;line-height: 1;opacity: 0.5;">${nextLyric.text}</p></div>`;
    }

    function stopCurrentSong() {
        audioPlayer.pause();
        audioPlayer.currentTime = 0;
        audioPlayer.src = '';
        playBtn.innerHTML = '<img class="div-button" src="play-button.png">';
        controlPlayBtn.innerHTML = '<img class="div-button" src="play-button.png">';
        isPlaying = false;
        audioPlayer.removeEventListener('ended', playNextSong);
    }

    function togglePlayPause() {
        if (isPlaying) {
            audioPlayer.pause();
            playBtn.innerHTML = '<img class="div-button" src="play-button.png">';
            controlPlayBtn.innerHTML = '<img class="div-button" src="play-button.png">';
        } else {
            audioPlayer.play();
            playBtn.innerHTML = '<img class="div-button" src="pause-button.png">';
            controlPlayBtn.innerHTML = '<img class="div-button" src="pause-button.png">';
        }
        isPlaying = !isPlaying;
    }

    document.addEventListener('keydown', function(event) {
        if (event.code === 'Space') {
            event.preventDefault();
            togglePlayPause();
        } else if (event.code === 'ArrowRight') {
            playNextSong();
        } else if (event.code === 'ArrowLeft') {
            playPrevSong();
        }
    });

    function updatePlayerAndControlPanel(thumbnail, title, artists, videoId) {
        document.getElementById('player-thumbnail').src = `https://i.ytimg.com/vi/${videoId}/sddefault.jpg`;
        document.getElementById('player-title').textContent = title.length > 20 ? title.substring(0, 20) + "..." : title;
        document.getElementById('player-artists').textContent = artists;
        document.getElementById('control-thumbnail').src = `https://i.ytimg.com/vi/${videoId}/sddefault.jpg`;
        document.getElementById('control-song-title').textContent = title.length > 20 ? title.substring(0, 20) + "..." : title;
        lyricsArray.length = 0;
    }

    async function getAudioUrl(videoId) {
        const apiUrl = `https://audio-url-shivambotrewas-projects.vercel.app/get-audio-url/${videoId}`;
        try {
            const data = await fetchWithRetry(apiUrl);
            return data.streamUrl;
        } catch (error) {
            console.error('Error fetching audio URL:', error);
            return null;
        }
    }


    function openPlayerModal() {
        playerModal.style.display = 'flex';
        history.pushState(null, null, location.href);
        window.addEventListener('popstate', function() {
            if (playerModal.style.display === 'flex') {
                closePlayerModal();
            }
        });
    }

    function closePlayerModal() {
        playerModal.style.display = 'none';
        history.back();
    }

    backBtn.addEventListener('click', closePlayerModal);

    function showControlPanel() {
        controlPanel.style.display = 'flex';
    }

    controlThumbnail.addEventListener('click', openPlayerModal);
    controlTitle.addEventListener('click', openPlayerModal);
    controlNextBtn.addEventListener('click', playNextSong);
    nextBtn.addEventListener('click', playNextSong);

    function syncProgressBar() {
        audioPlayer.addEventListener('timeupdate', () => {
            const progress = (audioPlayer.currentTime / audioPlayer.duration) * 100;
            progressBar.value = progress;
        });
        progressBar.addEventListener('input', (e) => {
            const seekTime = (audioPlayer.duration * e.target.value) / 100;
            audioPlayer.currentTime = seekTime;
        });
    }

    const suggestionBox = document.createElement('div');
    suggestionBox.id = 'suggestion-box';
    searchInput.parentNode.appendChild(suggestionBox);

    searchInput.addEventListener('input', function() {
        suggestionBox.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600"><circle fill="#A64DFF" stroke="#A64DFF" stroke-width="6" r="15" cx="40" cy="65"><animate attributeName="cy" calcMode="spline" dur="3.1" values="65;135;65;" keySplines=".5 0 .5 1;.5 0 .5 1" repeatCount="indefinite" begin="-.4"></animate></circle><circle fill="#A64DFF" stroke="#A64DFF" stroke-width="6" r="15" cx="100" cy="65"><animate attributeName="cy" calcMode="spline" dur="3.1" values="65;135;65;" keySplines=".5 0 .5 1;.5 0 .5 1" repeatCount="indefinite" begin="-.2"></animate></circle><circle fill="#A64DFF" stroke="#A64DFF" stroke-width="6" r="15" cx="160" cy="65"><animate attributeName="cy" calcMode="spline" dur="3.1" values="65;135;65;" keySplines=".5 0 .5 1;.5 0 .5 1" repeatCount="indefinite" begin="0"></animate></circle></svg>';
        const query = searchInput.value.trim();
        if (query) {
            getSuggestions(query);
        } else {
            suggestionBox.innerHTML = '';
        }
    });

    document.addEventListener('click', function(event) {
        if (!searchInput.contains(event.target) && !suggestionBox.contains(event.target)) {
            suggestionBox.innerHTML = '';
        }
    });

    async function getSuggestions(query) {
        try {
            const response = await fetch(`http://suggestqueries.google.com/complete/search?client=youtube&ds=yt&client=firefox&q=${encodeURIComponent(query)}`);
            const data = await response.json();
            displaySuggestions(data[1]);
        } catch (error) {
            console.error('Error fetching suggestions:', error);
        }
    }

    function displaySuggestions(suggestions) {
        suggestionBox.innerHTML = '';
        suggestions.forEach(suggestion => {
            const suggestionItem = document.createElement('div');
            suggestionItem.classList.add('suggestion-item');
            suggestionItem.textContent = suggestion;
            suggestionItem.addEventListener('click', () => {
                searchInput.value = suggestion;
                suggestionBox.innerHTML = '';
                searchButton.click();
            });
            suggestionBox.appendChild(suggestionItem);
        });
    }

    searchButton.addEventListener('click', function() {
        const query = searchInput.value.trim();
        if (query) {
            fetchSongsByQuery(query);
        } else {
            searchResultsContainer.innerHTML = '<p>Please enter a search query.</p>';
        }
    });

    searchInput.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            searchButton.click();
        }
    });

    async function fetchSongsByQuery(query) {
        try {
            searchResultsContainer.innerHTML = '<div class="loader-search"></div><p style="top:50%;color:white;text-align:center;position:relative;">Searching...</p>';
            const data = await fetchWithRetry(`https://get-related-songs.vercel.app/search_songs?query=${encodeURIComponent(query)}`);
            displaySearchResults(data);
        } catch (error) {
            console.error('Error fetching search results:', error);
            searchResultsContainer.innerHTML = '<p>An error occurred while searching. Please try again.</p>';
        }
    }


    function displaySearchResults(songs) {
        searchResultsContainer.innerHTML = '';
        if (songs.length === 0) {
            searchResultsContainer.innerHTML = '<p>No results found.</p>';
            return;
        }

        const fragment = document.createDocumentFragment();
        songs.forEach(song => {
            const songCard = createSearchResultCard(song);
            fragment.appendChild(songCard);
        });
        searchResultsContainer.appendChild(fragment);
    }

    function createSearchResultCard(song) {
        const songCard = document.createElement('div');
        songCard.classList.add('search-result-card');

        const thumbnailImg = document.createElement('img');
        thumbnailImg.src = `https://i.ytimg.com/vi/${song.videoId}/default.jpg`;
        thumbnailImg.alt = song.title;
        thumbnailImg.classList.add('search-result-thumbnail');

        const songInfo = document.createElement('div');
        songInfo.classList.add('search-result-info');

        const titleEl = document.createElement('h3');
        titleEl.textContent = song.title.length > 50 ? song.title.substring(0, 50) + "..." : song.title;
        titleEl.classList.add('search-result-title');

        const artistsEl = document.createElement('p');
        artistsEl.textContent = song.artists;
        artistsEl.classList.add('search-result-artists');

        songInfo.appendChild(titleEl);
        songInfo.appendChild(artistsEl);

        songCard.appendChild(thumbnailImg);
        songCard.appendChild(songInfo);

        songCard.addEventListener('click', () => {
            searchPopup.style.display = 'none';
            createPlaylistAndPlay(song.videoId, song);
        });

        return songCard;
    }
});