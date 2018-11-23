import React from "react";
import "./Tag.css";

const invertColor = hex => {
  if (hex.indexOf("#") === 0) {
    hex = hex.slice(1);
  }

  const red = parseInt(hex.slice(0, 2), 16),
    green = parseInt(hex.slice(2, 4), 16),
    blue = parseInt(hex.slice(4, 6), 16);
  return red * 0.299 + green * 0.587 + blue * 0.114 > 186
    ? "#000000"
    : "#FFFFFF";
};

export const Tag = ({
  color,
  label,
  big,
  className = "",
  style = {},
  onClick = () => void 0
}) => (
  <span
    className={`tag ${big ? "big" : ""} ${className}`}
    style={{
      backgroundColor: color,
      color: `${invertColor(color)}`,
      ...style
    }}
    onClick={onClick}
  >
    {label}
  </span>
);
