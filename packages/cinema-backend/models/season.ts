import { Document, model, Schema, Types } from "mongoose";
import { episodeSchema, IEpisode } from "./episode";

// consider using typegoose
export interface ISeason extends Document {
  episodes: Types.DocumentArray<IEpisode>;
  productionYear?: number;
}

export const seasonSchema = new Schema({
  episodes: [episodeSchema],
  productionYear: Number
});

export const Season = model<ISeason>("Season", seasonSchema);
