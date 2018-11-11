import { Document, model, Schema, Types } from "mongoose";
import { ISeason, seasonSchema } from "./season";

// consider using typegoose
interface IMovie extends Document {
  fileUrl: string;
  finished: boolean;
  genre: string[];
  idAllocine: number;
  productionYear: number;
  seasons: Types.DocumentArray<ISeason>;
  seen?: boolean;
  state: number;
  stateSummary: string;
  summary: string;
  tags: string[];
  title: string;
  type: string;
}

const movieSchema = new Schema({
  fileUrl: String,
  finished: Boolean, // is tv show finished ?
  genre: [String],
  idAllocine: Number,
  productionYear: Number,
  seasons: [seasonSchema],
  seen: Boolean,
  state: Number,
  stateSummary: String,
  summary: String,
  tags: [String],
  title: String,
  type: String
});

export const Movie = model<IMovie>("Movie", movieSchema);
