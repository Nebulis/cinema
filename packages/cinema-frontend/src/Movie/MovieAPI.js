const headers = user => ({
  Accept: "application/json",
  "Content-Type": "application/json",
  Authorization: `Bearer ${user.token}`
});

const handleResponse = response => {
  if (response.ok) return response.json();
  throw new Error("Fetch fail");
};

export const getMovie = (id, user) => {
  return fetch(`/api/movies/${id}`, {
    headers: headers(user)
  }).then(handleResponse);
};

export const getMovies = (search, user) => {
  return fetch(`/api/movies?${search}`, {
    headers: headers(user)
  }).then(handleResponse);
};
