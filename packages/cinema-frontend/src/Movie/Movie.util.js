export const seasonTag = seasonIndex => {
  return `S${(seasonIndex + 1).toString().padStart(2, "0")}`;
};
export const episodeTag = (seasonIndex, episodeIndex) => {
  return `${seasonTag(seasonIndex)}E${(episodeIndex + 1).toString().padStart(2, "0")}`;
};

export const handleError = dispatch => error => {
  createNotification(dispatch, error.message, "error");
  throw error;
};

export const createNotification = (dispatch, content, type = "success") => {
  dispatch({
    type: "ADD",
    payload: {
      content,
      type
    }
  });
};
