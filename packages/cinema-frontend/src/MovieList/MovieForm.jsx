import React, { Fragment } from "react";
import { SingleDownshift } from "../Common/SingleDownshift";
import { LOADING, withApplication } from "../ApplicationContext";
import isEmpty from "lodash/isEmpty";
import { AsyncMultiDownshift } from "../Common/AsyncMultiDownshift";
import { Accordion } from "../Common/Accordion";
import { withUser } from "../Login/UserContext";

const defaultState = {
  movie: {
    title: "",
    genre: [],
    type: "",
    productionYear: "",
    summary: ""
  },
  allocine: {
    movies: [],
    tvshows: []
  }
};

const headers = user => ({
  Accept: "application/json",
  "Content-Type": "application/json",
  Authorization: `Bearer ${user.token}`
});

const handleResponse = response => {
  if (response.ok) return response.json();
  throw new Error("Fetch fail");
};

class MovieFormWithContext extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      movie: props.movie ? props.movie : defaultState.movie,
      allocine: defaultState.allocine
    };
  }

  componentDidMount() {
    // eslint-disable-next-line no-undef
    $("#movie-creator-updator").on("hide.bs.modal", this.props.onClose);
  }

  valid = () => {
    return !isEmpty(this.state.movie.title) && this.state.movie.genre.length > 0 && !isEmpty(this.state.movie.type);
  };

  add = () => {
    fetch("/api/movies", {
      method: "POST",
      body: JSON.stringify(this.state.movie),
      headers: headers(this.props.user)
    })
      .then(handleResponse)
      .then(data => {
        this.props.onAdd({ ...this.state.movie, ...data });
        // eslint-disable-next-line no-undef
        $("#movie-creator-updator").modal("hide");
      });
  };

  update = () => {
    fetch(`/api/movies/${this.props.movie._id}`, {
      method: "PUT",
      body: JSON.stringify(this.state.movie),
      headers: headers(this.props.user)
    })
      .then(handleResponse)
      .then(data => {
        this.props.onUpdate({ ...this.state.movie, ...data });
        // eslint-disable-next-line no-undef
        $("#movie-creator-updator").modal("hide");
      });
  };

  search = () => {
    Promise.all([
      fetch(`/api/allocine?type=Film&title=${this.state.movie.title}`, {
        headers: headers(this.props.user)
      }).then(handleResponse),
      fetch(`/api/allocine?type=Série&title=${this.state.movie.title}`, {
        headers: headers(this.props.user)
      }).then(handleResponse)
    ]).then(([movies, tvshows]) => this.setState({ allocine: { movies, tvshows } }));
  };

  synchronizeMovieAllocine = idAllocine => {
    // if click on the currently selected movie, unselect it
    if (idAllocine === this.state.movie.idAllocine) {
      this.setState({
        movie: {
          ...this.state.movie,
          idAllocine: null
        }
      });
    } else {
      fetch(`/api/allocine/movie/${idAllocine}`, {
        headers: headers(this.props.user)
      })
        .then(handleResponse)
        .then(movie =>
          this.setState({
            movie: {
              ...this.state.movie,
              idAllocine,
              title: movie.title,
              genre: movie.genres.sort(),
              type: "Film",
              productionYear: movie.year,
              summary: movie.synopsis,
              fileUrl: movie.image
            }
          })
        );
    }
  };

  synchronizeTvShowAllocine = idAllocine => {
    // if click on the currently selected movie, unselect it
    if (idAllocine === this.state.movie.idAllocine) {
      this.setState({
        movie: {
          ...this.state.movie,
          idAllocine: null
        }
      });
    } else {
      fetch(`/api/allocine/serie/${idAllocine}`, {
        headers: headers(this.props.user)
      })
        .then(handleResponse)
        .then(tvseries =>
          this.setState({
            movie: {
              ...this.state.movie,
              idAllocine,
              title: tvseries.title,
              genre: tvseries.genres.sort(),
              type: "Série",
              productionYear: tvseries.year,
              summary: tvseries.synopsis,
              fileUrl: tvseries.image
            }
          })
        );
    }
  };

  onInput = (field, transform = data => data) => {
    return event =>
      this.setState({
        movie: { ...this.state.movie, [field]: transform(event.target.value) }
      });
  };

  onSelect = field => {
    return value => this.setState({ movie: { ...this.state.movie, [field]: value } });
  };

  render() {
    const { movie } = this.state;
    return (
      <Fragment>
        {this.props.application.status === LOADING ? (
          <></>
        ) : (
          <div
            className="movie-modal modal fade movie-form"
            id="movie-creator-updator"
            tabIndex="-1"
            role="dialog"
            data-show="true"
          >
            <div className="modal-dialog modal-dialog-centered" role="document">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">{(movie && movie.title) || "New"}</h5>
                  <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                  </button>
                </div>
                <div className="modal-body">
                  <div className="form-row">
                    <div className="form-group col-11">
                      <label htmlFor="title">Title</label>
                      <input
                        type="text"
                        className="form-control"
                        id="title"
                        aria-describedby="title"
                        placeholder="Enter title"
                        onChange={this.onInput("title")}
                        value={this.state.movie.title}
                      />
                    </div>
                    <div className="form-group col-1 text-center">
                      <i
                        title="Search in allocine"
                        className="fab fa-angular fa-2x"
                        style={{ cursor: "pointer", color: "#fecc00", paddingTop: "35px" }}
                        onClick={this.search}
                      />
                    </div>
                  </div>
                  {this.state.allocine.movies.length > 0 ? (
                    <Accordion>
                      {({ open, toggle }) => {
                        return (
                          <Fragment>
                            <div onClick={toggle} style={{ cursor: "pointer" }}>
                              {this.state.allocine.movies.length} movies
                              {open ? (
                                <i className="fas fa-chevron-up" title="Hide" />
                              ) : (
                                <i className="fas fa-chevron-down" title="Show" />
                              )}
                            </div>
                            <div
                              className="row"
                              style={{ overflowX: "scroll", display: open ? "flex" : "none", flexWrap: "nowrap" }}
                            >
                              {this.state.allocine.movies.map(movie => (
                                <div
                                  key={movie.code}
                                  className={`col-2 allocine-movie ${
                                    movie.code === this.state.movie.idAllocine ? "selected" : ""
                                  }`}
                                  onClick={() => this.synchronizeMovieAllocine(movie.code)}
                                >
                                  {movie.code === this.state.movie.idAllocine ? (
                                    <i
                                      className="fas fa-check-circle selected-movie-icon fa-2x"
                                      title="Movie selected"
                                    />
                                  ) : null}
                                  <div>
                                    {movie.title} - {movie.year}
                                  </div>
                                  <div>
                                    {movie.image ? (
                                      <img src={movie.image} alt="movie poster" style={{ width: "100%" }} />
                                    ) : null}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </Fragment>
                        );
                      }}
                    </Accordion>
                  ) : null}
                  {this.state.allocine.tvshows.length > 0 ? (
                    <Accordion>
                      {({ open, toggle }) => {
                        return (
                          <Fragment>
                            <div onClick={toggle} style={{ cursor: "pointer" }}>
                              {this.state.allocine.tvshows.length} tv shows
                              {open ? (
                                <i className="fas fa-chevron-up" title="Hide" />
                              ) : (
                                <i className="fas fa-chevron-down" title="Show" />
                              )}
                            </div>
                            <div
                              className="row"
                              style={{ overflowX: "scroll", display: open ? "flex" : "none", flexWrap: "nowrap" }}
                            >
                              {this.state.allocine.tvshows.map(tvshow => (
                                <div
                                  key={tvshow.code}
                                  className={`col-2 allocine-movie ${
                                    tvshow.code === this.state.movie.idAllocine ? "selected" : ""
                                  }`}
                                  onClick={() => this.synchronizeTvShowAllocine(tvshow.code)}
                                >
                                  {tvshow.code === this.state.movie.idAllocine ? (
                                    <i
                                      className="fas fa-check-circle selected-movie-icon fa-2x"
                                      title="Tv show selected"
                                    />
                                  ) : null}
                                  <div>
                                    {tvshow.title} - {tvshow.year}
                                  </div>
                                  <div>
                                    {tvshow.image ? (
                                      <img src={tvshow.image} alt="tvshow poster" style={{ width: "100%" }} />
                                    ) : null}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </Fragment>
                        );
                      }}
                    </Accordion>
                  ) : null}
                  <div className="form-group">
                    <label>Genre</label>
                    <AsyncMultiDownshift
                      selectedItems={this.state.movie.genre}
                      placeholder="Genre"
                      items={this.props.application.genres}
                      handleChange={this.onSelect("genre")}
                    />
                  </div>
                  <div className="form-group">
                    <label>Type</label>
                    <SingleDownshift
                      selectedItem={this.state.movie.type}
                      placeholder="Type"
                      items={this.props.application.types}
                      onChange={this.onSelect("type")}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="production-year">Production Year</label>
                    <input
                      type="number"
                      className="form-control"
                      id="production-year"
                      aria-describedby="production year"
                      placeholder="Enter production year"
                      onChange={this.onInput("productionYear", data => parseInt(data, 10))}
                      value={this.state.movie.productionYear}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="summary">Summary</label>
                    <textarea
                      className="form-control"
                      id="summary"
                      aria-describedby="summary"
                      placeholder="Enter summary"
                      onChange={this.onInput("summary")}
                      value={this.state.movie.summary}
                    />
                  </div>
                  {this.state.movie.idAllocine && (
                    <div className="d-flex justify-content-center">
                      <a
                        href={
                          this.state.movie.type === "Film"
                            ? `http://www.allocine.fr/film/fichefilm_gen_cfilm=${this.state.movie.idAllocine}.html`
                            : `http://www.allocine.fr/series/ficheserie_gen_cserie=${this.state.movie.idAllocine}.html`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-warning"
                      >
                        Go to allocine
                      </a>
                    </div>
                  )}
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" data-dismiss="modal">
                    Close
                  </button>
                  <button
                    type="button"
                    disabled={!this.valid()}
                    className="btn btn-primary"
                    onClick={this.state.movie._id ? this.update : this.add}
                  >
                    {movie._id ? "Update" : "Save"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </Fragment>
    );
  }
}

export const MovieForm = withApplication(withUser(MovieFormWithContext));
