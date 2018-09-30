import React, { Component, Fragment, StrictMode } from "react";
import "./App.css";
import { Fetch } from "./Common/Fetch";
import { Movie } from "./Movie/Movie";
import isArray from "lodash/isArray";
import { AsyncMultiDownshift } from "./Common/AsyncMultiDownshift";
import { MovieForm } from "./Movie/MovieForm";
import { ApplicationContext, LOADING } from "./ApplicationContext";

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      filters: {
        title: "",
        genres: [],
        types: [],
        seen: false,
        unseen: false
      },
      movie: null
    };
    this.onInput = this.onInput.bind(this);
    this.onInputWithoutEvent = this.onInputWithoutEvent.bind(this);
    this.onSeen = this.onSeen.bind(this);
    this.onCloseEditMovie = this.onCloseEditMovie.bind(this);
    this.editMovie = this.editMovie.bind(this);
  }

  componentDidMount() {}

  onCloseEditMovie() {
    this.setState({ movie: null });
  }

  editMovie(movie) {
    this.setState({ movie });
  }

  onInput(name) {
    return event =>
      this.setState({
        filters: { ...this.state.filters, [name]: event.target.value }
      });
  }

  onInputWithoutEvent(name) {
    return value =>
      this.setState({
        filters: { ...this.state.filters, [name]: value }
      });
  }

  onSeen(name) {
    return () =>
      this.setState({
        filters: { ...this.state.filters, [name]: !this.state.filters[name] }
      });
  }

  buildQuery() {
    const filters = Object.keys(this.state.filters)
      .filter(
        key =>
          (!isArray(this.state.filters[key]) && this.state.filters[key]) ||
          (isArray(this.state.filters[key]) &&
            this.state.filters[key].length > 0)
      )
      .map(key => `${key}=${this.state.filters[key]}`);

    return filters.join("&");
  }

  render() {
    return (
      <StrictMode>
        <ApplicationContext>
          {({ status, genres, types }) =>
            status === LOADING ? (
              <div>Loading ....</div>
            ) : (
              <Fragment>
                <form className="form-inline">
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
                    <AsyncMultiDownshift
                      placeholder="Genre"
                      handleChange={this.onInputWithoutEvent("genres")}
                      items={genres}
                    />
                  </div>
                  <div
                    className="form-group mx-sm-3 mb-2"
                    style={{ maxWidth: "300px" }}
                  >
                    <AsyncMultiDownshift
                      placeholder="Type"
                      handleChange={this.onInputWithoutEvent("types")}
                      items={types}
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
                        color: this.state.filters.unseen
                          ? "var(--success)"
                          : "",
                        cursor: "pointer"
                      }}
                      onClick={this.onSeen("unseen")}
                    />
                  </div>
                </form>
                <Fetch endpoint={`/api/movies?${this.buildQuery()}`}>
                  {({ data, onChange, onDelete }) => (
                    <Fragment>
                      <button
                        type="button"
                        className="btn btn-primary"
                        data-toggle="modal"
                        data-target="#movie-creator-updator"
                      >
                        Add new
                      </button>
                      <MovieForm
                        movie={this.state.movie}
                        onClose={this.onCloseEditMovie}
                        onAdd={movie => onChange(movie)}
                      />
                      <div className="movies">
                        {data.map((movie, index) => (
                          <Movie
                            key={movie._id}
                            movie={movie}
                            onChange={movie => onChange(movie, index)}
                            onDelete={_ => onChange(undefined, index)}
                            onEdit={() => this.editMovie(movie)}
                          />
                        ))}
                      </div>
                    </Fragment>
                  )}
                </Fetch>
              </Fragment>
            )
          }
        </ApplicationContext>
      </StrictMode>
    );
  }
}

export default App;
