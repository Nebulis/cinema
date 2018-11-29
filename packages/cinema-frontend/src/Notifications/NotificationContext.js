import React, { useReducer } from "react";

export const NotificationContext = React.createContext();

const reducer = (state = [], action) => {
  switch (action.type) {
    case "ADD":
      return [...state, { ...action.payload, id: new Date().getTime() }];
    case "CLOSE":
      return state.filter(notification => notification.id !== action.payload.id);
    default:
      return state;
  }
};

export const NotificationProvider = props => {
  const [state, dispatch] = useReducer(reducer, []);
  return (
    <NotificationContext.Provider value={{ notifications: state, dispatch }}>
      {props.children}
    </NotificationContext.Provider>
  );
};
