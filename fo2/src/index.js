import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import registerServiceWorker from "./registerServiceWorker";
import { ApplicationProvider } from "./ApplicationContext";
import { UserProvider, UserContext } from "./Login/UserContext";
import { Login } from "./Login/Login";

ReactDOM.render(
  <UserProvider>
    <UserContext>
      {({ token }) =>
        token ? (
          <ApplicationProvider token={token}>
            <App />
          </ApplicationProvider>
        ) : (
          <Login />
        )
      }
    </UserContext>
  </UserProvider>,
  document.getElementById("root")
);
registerServiceWorker();
