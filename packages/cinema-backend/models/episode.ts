import { Document, model, Schema } from "mongoose";

// consider using typegoose
export interface IEpisode extends Document {
  title?: string;
  summary?: string;
}

export const episodeSchema = new Schema({
  summary: String,
  title: String
});

export const Episode = model<IEpisode>("Episode", episodeSchema);
