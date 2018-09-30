import React, { Component, Fragment } from "react";
import PropTypes from "prop-types";
import debounce from "lodash/debounce";

const LOADING = Symbol("LOADING");
const LOADED = Symbol("LOADED");
/**
 * component that fetch data from the endpoint and notify that data has been fetched through onFetchSucceeded
 * dont reuse this in production :)
 */
export class Fetch extends Component {
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
    this.onDelete = this.onDelete.bind(this);
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
        data
      });
    }
  }

  onDelete(index) {
    this.setState({
      data: this.state.data.filter((_, id) => index !== id)
    });
  }

  fetch() {
    // todo use signal to cancel
    return fetch(this.props.endpoint)
      .then(data => {
        return data.json();
      })
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

Fetch.propTypes = {
  endpoint: PropTypes.string.isRequired
};
