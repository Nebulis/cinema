import React, { useContext, useState } from "react";
import "./Notification.css";
import { NotificationContext } from "./NotificationContext";

export const Notification = ({ index, notification }) => {
  const [animateProgress, setAnimateProgress] = useState(false);
  const [notificationOut, setNotificationOut] = useState(false);
  const { dispatch } = useContext(NotificationContext);
  return (
    <div
      className={`notification ${notification.type} ${notificationOut ? "out" : "in"}`}
      onAnimationEnd={event => {
        if (event.animationName === "bounceIn") {
          setAnimateProgress(true);
        } else if (event.animationName === "bounceOut") {
          dispatch({ type: "CLOSE", payload: { id: notification.id } });
        }
      }}
    >
      <div className="notification-content">{notification.content}</div>
      <div
        className={`notification-progress-bar progress-bar-striped ${animateProgress ? "animate" : ""}`}
        style={notificationOut ? { width: "0" } : {}}
        onAnimationEnd={() => setNotificationOut(true)}
      />
    </div>
  );
};
