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
      data: null,
      limit: 30,
      offset: 0
    };

    this.debounceFetch = debounce(this.fetch, 400, {
      leading: false,
      trailing: true
    });

    this.onChange = this.onChange.bind(this);
    this.next = this.next.bind(this);
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

  fetch(append = false) {
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
    return fetch(
      `${this.props.endpoint}&limit=${this.state.limit}&offset=${
        this.state.offset
      }`,
      options
    )
      .then(handleResponse)
      .then(data => {
        this.setState({
          data: append ? [...this.state.data, ...data] : data,
          status: LOADED
        });
      });
  }
  next() {
    this.setState({ offset: this.state.offset + 1 }, () => this.fetch(true));
  }

  componentDidMount() {
    this.fetch();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.endpoint !== this.props.endpoint) {
      this.setState({ status: LOADING, offset: 0 });
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
            onDelete: this.onDelete,
            next: this.next
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
