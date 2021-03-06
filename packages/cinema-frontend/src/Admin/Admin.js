import React, { useContext, useState } from "react";
import { TagList } from "./TagList";
import { Statistics } from "../Statistics/Statistics";
import { Finder } from "../Finder";
import "./Admin.css";
import { ApplicationContext, LOADING } from "../ApplicationContext";

export const Admin = () => {
  const [selectedTab, setSelectedTab] = useState("finder");
  const { status } = useContext(ApplicationContext);

  if (status === LOADING) {
    return null;
  }

  return (
    <>
      <div className="admin-tabs">
        <div className={`${selectedTab === "tags" ? "selected" : ""}`} onClick={() => setSelectedTab("tags")}>
          Tags
        </div>
        <div className={`${selectedTab === "finder" ? "selected" : ""}`} onClick={() => setSelectedTab("finder")}>
          Finder
        </div>
        <div className={`${selectedTab === "stats" ? "selected" : ""}`} onClick={() => setSelectedTab("stats")}>
          Stats
        </div>
      </div>
      {selectedTab === "tags" ? <TagList /> : undefined}
      {selectedTab === "finder" ? <Finder /> : undefined}
      {selectedTab === "stats" ? <Statistics /> : undefined}
    </>
  );
};
