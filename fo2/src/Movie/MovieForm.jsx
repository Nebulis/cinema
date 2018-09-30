import React from "react";
import { SingleDownshift } from "../Common/SingleDownshift";
import { ApplicationContext, LOADING } from "../ApplicationContext";
import isEmpty from "lodash/isEmpty";

export class MovieForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      title: "",
      genre: "",
      type: "",
      season: ""
    };
    this.onInput = this.onInput.bind(this);
    this.onSelect = this.onSelect.bind(this);
    this.valid = this.valid.bind(this);
    this.onAdd = this.onAdd.bind(this);
  }

  componentDidMount() {
    // eslint-disable-next-line no-undef
    $("#movie-creator-updator").on("hide.bs.modal", this.props.onClose);
  }

  componentDidUpdate() {
    if (this.props.movie) {
      // eslint-disable-next-line no-undef
      $("#movie-creator-updator").modal("show");
    }
  }

  valid() {
    return (
      !isEmpty(this.state.title) &&
      !isEmpty(this.state.genre) &&
      !isEmpty(this.state.type) &&
      (this.state.type !== "Série" ||
        (this.state.type === "Série" && !isEmpty(this.state.season)))
    );
  }

  onAdd() {
    fetch("/api/movies", {
      method: "POST",
      body: JSON.stringify(this.state),
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      }
    })
      .then(data => data.json())
      .then(data => {
        this.props.onAdd({ ...this.state, ...data });
        // eslint-disable-next-line no-undef
        $("#movie-creator-updator").modal("hide");
      });
  }

  onInput(field) {
    return event => this.setState({ [field]: event.target.value });
  }

  onSelect(field) {
    return value => this.setState({ [field]: value });
  }

  render() {
    const { movie } = this.props;
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
                        value={this.state.title}
                      />
                    </div>
                    <div className="form-group">
                      <label>Genre</label>
                      <SingleDownshift
                        placeholder="Genre"
                        items={genres}
                        onChange={this.onSelect("genre")}
                      />
                    </div>
                    <div className="form-row">
                      <div
                        className={`form-group ${
                          this.state.type === "Série" ? "col-md-8" : "col-md-12"
                        }`}
                      >
                        <label>Type</label>
                        <SingleDownshift
                          placeholder="Types"
                          items={types}
                          onChange={this.onSelect("type")}
                        />
                      </div>
                      {this.state.type === "Série" ? (
                        <div className="form-group col-md-4">
                          <label htmlFor="season">Season</label>
                          <input
                            type="number"
                            className="form-control"
                            id="season"
                            aria-describedby="season"
                            placeholder="Enter season"
                            onChange={this.onInput("season")}
                            value={this.state.season}
                          />
                        </div>
                      ) : (
                        undefined
                      )}
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
                      onClick={this.onAdd}
                    >
                      {movie ? "Update" : "Save"}
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
