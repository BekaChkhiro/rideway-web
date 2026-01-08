import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getMovieById } from '../services/movieService';

export default function MovieDetails() {
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { id } = useParams();

  useEffect(() => {
    loadMovie();
  }, [id]);

  const loadMovie = async () => {
    try {
      const data = await getMovieById(id);
      setMovie(data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load movie details');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-50 text-red-500 p-4 rounded-md">
          {error}
        </div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Movie not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link
            to="/movies"
            className="inline-flex items-center text-blue-600 hover:text-blue-700"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Movies
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="md:flex">
            <div className="md:flex-shrink-0">
              <img
                className="h-[500px] w-full object-cover md:w-[400px]"
                src={movie.poster}
                alt={movie.title}
              />
            </div>
            <div className="p-8 flex-grow">
              <div className="flex items-start justify-between">
                <h1 className="text-3xl font-bold text-gray-900">
                  {movie.title}
                </h1>
                <span className="ml-4 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  {movie.year}
                </span>
              </div>
              
              <div className="mt-6 space-y-6">
                {movie.director && (
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Director</h2>
                    <p className="mt-2 text-gray-600">{movie.director}</p>
                  </div>
                )}
                
                {movie.genre && (
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Genre</h2>
                    <p className="mt-2 text-gray-600">{movie.genre}</p>
                  </div>
                )}
                
                {movie.actors && (
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Cast</h2>
                    <p className="mt-2 text-gray-600">{movie.actors}</p>
                  </div>
                )}

                {movie.plot && (
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Plot</h2>
                    <p className="mt-2 text-gray-600 leading-relaxed">{movie.plot}</p>
                  </div>
                )}

                <div className="flex items-center space-x-8">
                  {movie.rating && (
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">Rating</h2>
                      <div className="mt-2 flex items-center">
                        <svg className="w-6 h-6 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span className="ml-2 text-lg text-gray-600">{movie.rating}</span>
                      </div>
                    </div>
                  )}

                  {movie.runtime && movie.runtime !== 'N/A' && (
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">Runtime</h2>
                      <p className="mt-2 text-lg text-gray-600">{movie.runtime}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}