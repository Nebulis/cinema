import { useState } from "react";

export const useToggle = (initialValue = false) => {
  const [value, setValue] = useState(initialValue);
  const toggle = () => setValue(!value);
  return [value, toggle];
};

export const useInput = (initialValue = "") => {
  const [value, setValue] = useState(initialValue);
  return [
    {
      value,
      onChange: event => setValue(event.target.value)
    },
    setValue
  ];
};
