document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('search-input');
    const searchResultsContainer = document.getElementById('search-results-container');
    const searchButton = document.getElementById('search-button');
    const suggestionBox = document.createElement('div'); // To show suggestions
    suggestionBox.id = 'suggestion-box';
    searchInput.parentNode.appendChild(suggestionBox);

    // Add an event listener for input changes to get suggestions
    searchInput.addEventListener('input', function() {
        const query = searchInput.value.trim();
        if (query) {
            getSuggestions(query);
        } else {
            suggestionBox.innerHTML = ''; // Clear suggestions if input is empty
        }
    });

    // Fetch search suggestions
    async function getSuggestions(query) {
        try {
            const response = await fetch(`http://suggestqueries.google.com/complete/search?client=youtube&ds=yt&client=firefox&q=${encodeURIComponent(query)}`);
            const data = await response.json();

            // Display suggestions in the suggestionBox
            displaySuggestions(data[1]);
        } catch (error) {
            console.error('Error fetching suggestions:', error);
        }
    }

    // Display the suggestions
    function displaySuggestions(suggestions) {
        suggestionBox.innerHTML = ''; // Clear previous suggestions

        suggestions.forEach(suggestion => {
            const suggestionItem = document.createElement('div');
            suggestionItem.classList.add('suggestion-item');
            suggestionItem.textContent = suggestion;

            // Add event listener for clicking on a suggestion
            suggestionItem.addEventListener('click', () => {
                searchInput.value = suggestion; // Fill the input with the clicked suggestion
                suggestionBox.innerHTML = ''; // Clear suggestions after selection
                searchButton.click(); // Trigger the search
            });

            suggestionBox.appendChild(suggestionItem);
        });
    }

    // Add event listener for search button
    searchButton.addEventListener('click', function() {
        const query = searchInput.value.trim();
        if (query) {
            fetchSongsByQuery(query);
        } else {
            searchResultsContainer.innerHTML = '<p>Please enter a search query.</p>';
        }
    });

    // Handle the Enter key for the search input
    searchInput.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            searchButton.click();
        }
    });

    async function fetchSongsByQuery(query) {
        try {
            searchResultsContainer.innerHTML = '<div class="loader-search"></div><p style="top:50%;color:white;text-align:center;position:relative;">Searching...</p>';
            const response = await fetch(`https://get-related-songs.onrender.com/search_songs?query=${encodeURIComponent(query)}`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
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