import { createNotification } from "../Movie/Movie.util";

const headers = user => ({
  Accept: "application/json",
  "Content-Type": "application/json",
  Authorization: `Bearer ${user.token}`
});

// TODO ... doesn't work no access to dispatch :(
export const handleError = error => {
  createNotification(error.message, "error");
  throw error;
};

const handleResponse = response => {
  if (response.ok) return response.json();
  throw new Error("Fetch fail");
};

export const getMovie = (id, user) => {
  return fetch(`/api/movies/${id}`, {
    headers: headers(user)
  })
    .then(handleResponse)
    .catch(handleError);
};

let controller;
export const getMovies = abortable => (search, user) => {
  if (abortable && controller) {
    controller.abort();
  }
  controller = new AbortController();
  return fetch(`/api/movies?${search}`, {
    headers: headers(user),
    signal: controller.signal
  })
    .then(handleResponse)
    .then(response => {
      controller = null;
      return response;
    })
    .catch(handleError);
};

export const updateMovie = (movie, user) => {
  return fetch(`/api/movies/${movie._id}`, {
    method: "PUT",
    body: JSON.stringify(movie),
    headers: headers(user)
  })
    .then(handleResponse)
    .catch(handleError);
};

export const updateMoviePoster = (movie, file, user) => {
  const data = new FormData();
  data.append("file", file);
  return fetch(`/api/movies/${movie._id}/poster`, {
    method: "POST",
    body: data,
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${user.token}`
    }
  })
    .then(handleResponse)
    .catch(handleError);
};

export const deleteMovie = (movie, user) => {
  return fetch(`/api/movies/${movie._id}`, {
    method: "DELETE",
    headers: headers(user)
  })
    .then(handleResponse)
    .catch(handleError);
};

export const addSeason = (movie, user) => {
  return fetch(`/api/movies/${movie._id}/seasons`, {
    method: "POST",
    body: JSON.stringify(movie),
    headers: headers(user)
  })
    .then(handleResponse)
    .catch(handleError);
};

export const updateSeason = (movie, season, user) => {
  return fetch(`/api/movies/${movie._id}/seasons/${season._id}`, {
    method: "PUT",
    body: JSON.stringify(season),
    headers: headers(user)
  })
    .then(handleResponse)
    .catch(handleError);
};

export const deleteSeason = (movie, season, user) => {
  return fetch(`/api/movies/${movie._id}/seasons/${season._id}`, {
    method: "DELETE",
    headers: headers(user)
  })
    .then(response => {
      if (!response.ok) throw new Error("Fetch fail");
    })
    .catch(handleError);
};

export const addEpisode = (movie, season, user) => {
  return fetch(`/api/movies/${movie._id}/seasons/${season._id}/episodes`, {
    method: "POST",
    body: JSON.stringify(season),
    headers: headers(user)
  })
    .then(handleResponse)
    .catch(handleError);
};

export const updateEpisode = (movie, season, episode, user) => {
  return fetch(`/api/movies/${movie._id}/seasons/${season._id}/episodes/${episode._id}`, {
    method: "PUT",
    body: JSON.stringify(episode),
    headers: headers(user)
  })
    .then(handleResponse)
    .catch(handleError);
};

export const deleteEpisode = (movie, season, episode, user) => {
  return fetch(`/api/movies/${movie._id}/seasons/${season._id}/episodes/${episode._id}`, {
    method: "DELETE",
    headers: headers(user)
  })
    .then(response => {
      if (!response.ok) throw new Error("Fetch fail");
    })
    .catch(handleError);
};
