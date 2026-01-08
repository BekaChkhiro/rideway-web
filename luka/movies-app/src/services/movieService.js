import axios from 'axios';

const api = axios.create({
  baseURL: 'https://imdb-top-100-movies.p.rapidapi.com',
  headers: {
    'X-RapidAPI-Key': '9644c09d2bmsh6ea908331a93f65p134ce7jsnf42f16684f48',
    'X-RapidAPI-Host': 'imdb-top-100-movies.p.rapidapi.com'
  }
});

const mapMovieData = (movie) => ({
  id: movie.id || movie.imdbid,
  title: movie.title,
  year: movie.year,
  rating: movie.rating,
  poster: movie.image || movie.big_image,
  director: movie.director,
  actors: Array.isArray(movie.actors) ? movie.actors.join(', ') : movie.actors,
  plot: movie.description || movie.plot,
  runtime: movie.runtime || 'N/A',
  genre: Array.isArray(movie.genre) ? movie.genre.join(', ') : movie.genre
});

const ITEMS_PER_PAGE = 12;

export const getMovies = async () => {
  try {
    const response = await api.get('/');
    if (!response.data) {
      throw new Error('No data received from the API');
    }
    const mappedData = response.data.map(mapMovieData);
    return mappedData;
  } catch (error) {
    console.error('Error fetching movies:', error);
    if (error.response?.status === 403) {
      throw new Error('API authentication failed. Please check your API key.');
    }
    if (error.response?.status === 429) {
      throw new Error('Rate limit exceeded. Please try again later.');
    }
    if (error.response?.status === 404) {
      throw new Error('Movie API endpoint not found. Please check the API configuration.');
    }
    throw new Error(error.message || 'Failed to fetch movies');
  }
};

export const getPaginatedMovies = async (page = 1) => {
  try {
    const allMovies = await getMovies();
    const startIndex = (page - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const paginatedMovies = allMovies.slice(startIndex, endIndex);
    
    return {
      movies: paginatedMovies,
      totalPages: Math.ceil(allMovies.length / ITEMS_PER_PAGE),
      currentPage: page,
      totalItems: allMovies.length
    };
  } catch (error) {
    throw new Error(error.message || 'Failed to fetch paginated movies');
  }
};

export const getMovieById = async (id) => {
  try {
    const movies = await getMovies();
    const movie = movies.find(movie => movie.id === id);
    if (!movie) {
      throw new Error('Movie not found');
    }
    return movie;
  } catch (error) {
    console.error('Error fetching movie details:', error);
    throw new Error(error.message || 'Failed to fetch movie details');
  }
};