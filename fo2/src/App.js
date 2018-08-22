import React, { Component, StrictMode } from "react";
import "./App.css";
import { Fetch } from "./Common/Fetch";
import { Movie } from "./Movie/Movie";
import isArray from "lodash/isArray";
import { AsyncMultiDownshift } from "./Common/AsyncMultiDownshift";

class App extends Component {
  inputType = React.createRef();
  inputGenre = React.createRef();
  constructor(props) {
    super(props);
    this.state = {
      filters: {
        title: "",
        genres: [],
        types: [],
        seen: false,
        unseen: false
      }
    };
    this.onInput = this.onInput.bind(this);
    this.onInputWithoutEvent = this.onInputWithoutEvent.bind(this);
    this.onSeen = this.onSeen.bind(this);
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
        <button
          type="button"
          className="btn btn-primary"
          data-toggle="modal"
          data-target="#exampleModalCenter"
        >
          Launch demo modal
        </button>
        <div
          className="modal fade"
          id="exampleModalCenter"
          tabIndex="-1"
          role="dialog"
          aria-labelledby="exampleModalCenterTitle"
          aria-hidden="true"
        >
          <div className="modal-dialog modal-dialog-centered" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" id="exampleModalLongTitle">
                  Modal title
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
              <div className="modal-body">...</div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  data-dismiss="modal"
                >
                  Close
                </button>
                <button type="button" className="btn btn-primary">
                  Save changes
                </button>
              </div>
            </div>
          </div>
        </div>
        <form className="form-inline" style={{ flex: "0 0 25em;" }}>
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
              input={this.inputGenre}
              handleChange={this.onInputWithoutEvent("genres")}
              endpoint="/api/movies/genre"
            />
          </div>
          <div
            className="form-group mx-sm-3 mb-2"
            style={{ maxWidth: "300px" }}
          >
            <AsyncMultiDownshift
              placeholder="Type"
              input={this.inputType}
              handleChange={this.onInputWithoutEvent("types")}
              endpoint="/api/movies/type"
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
        </form>
        <div className="movies">
          <Fetch endpoint={`/api/movies?${this.buildQuery()}`}>
            {data => data.map(movie => <Movie key={movie._id} movie={movie} />)}
          </Fetch>
        </div>
      </StrictMode>
    );
  }
}

export default App;
