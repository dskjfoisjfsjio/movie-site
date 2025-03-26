require('dotenv').config(); 

const axios = require('axios');
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

console.log("OMDB_API_KEY loaded:", process.env.OMDB_API_KEY); 

const OMDB_API_KEY = process.env.OMDB_API_KEY;

app.use(cors());
app.use(express.static(path.join(__dirname)));

async function fetchMoviePoster(imdbId) {
    try {
        const response = await axios.get(`http://www.omdbapi.com/?i=${imdbId}&apikey=${OMDB_API_KEY}`);
        if (response.data.Poster && response.data.Poster !== "N/A") {
            return response.data.Poster;
        } else {
            return null;
        }
    } catch (error) {
        console.error("Error fetching poster:", error.message);
        return null; 
    }
}

app.get('/api/discover/movie', async (req, res) => {
    try {
        const { page = 1, resultsPerPage = 20, ordering = 'year', direction = 'desc', query, year, imdb_id } = req.query;
        let apiUrl = `https://moviesapi.to/api/discover/movie?page=${page}&resultsPerPage=${resultsPerPage}&ordering=${ordering}&direction=${direction}`;

        if (query) apiUrl += `&query=${query}`;
        if (year) apiUrl += `&year=${year}`;
        if (imdb_id) apiUrl += `&imdb_id=${imdb_id}`;

        const response = await axios.get(apiUrl);

        if (response.data && (response.data.results || response.data.data)) {
            const movies = response.data.results || response.data.data || [];

            const movieDetailsWithPosters = await Promise.all(movies.map(async (movie) => {
                const posterImage = await fetchMoviePoster(movie.imdb_id);
                return { ...movie, posterImage }; 
            }));

            res.json({ data: movieDetailsWithPosters });
        } else {
            return res.status(500).json({ error: "Invalid API response structure", rawResponse: response.data });
        }
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch movies", details: error.response?.data });
    }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
