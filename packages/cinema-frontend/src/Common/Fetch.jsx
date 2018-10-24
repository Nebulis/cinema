import React, {Component, Fragment} from "react";
import debounce from "lodash/debounce";
import {withUser} from "../Login/UserContext";

const LOADING = Symbol("LOADING");
const LOADED = Symbol("LOADED");

const headers = (user) => ({
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
      status: this.props.load ? LOADING : LOADED,
      data: null,
    };

    // TODO probably not the best place to debounce
    this.debounceFetch = debounce(this.fetch, 400, {
      leading: false,
      trailing: true
    });
  }

  componentWillUnmount() {
    this.debounceFetch.cancel();
  }

  fetch() {
    return fetch(
      `${this.props.endpoint}`, {
        headers: headers(this.props.user),
      },
    )
      .then(handleResponse)
      .then(data => {
        this.setState({
          status: LOADED,
          data,
        });
        this.props.onSuccess && this.props.onSuccess(data);
      });
  }

  componentDidMount() {
    if (this.props.load) {
      this.debounceFetch();
    }
  }

  render() {
    return (
      <Fragment>
        {
          this.props.children({
            status: this.state.status,
            data: this.state.data,
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
