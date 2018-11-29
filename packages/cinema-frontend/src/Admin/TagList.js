import React, { useContext } from "react";
import "./TagList.css";
import { useInput } from "../Common/hooks";
import { createTag } from "../Common/TagAPI";
import { UserContext } from "../Login/UserContext";
import { Tag } from "./Tag";
import { ApplicationContext } from "../ApplicationContext";
import { TagListElement } from "./TagListElement";
import { generateColor } from "./tag.utils";
import { produce } from "immer";

export const TagList = () => {
  // get context
  const user = useContext(UserContext);
  const { tags, set } = useContext(ApplicationContext);
  const setTags = set("tags");

  // create state
  const [color, setColor] = useInput(generateColor());
  const [label, setLabel] = useInput("");

  return (
    <div className="container tags-card">
      {tags.map((tag, index) => (
        <TagListElement
          key={tag._id}
          tag={tag}
          onDelete={() => setTags(tags => tags.filter(t => t._id !== tag._id))}
          onUpdate={tag => {
            setTags(tags =>
              produce(tags, draft => {
                draft[index] = tag;
              })
            );
          }}
        />
      ))}
      <form className="form-inline">
        <input type="color" className="form-control colorpicker" {...color} />
        <input type="text" className="form-control ml-2" placeholder="Label" {...label} />
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
          disabled={!label.value || tags.find(tag => tag.label.toLowerCase() === label.value.toLowerCase())}
        >
          <i className="fas fa-check" />
        </button>
        <Tag style={{ marginLeft: "auto" }} color={color.value} label={label.value || "Label"} />
      </form>
    </div>
  );
};
