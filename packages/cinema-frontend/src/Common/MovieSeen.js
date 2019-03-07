import React from "react";

export const MovieSeen = ({ seen, onClick, partial = false }) => (
  <i
    className="fas fa-eye"
    style={{
      color: partial && !seen ? "var(--warning)" : seen ? "var(--success)" : "",
      cursor: "pointer"
    }}
    onClick={onClick}
    title={seen ? "Mark as not seen" : "Mark as seen"}
  />
);
