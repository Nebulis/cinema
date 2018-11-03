import React from "react";

export const MovieSeen = ({ seen, onClick }) => (
  <i
    className="fas fa-eye"
    style={{
      color: seen ? "var(--success)" : "",
      cursor: "pointer"
    }}
    onClick={onClick}
  />
);
