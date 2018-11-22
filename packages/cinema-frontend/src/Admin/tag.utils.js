const random = max => {
  return Math.floor(Math.random() * Math.floor(max));
};
export const generateColor = () => {
  return `#${random(256)
    .toString(16)
    .padStart(2, "0")}${random(256)
    .toString(16)
    .padStart(2, "0")}${random(256)
    .toString(16)
    .padStart(2, "0")}`;
};
