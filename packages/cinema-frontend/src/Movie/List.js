import React, { Fragment, useContext, useEffect, useState } from "react";
import { MovieCard } from "./MovieCard";
import isArray from "lodash/isArray";
import { ApplicationContext, LOADING } from "../ApplicationContext";
import { MoviesContext } from "./MoviesContext";
import { MoviesFilter } from "./MoviesFilter";
import { getMovies } from "./MovieAPI";
import { UserContext } from "../Login/UserContext";
import debounce from "lodash/debounce";
import { MovieForm } from "./MovieForm";

const newMovie = () => ({});

const buildQuery = (filters, offset) => {
  // can use lodash/partition to one line
  const genres = filters.genres
    .filter(genre => genre[1])
    .map(genre => genre[0]);
  const notGenres = filters.genres
    .filter(genre => !genre[1])
    .map(genre => genre[0]);
  return Object.keys(filters)
    .filter(key => key !== "genres") // handle genres manually)
    .filter(
      key =>
        (!isArray(filters[key]) && filters[key]) ||
        (isArray(filters[key]) && filters[key].length > 0)
    )
    .map(key => `${key}=${filters[key]}`)
    .concat(
      genres.length > 0 ? `genres=${genres.join(",")}` : "",
      notGenres.length > 0 ? `notGenres=${notGenres.join(",")}` : "",
      `offset=${offset}`
    )
    .filter(Boolean) // remove empty strings
    .join("&");
};

export const List = () => {
  // load contexts
  const { status } = useContext(ApplicationContext);
  const { movies, count, addAll, filters, add, update } = useContext(
    MoviesContext
  );
  const user = useContext(UserContext);

  // create state
  const [offset, setOffset] = useState(movies.length / filters.limit);
  const [movie, setMovie] = useState(newMovie());
  const [key, setKey] = useState(0);

  //create actions
  const loadMore = offset => {
    getMovies(buildQuery(filters, offset), user)
      .then(addAll)
      .then(() => setOffset(offset + 1)); // useInc
  };
  const showMovie = () => {
    // ignore first trigger, needed for backward navigation
    if (key > 0) {
      // eslint-disable-next-line no-undef
      $("#movie-creator-updator").modal("show");
    }
  };

  // create effects
  useEffect(
    () => {
      // useDebounce :)
      const debouncedLoadMore = debounce(loadMore, 400, {
        leading: false,
        trailing: true
      });
      // no movies ? then automatically fetch some (note: every time a filter is updated, movies are cleaned up)
      if (movies.length === 0) {
        debouncedLoadMore(0);
      }
      return () => debouncedLoadMore.cancel();
    },
    [filters]
  );
  useEffect(showMovie, [movie]);

  // render
  return (
    <div>
      {status === LOADING ? (
        <div>Loading ....</div>
      ) : (
        <Fragment>
          <MovieForm
            // force reinitialisation of movie form
            key={movie._id || key}
            movie={movie._id ? movie : null}
            onAdd={movie => add(movie)}
            onUpdate={movie => update(movie._id, movie)}
          />
          <i
            onClick={() => {
              setMovie(newMovie());
              setKey(key + 1);
            }}
            className="fas fa-plus-circle fa-3x"
            style={{
              top: "22px",
              left: "22px",
              position: "absolute",
              color: "#F1F7EE",
              cursor: "pointer"
            }}
            title="Add a movie or a tv show"
          />
          <MoviesFilter />
          <h2 className="text-center">
            {movies.length} of {count} found movies/tvshows
          </h2>
          <div className="movies">
            {movies.map(movie => (
              <MovieCard
                key={movie._id}
                movie={movie}
                onChange={movie => update(movie._id, movie)}
                onDelete={_ => update(movie._id, undefined)}
                onEdit={() => {
                  setMovie({
                    ...movie // create a new movie to force the show effect to be displayed
                  });
                  setKey(key + 1); // mandatory otherwise first edit fail
                }}
              />
            ))}
          </div>
          <div className="text-center m-3">
            <button
              onClick={() => loadMore(offset)}
              className="btn btn-primary btn-lg"
            >
              Load more
            </button>
          </div>
        </Fragment>
      )}
    </div>
  );
};
