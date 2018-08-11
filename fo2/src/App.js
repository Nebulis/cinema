import React, { Component, StrictMode } from "react";
import "./App.css";
import { Fetch } from "./Common/Fetch";
import { Movie } from "./Movie/Movie";
import { MultiDownshift } from "./Common/MultiDownshift";

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      filters: {
        title: ""
      },
      seen: false, // hummmmmmmmmmmmmm ugly right ?
      unseen: false // hummmmmmmmmmmmmm ugly right ?
    };
    this.onInput = this.onInput.bind(this);
    this.onSeen = this.onSeen.bind(this);
  }

  onInput(name) {
    return event =>
      this.setState({
        filters: { ...this.state.filters, [name]: event.target.value }
      });
  }

  onSeen(name) {
    return () => this.setState({ [name]: !this.state[name] });
  }

  buildQuery() {
    const filters = Object.keys(this.state.filters)
      .filter(key => this.state.filters[key])
      .map(key => `${key}=${this.state.filters[key]}`);
    if (this.state.seen && !this.state.unseen) filters.push("seen=true");
    if (!this.state.seen && this.state.unseen) filters.push("seen=false");

    return filters.join("&");
  }

  render() {
    return (
      <StrictMode>
        <input
          type="text"
          value={this.state.title}
          onInput={this.onInput("title")}
          placeholder="Title"
        />
        <i
          className="fas fa-eye"
          style={{ color: this.state.seen ? "var(--success)" : "" }}
          onClick={this.onSeen("seen")}
        />{" "}
        <i
          className="fas fa-eye-slash"
          style={{ color: this.state.unseen ? "var(--success)" : "" }}
          onClick={this.onSeen("unseen")}
        />
        <div className="movies">
          <Fetch endpoint={`/api/movies?${this.buildQuery()}`}>
            {data => data.map(movie => <Movie key={movie._id} movie={movie} />)}
          </Fetch>
        </div>
      </StrictMode>
    );
  }

  renderMulti() {}
}

export default App;
