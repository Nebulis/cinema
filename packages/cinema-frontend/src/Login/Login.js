import React, { Component } from "react";
import { LOGIN_FAILED, withUser } from "./UserContext";

class LoginWithContext extends Component {
  state = {
    password: ""
  };

  render() {
    return (
      <div>
        {this.props.user.status === LOGIN_FAILED ? (
          <div className="alert alert-danger" role="alert">
            Login failed
          </div>
        ) : (
          undefined
        )}
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="text"
            className="form-control"
            id="password"
            aria-describedby="password"
            placeholder="Enter password"
            value={this.state.password}
            onChange={event => this.setState({ password: event.target.value })}
            onKeyDown={event => {
              if (event.key === "Enter")
                this.props.user.login(this.state.password);
            }}
          />
        </div>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => this.props.user.login(this.state.password)}
        >
          Submit
        </button>
      </div>
    );
  }
}

export const Login = withUser(LoginWithContext);
