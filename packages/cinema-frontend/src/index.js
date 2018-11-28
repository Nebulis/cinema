import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import { ApplicationProvider } from "./ApplicationContext";
import { UserProvider, UserContext } from "./Login/UserContext";
import { Login } from "./Login/Login";
import { MoviesProvider } from "./Common/MoviesContext";
import { NotificationProvider } from "./Notifications/NotificationContext";

ReactDOM.render(
  <UserProvider>
    <UserContext.Consumer>
      {({ token }) =>
        token ? (
          <ApplicationProvider token={token}>
            <MoviesProvider>
              <NotificationProvider>
                <App />
              </NotificationProvider>
            </MoviesProvider>
          </ApplicationProvider>
        ) : (
          <Login />
        )
      }
    </UserContext.Consumer>
  </UserProvider>,
  document.getElementById("root")
);
