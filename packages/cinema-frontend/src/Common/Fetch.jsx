import React, { Component, Fragment } from "react";
import debounce from "lodash/debounce";
import { withUser } from "../Login/UserContext";

export const LOADING = Symbol("LOADING");
export const LOADED = Symbol("LOADED");

const headers = user => ({
  Accept: "application/json",
  "Content-Type": "application/json",
  Authorization: `Bearer ${user.token}`
});
const handleResponse = response => {
  if (response.ok) return response.json();
  throw new Error("Fetch fail");
};

class FetchWithContext extends Component {
  constructor(props) {
    super(props);
    this.state = {
      status: LOADING,
      data: undefined
    };

    // TODO probably not the best place to debounce
    this.debounceFetch = debounce(this.fetch, this.props.debounce || 0, {
      leading: false,
      trailing: true
    });
  }

  componentWillUnmount() {
    this.debounceFetch.cancel();
  }

  fetch() {
    return fetch(`${this.props.endpoint}`, {
      headers: headers(this.props.user)
    })
      .then(handleResponse)
      .then(data => {
        this.setState({
          status: LOADED,
          data
        });
        this.props.onSuccess && this.props.onSuccess(data);
      });
  }

  componentDidMount() {
    this.debounceFetch();
  }

  render() {
    return (
      <Fragment>
        {this.props.children({
          status: this.state.status,
          data: this.state.data
        })}
      </Fragment>
    );
  }
}

/**
 * - create a context that holds movies
 * - dont load if there is already sth in the context
 * - pass initial data to prevent fetch the api (if data, dont fetch on cDM)
 */

export const Fetch = withUser(FetchWithContext);
