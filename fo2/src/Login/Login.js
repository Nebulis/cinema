import React, { Component } from "react";
import { LOGIN_FAILED, UserContext } from "./UserContext";

export class Login extends Component {
  state = {
    password: ""
  };
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <UserContext>
        {({ login, status }) => (
          <div>
            {status === LOGIN_FAILED ? (
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
                onInput={event =>
                  this.setState({ password: event.target.value })
                }
                onKeyDown={event => {
                  if (event.key === "Enter") login(this.state.password);
                }}
              />
            </div>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => login(this.state.password)}
            >
              Submit
            </button>
          </div>
        )}
      </UserContext>
    );
  }
}
