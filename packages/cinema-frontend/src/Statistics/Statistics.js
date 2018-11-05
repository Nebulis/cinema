import React, { Fragment, useContext, useEffect, useState } from "react";
import { ApplicationContext } from "../ApplicationContext";
import * as MovieAPI from "../Movie/MovieAPI";
import "./Statistics.css";
import { produce } from "immer";
import { UserContext } from "../Login/UserContext";
import orderBy from "lodash/orderBy";

const initialState = (types, genres) => {
  return types.map(type => ({
    name: type,
    count: 0,
    genres: genres.map(genre => ({
      name: genre,
      count: 0,
      seen: 0,
      unseen: 0
    }))
  }));
};

export const Statistics = () => {
  // get contexts
  const user = useContext(UserContext);
  const { genres, types } = useContext(ApplicationContext);
  const [stats, setStats] = useState(initialState(types, genres));

  // actions
  const fetchByTypes = (types, genres) => {
    types.forEach(type =>
      MovieAPI.getMovies(`types=${type}&limit=0`, user)
        .then(data =>
          setStats(
            produce(
              draft =>
                void (draft.find(t => type === t.name).count = data.count)
            )
          )
        )
        .then(() =>
          genres.forEach(genre => {
            MovieAPI.getMovies(
              `types=${type}&genres=${genre}&limit=0`,
              user
            ).then(data =>
              setStats(
                produce(
                  draft =>
                    void (draft
                      .find(t => type === t.name)
                      .genres.find(g => genre === g.name).count = data.count)
                )
              )
            );
            MovieAPI.getMovies(
              `types=${type}&genres=${genre}&seen=true&limit=0`,
              user
            ).then(data =>
              setStats(
                produce(
                  draft =>
                    void (draft
                      .find(t => type === t.name)
                      .genres.find(g => genre === g.name).seen = data.count)
                )
              )
            );
            MovieAPI.getMovies(
              `types=${type}&genres=${genre}&seen=false&limit=0`,
              user
            ).then(data =>
              setStats(
                produce(
                  draft =>
                    void (draft
                      .find(t => type === t.name)
                      .genres.find(g => genre === g.name).unseen = data.count)
                )
              )
            );
          })
        )
    );
  };

  // effects
  useEffect(
    () => {
      setStats(initialState(types, genres));
      fetchByTypes(types, genres);
    },
    [types, genres]
  );

  return (
    <div>
      <div className="d-flex justify-content-around">
        {stats.map((type, index) => (
          <div style={{ width: "500px" }} key={index}>
            <div className="card stat-card">
              <div className="card-body">
                <h5 className="card-title">
                  {type.count} {type.name}
                </h5>
                <div>
                  {orderBy(type.genres, ["count"], ["desc"]).map(
                    (genre, index) => (
                      <Fragment>
                        <div>
                          {" "}
                          {genre.count} {genre.name} ({" "}
                          {genre.count
                            ? ((genre.seen * 100) / genre.count).toFixed(2)
                            : 0}
                          % seen){" "}
                        </div>
                        <div className="movie-progress" key={index}>
                          <div
                            className="progress-bar unseen"
                            role="progressbar"
                            style={{
                              width: `calc(20px + ${(genre.unseen * 100) /
                                orderBy(type.genres, ["count"], ["desc"])[0]
                                  .count}%)`
                            }}
                          >
                            {genre.unseen}
                          </div>
                          {genre.count - genre.unseen - genre.seen ? (
                            <div
                              className="progress-bar pending"
                              role="progressbar"
                              style={{
                                width: `calc(20px + ${((genre.count -
                                  genre.unseen -
                                  genre.seen) *
                                  100) /
                                  orderBy(type.genres, ["count"], ["desc"])[0]
                                    .count}%)`
                              }}
                            >
                              {genre.count - genre.unseen - genre.seen}
                            </div>
                          ) : (
                            undefined
                          )}
                          <div
                            className="progress-bar seen"
                            role="progressbar"
                            style={{
                              width: `calc(20px + ${(genre.seen * 100) /
                                orderBy(type.genres, ["count"], ["desc"])[0]
                                  .count}%)`
                            }}
                          >
                            {genre.seen}
                          </div>
                        </div>
                      </Fragment>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
