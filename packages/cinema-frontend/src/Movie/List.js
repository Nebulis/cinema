import React, { Component, Fragment, StrictMode } from "react";
import { MovieCard } from "./MovieCard";
import isArray from "lodash/isArray";
import {
  AsyncMultiDownshift,
  AsyncMultiDownshiftwithReverse
} from "../Common/AsyncMultiDownshift";
import { MovieForm } from "./MovieForm";
import { LOADING, withApplication } from "../ApplicationContext";
import { Fetch } from "../Common/Fetch";
import { withMovies } from "./MoviesContext";

export class ListWithContext extends Component {
  constructor(props) {
    super(props);
    const offset = this.props.movies.movies.length / 30; // quickfix ... otherwise reset to 0 when navigate back

    this.state = {
      // I will need to save filters in context as navigating empty it
      filters: {
        title: "",
        productionYear: "",
        genres: [],
        types: [],
        seen: false,
        unseen: false,
        netflix: false,
        unnetflix: false,
        limit: 30,
        offset: offset ? offset - 1 : offset // first page must be 0 not -1
      },
      more: false, // hmmmm for offset ....
      movie: null,
      movieFormKey: 0
    };
  }
  next = () => {
    this.setState({
      more: true,
      filters: { ...this.state.filters, offset: this.state.filters.offset + 1 }
    });
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

  onInput = (name, transform = data => data) => {
    return event => {
      this.props.movies.invalidate();
      this.setState({
        filters: {
          ...this.state.filters,
          [name]: transform(event.target.value)
        }
      });
    };
  };

  onInputWithoutEvent = name => {
    return value => {
      this.props.movies.invalidate();
      this.setState({
        filters: { ...this.state.filters, [name]: value }
      });
    };
  };

  onSeen = name => {
    return () => {
      this.props.movies.invalidate();
      this.setState({
        filters: { ...this.state.filters, [name]: !this.state.filters[name] }
      });
    };
  };

  buildQuery = () => {
    // can use lodash/partition to one line
    const genres = this.state.filters.genres
      .filter(genre => genre[1])
      .map(genre => genre[0]);
    const notGenres = this.state.filters.genres
      .filter(genre => !genre[1])
      .map(genre => genre[0]);
    return Object.keys(this.state.filters)
      .filter(key => key !== "genres") // handle genres manually)
      .filter(
        key =>
          (!isArray(this.state.filters[key]) && this.state.filters[key]) ||
          (isArray(this.state.filters[key]) &&
            this.state.filters[key].length > 0)
      )
      .map(key => `${key}=${this.state.filters[key]}`)
      .concat(
        genres.length > 0 ? `genres=${genres.join(",")}` : "",
        notGenres.length > 0 ? `notGenres=${notGenres.join(",")}` : ""
      )
      .filter(Boolean) // remove empty strings
      .join("&");
  };

  render() {
    return (
      <StrictMode>
        {this.props.application.status === LOADING ? (
          <div>Loading ....</div>
        ) : (
          <Fragment>
            <div>
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
            </div>
            <form className="form-inline">
              <div className="form-group mx-sm-3 mb-2">
                <input
                  type="number"
                  value={this.state.productionYear}
                  onChange={this.onInput("productionYear", data =>
                    parseInt(data, 10)
                  )}
                  max={2200}
                  placeholder="YYYY"
                  className="form-control"
                  style={{ width: "90px" }}
                />
              </div>
              <div className="form-group mx-sm-3 mb-2">
                <input
                  type="text"
                  value={this.state.title}
                  onInput={this.onInput("title")}
                  placeholder="Title"
                  className="form-control"
                />
              </div>
              <div
                className="form-group mx-sm-3 mb-2"
                style={{ maxWidth: "300px" }}
              >
                <AsyncMultiDownshiftwithReverse
                  placeholder="Genre"
                  handleChange={this.onInputWithoutEvent("genres")}
                  items={this.props.application.genres}
                />
              </div>
              <div
                className="form-group mx-sm-3 mb-2"
                style={{ maxWidth: "300px" }}
              >
                <AsyncMultiDownshift
                  placeholder="Type"
                  handleChange={this.onInputWithoutEvent("types")}
                  items={this.props.application.types}
                />
              </div>
              <div className="form-group mx-sm-3 mb-2">
                <i
                  className="fas fa-eye"
                  style={{
                    color: this.state.filters.seen ? "var(--success)" : "",
                    cursor: "pointer"
                  }}
                  onClick={this.onSeen("seen")}
                />
                <i
                  className="fas fa-eye-slash"
                  style={{
                    color: this.state.filters.unseen ? "var(--success)" : "",
                    cursor: "pointer"
                  }}
                  onClick={this.onSeen("unseen")}
                />
              </div>
              <div className="form-group mx-sm-3 mb-2">
                <span
                  className="fa-stack fa-1g"
                  onClick={this.onSeen("netflix")}
                  style={{
                    cursor: "pointer"
                  }}
                >
                  <i
                    className="far fa-circle fa-stack-2x"
                    style={{
                      color: this.state.filters.netflix
                        ? "var(--danger)"
                        : "black"
                    }}
                  />
                  <i className="fab fa-neos fa-stack-1x" />
                </span>
                <span
                  className="fa-stack fa-1g"
                  onClick={this.onSeen("unnetflix")}
                  style={{
                    cursor: "pointer"
                  }}
                >
                  <i
                    className="fas fa-ban fa-stack-2x"
                    style={{
                      color: this.state.filters.unnetflix
                        ? "var(--danger)"
                        : "black"
                    }}
                  />
                  <i className="fab fa-neos fa-stack-1x" />
                </span>
              </div>
            </form>
            <Fetch
              key={`/api/movies?${this.buildQuery()}`}
              endpoint={`/api/movies?${this.buildQuery()}`}
              onSuccess={this.props.movies.concat}
              load={this.state.more || this.props.movies.movies.length === 0}
            >
              {() => (
                <Fragment>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={this.addMovie}
                  >
                    Add new
                  </button>
                  <MovieForm
                    key={
                      this.state.movie
                        ? this.state.movie._id
                        : this.state.movieFormKey
                    }
                    movie={this.state.movie}
                    onClose={this.onCloseEditMovie}
                    onAdd={movie => this.props.movies.add(movie)}
                    onUpdate={movie =>
                      this.props.movies.update(movie._id, movie)
                    }
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
                </Fragment>
              )}
            </Fetch>
          </Fragment>
        )}
      </StrictMode>
    );
  }
}

export const List = withApplication(withMovies(ListWithContext));
