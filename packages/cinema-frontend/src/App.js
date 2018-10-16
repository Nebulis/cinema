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
        productionYear: "",
        genres: [],
        types: [],
        seen: false,
        unseen: false,
        netflix: false,
        unnetflix: false
      },
      movie: null,
      index: -1
    };
    this.onInput = this.onInput.bind(this);
    this.onInputWithoutEvent = this.onInputWithoutEvent.bind(this);
    this.onSeen = this.onSeen.bind(this);
    this.onCloseEditMovie = this.onCloseEditMovie.bind(this);
    this.editMovie = this.editMovie.bind(this);
    this.addMovie = this.addMovie.bind(this);
  }

  componentDidMount() {}

  onCloseEditMovie() {
    this.setState({ movie: null, index: -1 });
  }

  editMovie(movie, index) {
    this.setState({ movie, index }, () =>
      // eslint-disable-next-line no-undef
      $("#movie-creator-updator").modal("show")
    );
  }

  addMovie() {
    this.setState({ movie: null, index: -1 }, () =>
      // eslint-disable-next-line no-undef
      $("#movie-creator-updator").modal("show")
    );
  }

  onInput(name, transform = data => data) {
    return event =>
      this.setState({
        filters: {
          ...this.state.filters,
          [name]: transform(event.target.value)
        }
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
                      type="number"
                      value={this.state.productionYear}
                      onInput={this.onInput("productionYear", data =>
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
                <Fetch endpoint={`/api/movies?${this.buildQuery()}`}>
                  {({ data, onChange }) => (
                    <Fragment>
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={this.addMovie}
                      >
                        Add new
                      </button>
                      <MovieForm
                        movie={this.state.movie}
                        onClose={this.onCloseEditMovie}
                        onAdd={movie => onChange(movie)}
                        onUpdate={movie => onChange(movie, this.state.index)}
                      />
                      <div className="movies">
                        {data.map((movie, index) => (
                          <Movie
                            key={movie._id}
                            movie={movie}
                            onChange={movie => onChange(movie, index)}
                            onDelete={_ => onChange(undefined, index)}
                            onEdit={() => this.editMovie(movie, index)}
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
