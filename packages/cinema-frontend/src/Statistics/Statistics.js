import React, { Fragment, useContext, useEffect, useState } from "react";
import { ApplicationContext } from "../ApplicationContext";
import * as MovieAPI from "../Common/MovieAPI";
import "./Statistics.css";
import { produce } from "immer";
import { UserContext } from "../Login/UserContext";
import orderBy from "lodash/orderBy";
import { Tag } from "../Admin/Tag";
import { MoviesContext } from "../Common/MoviesContext";
import { withRouter } from "react-router-dom";

const getMovies = MovieAPI.getMovies(false);

const initialState = (types, genres, tags) => {
  return {
    types: types.map(type => ({
      name: type,
      count: 0,
      genres: genres.map(genre => ({
        name: genre,
        count: 0,
        seen: 0,
        unseen: 0
      }))
    })),
    tags: tags.map(tag => ({
      id: tag._id,
      name: tag.label,
      color: tag.color,
      count: 0
    }))
  };
};

export const Statistics = withRouter(({ history }) => {
  // get contexts
  const user = useContext(UserContext);
  const { genres, types, tags } = useContext(ApplicationContext);
  const { resetFilters, onChange } = useContext(MoviesContext);
  const [stats, setStats] = useState(initialState(types, genres, tags));

  // actions
  const fetchByTypes = (types, genres) => {
    types.forEach(type =>
      getMovies(`types=${type}&limit=0`, user)
        .then(data =>
          setStats(
            produce(
              draft =>
                void (draft.types.find(t => type === t.name).count = data.count)
            )
          )
        )
        .then(() =>
          genres.forEach(genre => {
            getMovies(`types=${type}&genres=${genre}&limit=0`, user).then(
              data =>
                setStats(
                  produce(
                    draft =>
                      void (draft.types
                        .find(t => type === t.name)
                        .genres.find(g => genre === g.name).count = data.count)
                  )
                )
            );
            getMovies(
              `types=${type}&genres=${genre}&seen=true&limit=0`,
              user
            ).then(data =>
              setStats(
                produce(
                  draft =>
                    void (draft.types
                      .find(t => type === t.name)
                      .genres.find(g => genre === g.name).seen = data.count)
                )
              )
            );
            getMovies(
              `types=${type}&genres=${genre}&seen=false&limit=0`,
              user
            ).then(data =>
              setStats(
                produce(
                  draft =>
                    void (draft.types
                      .find(t => type === t.name)
                      .genres.find(g => genre === g.name).unseen = data.count)
                )
              )
            );
          })
        )
    );
  };

  const fetchByTags = tags => {
    tags.forEach(tag =>
      getMovies(`tags=${tag._id}&limit=0`, user).then(data =>
        setStats(
          produce(draft => {
            draft.tags.find(t => tag._id === t.id).count += data.count;
          })
        )
      )
    );
  };

  // effects
  useEffect(
    () => {
      setStats(initialState(types, genres, tags));
      fetchByTypes(types, genres);
      fetchByTags(tags);
    },
    [types, genres, tags]
  );

  return (
    <div className="d-flex justify-content-around flex-wrap mb-4">
      {stats.types.map((type, index) => (
        <div className="card stat-card" key={index}>
          <div className="card-body">
            <h5 className="card-title text-center">
              {type.count} {type.name}
            </h5>
            <div>
              {orderBy(type.genres, ["count"], ["desc"]).map((genre, index) => (
                <Fragment key={index}>
                  <div>
                    {" "}
                    {genre.count} {genre.name} ({" "}
                    {genre.count
                      ? ((genre.seen * 100) / genre.count).toFixed(2)
                      : 0}
                    % seen){" "}
                  </div>
                  <div className="movie-progress">
                    <div
                      className="progress-bar unseen"
                      role="progressbar"
                      style={{
                        width: `calc(20px + ${(genre.unseen * 100) /
                          orderBy(type.genres, ["count"], ["desc"])[0].count}%)`
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
                          orderBy(type.genres, ["count"], ["desc"])[0].count}%)`
                      }}
                    >
                      {genre.seen}
                    </div>
                  </div>
                </Fragment>
              ))}
            </div>
          </div>
        </div>
      ))}
      <div className="card stat-card stat-tags-card">
        <div className="card-body align-content-center">
          {stats.tags.map((tag, index) => (
            <h5
              className="text-center stat-tags-card-card mt-1"
              style={{
                cursor: "pointer"
              }}
              key={index}
              onClick={() => {
                resetFilters();
                onChange("tags")([tag.id]);
                history.push("/");
              }}
            >
              <Tag label={`${tag.count} ${tag.name}`} color={tag.color} />
            </h5>
          ))}
        </div>
      </div>
    </div>
  );
});
