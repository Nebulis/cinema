import React, { useContext } from "react";
import { NotificationContext } from "./NotificationContext";
import { Notification } from "./Notification";
import "./NotificationList.css";

export const NotificationsList = () => {
  const { notifications } = useContext(NotificationContext);
  return (
    <div className="notification-list">
      {notifications.map((notification, index) => (
        <Notification
          key={notification.id}
          index={index}
          notification={notification}
        />
      ))}
    </div>
  );
};
