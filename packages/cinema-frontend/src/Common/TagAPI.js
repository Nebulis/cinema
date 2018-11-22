const headers = user => ({
  Accept: "application/json",
  "Content-Type": "application/json",
  Authorization: `Bearer ${user.token}`
});

const handleResponse = response => {
  if (response.ok) return response.json();
  throw new Error("Fetch fail");
};

export const getTags = user => {
  return fetch(`/api/tags`, {
    headers: headers(user)
  }).then(handleResponse);
};

export const createTag = (tag, user) => {
  return fetch(`/api/tags`, {
    method: "POST",
    body: JSON.stringify(tag),
    headers: headers(user)
  }).then(handleResponse);
};

export const updateTag = (tag, user) => {
  return fetch(`/api/tags/${tag._id}`, {
    method: "PUT",
    body: JSON.stringify(tag),
    headers: headers(user)
  }).then(handleResponse);
};

export const deleteTag = (tag, user) => {
  return fetch(`/api/tags/${tag._id}`, {
    method: "DELETE",
    headers: headers(user)
  }).then(handleResponse);
};
