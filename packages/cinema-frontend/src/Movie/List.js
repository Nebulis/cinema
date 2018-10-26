import React, { Component, Fragment } from "react";
import { MovieCard } from "./MovieCard";
import isArray from "lodash/isArray";
import { MovieForm } from "./MovieForm";
import { LOADING, withApplication } from "../ApplicationContext";
import { Fetch } from "../Common/Fetch";
import { withMovies } from "./MoviesContext";
import { MoviesFilter } from "./MoviesFilter";
import { withMoviesFilter } from "./MoviesFilterContext";

export class ListWithContext extends Component {
  constructor(props) {
    super(props);
    const offset = this.props.movies.movies.length / 30; // quickfix ... otherwise reset to 0 when navigate back
    this.state = {
      more: false, // hmmmm for offset ....
      movie: null,
      movieFormKey: 0,
      limit: 30,
      offset: offset ? offset - 1 : offset // first page must be 0 not -1
    };
  }

  next = () => {
    this.setState(({ offset }) => ({
      more: true,
      offset: offset + 1
    }));
  };

  onCloseEditMovie = () => {
    this.setState({ movie: null });
  };

  editMovie = movie => {
    this.setState({ movie }, () =>
      // eslint-disable-next-line no-undef
      $("#movie-creator-updator").modal("show")
    );
  };

  addMovie = () => {
    this.setState(
      { movie: null, movieFormKey: this.state.movieFormKey + 1 },
      () =>
        // eslint-disable-next-line no-undef
        $("#movie-creator-updator").modal("show")
    );
  };

  buildQuery = () => {
    // can use lodash/partition to one line
    const { filters } = this.props.filters;
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
        `limit=${this.state.limit}`,
        `offset=${this.state.offset}`
      )
      .filter(Boolean) // remove empty strings
      .join("&");
  };

  render() {
    return (
      <Fragment>
        {this.props.application.status === LOADING ? (
          <div>Loading ....</div>
        ) : (
          <Fetch
            key={`/api/movies?${this.buildQuery()}`}
            endpoint={`/api/movies?${this.buildQuery()}`}
            onSuccess={this.props.movies.concat}
            debounce={400}
          >
            {() => (
              <Fragment>
                <Fetch endpoint="/api/movies?limit=0" load>
                  {({ data }) =>
                    data ? (
                      <div>There are {data.count} movies/tvshows</div>
                    ) : (
                      <div>nope</div>
                    )
                  }
                </Fetch>
                Display {this.props.movies.movies.length} of{" "}
                {this.props.movies.count} found movies/tvshows
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={this.addMovie}
                >
                  Add new
                </button>
                <MoviesFilter />
                <MovieForm
                  key={
                    this.state.movie
                      ? this.state.movie._id
                      : this.state.movieFormKey
                  }
                  movie={this.state.movie}
                  onClose={this.onCloseEditMovie}
                  onAdd={movie => this.props.movies.add(movie)}
                  onUpdate={movie => this.props.movies.update(movie._id, movie)}
                />
                <div className="movies">
                  {this.props.movies.movies.map(movie => (
                    <MovieCard
                      key={movie._id}
                      movie={movie}
                      onChange={movie =>
                        this.props.movies.update(movie._id, movie)
                      }
                      onDelete={_ =>
                        this.props.movies.update(movie._id, undefined)
                      }
                      onEdit={() => this.editMovie(movie)}
                    />
                  ))}
                </div>
                <div className="text-center m-3">
                  <button
                    onClick={this.next}
                    className="btn btn-primary btn-lg"
                  >
                    Load more
                  </button>
                </div>
                )}
              </Fragment>
            )}
          </Fetch>
        )}
      </Fragment>
    );
  }
}

export const List = withMoviesFilter(
  withApplication(withMovies(ListWithContext))
);
