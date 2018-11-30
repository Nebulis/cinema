import React from "react";
import { getTags } from "./Common/TagAPI";

export const ApplicationContext = React.createContext();
export const withApplication = Component => props => (
  <ApplicationContext.Consumer>
    {application => <Component {...props} application={application} />}
  </ApplicationContext.Consumer>
);

export const LOADING = Symbol();
export const LOADED = Symbol();

export class ApplicationProvider extends React.Component {
  set = field => fn => {
    this.setState(state => ({ ...state, [field]: fn(state[field]) }));
  };

  componentDidMount() {
    const options = {
      headers: {
        Authorization: `Bearer ${this.props.token}`
      }
    };

    const handleResponse = response => {
      if (response.ok) return response.json();
      throw new Error("Fetch fail");
    };
    Promise.all([
      fetch("/api/movies/genre", options).then(handleResponse),
      fetch("/api/movies/type", options).then(handleResponse),
      getTags(this.props),
      fetch("/api/movies/years", options).then(handleResponse)
    ]).then(([genres, types, tags, years]) => {
      this.setState({
        genres,
        types,
        tags,
        years,
        status: LOADED
      });
    });
  }
  state = {
    genres: [],
    types: [],
    tags: [],
    years: [],
    status: LOADING,
    set: this.set
  };

  render() {
    return <ApplicationContext.Provider value={this.state}>{this.props.children}</ApplicationContext.Provider>;
  }
}
