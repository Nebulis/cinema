import React, { Component, Fragment } from "react";
import PropTypes from "prop-types";
import debounce from "lodash/debounce";
import { UserContext } from "../Login/UserContext";

const LOADING = Symbol("LOADING");
const LOADED = Symbol("LOADED");
/**
 * component that fetch data from the endpoint and notify that data has been fetched through onFetchSucceeded
 * dont reuse this in production :)
 */
class FetchWithContext extends Component {
  constructor(props) {
    super(props);
    this.state = {
      status: LOADING,
      data: null
    };

    this.debounceFetch = debounce(this.fetch, 400, {
      leading: false,
      trailing: true
    });

    this.onChange = this.onChange.bind(this);
  }

  onChange(updatedElement, index = -1) {
    if (index < 0) {
      this.setState({
        data: [updatedElement, ...this.state.data]
      });
    } else {
      const data = [...this.state.data];
      data[index] = updatedElement;
      this.setState({
        data: data.filter(Boolean)
      });
    }
  }

  fetch() {
    const options = {
      headers: {
        Authorization: `Bearer ${this.props.token}`
      }
    };

    const handleResponse = response => {
      if (response.ok) return response.json();
      throw new Error("Fetch fail");
    };
    // todo use signal to cancel
    return fetch(this.props.endpoint, options)
      .then(handleResponse)
      .then(data => {
        this.setState({
          data,
          status: LOADED
        });
      });
  }

  componentDidMount() {
    this.fetch();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.endpoint !== this.props.endpoint) {
      this.setState({ status: LOADING });
      this.debounceFetch();
    }
  }

  render() {
    return (
      <Fragment>
        {this.state.status === LOADING && <div>Loading ....</div>}
        {this.state.status === LOADED &&
          this.props.children({
            data: this.state.data,
            onChange: this.onChange,
            onDelete: this.onDelete
          })}
      </Fragment>
    );
  }
}

export const Fetch = props => (
  <UserContext>
    {({ token }) => <FetchWithContext token={token} {...props} />}
  </UserContext>
);

Fetch.propTypes = {
  endpoint: PropTypes.string.isRequired
};
