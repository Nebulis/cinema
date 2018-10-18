import React, { Component, Fragment } from "react";

export class Accordion extends Component {
  state = {
    open: false,
    toggle: this.toggle.bind(this)
  };

  toggle() {
    this.setState({ open: !this.state.open });
  }

  render() {
    return <Fragment>{this.props.children(this.state)}</Fragment>;
  }
}
