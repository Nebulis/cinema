import React, { Fragment, useContext, useEffect, useState } from "react";
import { MovieCard } from "./MovieCard";
import isArray from "lodash/isArray";
import { ApplicationContext, LOADING } from "../ApplicationContext";
import { Fetch } from "../Common/Fetch";
import { MoviesContext } from "./MoviesContext";
import { MoviesFilter } from "./MoviesFilter";
import { getMovies } from "./MovieAPI";
import { UserContext } from "../Login/UserContext";
import debounce from "lodash/debounce";
import { MovieForm } from "./MovieForm";

const showMovie = () => {
  // eslint-disable-next-line no-undef
  $("#movie-creator-updator").modal("show");
};

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

  //create actions
  const loadMore = offset => {
    getMovies(buildQuery(filters, offset), user)
      .then(addAll)
      .then(() => setOffset(offset + 1)); // useInc
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
    <Fragment>
      {status === LOADING ? (
        <div>Loading ....</div>
      ) : (
        <Fragment>
          <MovieForm
            // force reinitialisation of movie form
            key={movie._id || new Date().getTime()}
            movie={movie._id ? movie : null}
            onAdd={movie => add(movie)}
            onUpdate={movie => update(movie._id, movie)}
          />
          <Fetch endpoint="/api/movies?limit=0">
            {({ data }) =>
              data ? (
                <div>There are {data.count} movies/tvshows</div>
              ) : (
                undefined
              )
            }
          </Fetch>
          Display {movies.length} of {count} found movies/tvshows
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setMovie(newMovie())}
          >
            Add new
          </button>
          <MoviesFilter />
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
    </Fragment>
  );
};
