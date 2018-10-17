import React from "react";
import { SingleDownshift } from "../Common/SingleDownshift";
import { ApplicationContext, LOADING } from "../ApplicationContext";
import isEmpty from "lodash/isEmpty";
import { UserContext } from "../Login/UserContext";
import { AsyncMultiDownshift } from "../Common/AsyncMultiDownshift";

const defaultState = {
  movie: {
    title: "",
    genre: [],
    type: "",
    season: "",
    productionYear: "",
    summary: ""
  }
};

const handleResponse = response => {
  if (response.ok) return response.json();
  throw new Error("Fetch fail");
};

class MovieFormWithContext extends React.Component {
  constructor(props) {
    super(props);
    this.state = defaultState;
    this.onInput = this.onInput.bind(this);
    this.onSelect = this.onSelect.bind(this);
    this.valid = this.valid.bind(this);
    this.add = this.add.bind(this);
    this.update = this.update.bind(this);
  }

  componentDidMount() {
    // eslint-disable-next-line no-undef
    $("#movie-creator-updator").on("hide.bs.modal", this.props.onClose);
  }

  componentDidUpdate() {
    if (this.props.movie && this.props.movie._id !== this.state.movie._id) {
      this.setState({ movie: this.props.movie });
    } else if (!this.props.movie && this.state.movie._id) {
      this.setState(defaultState);
    }
  }

  valid() {
    return (
      !isEmpty(this.state.movie.title) &&
      this.state.movie.genre.length > 0 &&
      !isEmpty(this.state.movie.type) &&
      (this.state.movie.type !== "Série" ||
        (this.state.movie.type === "Série" && this.state.movie.season > 0))
    );
  }

  add() {
    fetch("/api/movies", {
      method: "POST",
      body: JSON.stringify(this.state.movie),
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.props.token}`
      }
    })
      .then(handleResponse)
      .then(data => {
        this.props.onAdd({ ...this.state.movie, ...data });
        // eslint-disable-next-line no-undef
        $("#movie-creator-updator").modal("hide");
      });
  }

  update() {
    fetch(`/api/movies/${this.props.movie._id}`, {
      method: "PUT",
      body: JSON.stringify(this.state.movie),
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.props.token}`
      }
    })
      .then(handleResponse)
      .then(data => {
        this.props.onUpdate({ ...this.state.movie, ...data });
        // eslint-disable-next-line no-undef
        $("#movie-creator-updator").modal("hide");
      });
  }

  onInput(field, transform = data => data) {
    return event =>
      this.setState({
        movie: { ...this.state.movie, [field]: transform(event.target.value) }
      });
  }

  onSelect(field) {
    return value =>
      this.setState({ movie: { ...this.state.movie, [field]: value } });
  }

  render() {
    const { movie } = this.state;
    return (
      <ApplicationContext.Consumer>
        {({ status, types, genres }) =>
          status === LOADING ? (
            <div>Loading...</div>
          ) : (
            <div
              className="modal fade"
              id="movie-creator-updator"
              tabIndex="-1"
              role="dialog"
              data-show="true"
            >
              <div
                className="modal-dialog modal-dialog-centered"
                role="document"
              >
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">
                      {(movie && movie.title) || "New"}
                    </h5>
                    <button
                      type="button"
                      className="close"
                      data-dismiss="modal"
                      aria-label="Close"
                    >
                      <span aria-hidden="true">&times;</span>
                    </button>
                  </div>
                  <div className="modal-body">
                    <div className="form-group">
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
                    <div className="form-group">
                      <label>Genre</label>
                      <AsyncMultiDownshift
                        selectedItems={this.state.movie.genre}
                        placeholder="Genre"
                        items={genres}
                        handleChange={this.onSelect("genre")}
                      />
                    </div>
                    <div className="form-row">
                      <div
                        className={`form-group ${
                          this.state.movie.type === "Série"
                            ? "col-md-8"
                            : "col-md-12"
                        }`}
                      >
                        <label>Type</label>
                        <SingleDownshift
                          selectedItem={this.state.movie.type}
                          placeholder="Type"
                          items={types}
                          onChange={this.onSelect("type")}
                        />
                      </div>
                      {this.state.movie.type === "Série" ? (
                        <div className="form-group col-md-4">
                          <label htmlFor="season">Season</label>
                          <input
                            type="number"
                            className="form-control"
                            id="season"
                            aria-describedby="season"
                            placeholder="Enter season"
                            onChange={this.onInput("season")}
                            value={this.state.movie.season}
                          />
                        </div>
                      ) : (
                        undefined
                      )}
                    </div>
                    <div className="form-group">
                      <label htmlFor="production-year">Production Year</label>
                      <input
                        type="number"
                        className="form-control"
                        id="production-year"
                        aria-describedby="production year"
                        placeholder="Enter production year"
                        onChange={this.onInput("productionYear", data =>
                          parseInt(data, 10)
                        )}
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
                  </div>
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      data-dismiss="modal"
                    >
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
          )
        }
      </ApplicationContext.Consumer>
    );
  }
}

export const MovieForm = props => (
  <UserContext>
    {({ token }) => <MovieFormWithContext token={token} {...props} />}
  </UserContext>
);
