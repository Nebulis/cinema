import React, { useEffect, useState, useContext } from "react";
import "./TagList.css";
import { useInput } from "../Common/hooks";
import { createTag, deleteTag, getTags } from "../Common/TagAPI";
import { UserContext } from "../Login/UserContext";
import { Tag } from "./Tag";

const random = max => {
  return Math.floor(Math.random() * Math.floor(max));
};
const generateColor = () => {
  return `#${random(256)
    .toString(16)
    .padStart(2, "0")}${random(256)
    .toString(16)
    .padStart(2, "0")}${random(256)
    .toString(16)
    .padStart(2, "0")}`;
};

export const TagList = () => {
  // get context
  const user = useContext(UserContext);

  // create state
  const [color, setColor] = useInput(generateColor());
  const [label, setLabel] = useInput("");
  const [tags, setTags] = useState([]);

  //create effects
  useEffect(() => {
    getTags(user).then(setTags);
  }, []);

  return (
    <div className="container tags-card">
      {tags.map(tag => (
        <div
          key={tag._id}
          className="mt-2 mb-2 d-flex"
          style={{
            overflow: "hidden" // Collapsing margins
          }}
        >
          {/* avoid the tag element to fill up all the available height */}
          <div>
            <Tag {...tag} big />
          </div>
          <button
            type="button"
            className="btn btn-danger ml-2"
            onClick={event => {
              event.preventDefault();
              event.stopPropagation();
              if (window.confirm("Delete tag ?")) {
                deleteTag(tag, user).then(_ =>
                  setTags(tags => tags.filter(t => t._id !== tag._id))
                );
              }
            }}
          >
            <i className="fas fa-times" />
          </button>
        </div>
      ))}
      <form className="form-inline">
        <input type="color" className="form-control colorpicker" {...color} />
        <input
          type="text"
          className="form-control ml-2"
          placeholder="Label"
          {...label}
        />
        <button
          type="button"
          className="btn btn-info btn-sm ml-2"
          onClick={() => {
            setColor(generateColor());
          }}
        >
          <i className="fas fa-sync-alt" />
        </button>
        <button
          type="button"
          className="btn btn-primary btn-sm ml-2"
          onClick={() => {
            createTag(
              {
                label: label.value,
                color: color.value
              },
              user
            )
              .then(tag => setTags(tags => [...tags, tag]))
              .then(_ => {
                setColor(generateColor());
                setLabel("");
              });
          }}
        >
          <i className="fas fa-check" />
        </button>
        <Tag
          style={{ marginLeft: "auto" }}
          color={color.value}
          label={label.value || "Label"}
        />
      </form>
    </div>
  );
};
