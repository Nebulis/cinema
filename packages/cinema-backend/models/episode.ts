import { Document, model, Schema } from "mongoose";

// consider using typegoose
export interface IEpisode extends Document {
  seen?: boolean;
  summary?: string;
  title?: string;
}

export const episodeSchema = new Schema({
  seen: Boolean,
  summary: String,
  title: String
});

export const Episode = model<IEpisode>("Episode", episodeSchema);
