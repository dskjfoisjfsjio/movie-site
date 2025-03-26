document.addEventListener("DOMContentLoaded", () => {
    const searchInput = document.getElementById("search-input");
    const searchButton = document.getElementById("search-button");
    const movieGrid = document.getElementById("movie-grid");
    const prevPage = document.getElementById("prev-page");
    const nextPage = document.getElementById("next-page");
    const pageNumber = document.getElementById("page-number");

    let currentPage = 1;

    function showLoading() {
        movieGrid.innerHTML = '<div>Loading...</div>';
    }

    async function fetchMovies(query = "", page = 1) {
        showLoading();
        try {
            const response = await fetch(`/api/discover/movie?query=${query}&page=${page}`);
            const data = await response.json();
    
            if (data && data.data && Array.isArray(data.data)) {
                displayMovies(data.data);
                pageNumber.innerText = `Page ${page}`;
                
                prevPage.disabled = page === 1;
                nextPage.disabled = data.total_pages && page >= data.total_pages;
            } else {
                console.error("Invalid API response:", data);
            }
        } catch (error) {
            console.error("Error fetching movies:", error);
        }
    }

    async function displayMovies(movies) {
        movieGrid.innerHTML = "";
    
        for (const movie of movies) {
            const movieCard = document.createElement("div");
            movieCard.classList.add("movie-card");
    
            const posterImage = movie.posterImage; // This should have been added on the backend
    
            const imgElement = document.createElement("img");
            if (posterImage) {
                imgElement.src = posterImage; // Set the src to the poster image URL
                imgElement.alt = `Poster for ${movie.orig_title} (${movie.year})`;
            } else {
                imgElement.alt = `No poster available for ${movie.orig_title} (${movie.year})`;
            }
    
            movieCard.appendChild(imgElement);
    
            const titleElement = document.createElement("h3");
            titleElement.textContent = movie.orig_title;
            movieCard.appendChild(titleElement);
    
            const yearElement = document.createElement("p");
            yearElement.textContent = movie.year;
            movieCard.appendChild(yearElement);
    
            movieCard.addEventListener("click", () => {
                const movieUrl = `https://moviesapi.club/movie/${movie.imdb_id}`;
                window.open(movieUrl, "_blank");
            });
    
            movieGrid.appendChild(movieCard);
        }
    }
    
    function handleSearch() {
        fetchMovies(searchInput.value.trim(), 1);
        currentPage = 1;
    }

    searchButton.addEventListener("click", handleSearch);

    searchInput.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            handleSearch();
        }
    });

    prevPage.addEventListener("click", () => {
        if (currentPage > 1) {
            currentPage--;
            fetchMovies(searchInput.value, currentPage);
        }
    });

    nextPage.addEventListener("click", () => {
        currentPage++;
        fetchMovies(searchInput.value, currentPage);
    });

    fetchMovies();
});
