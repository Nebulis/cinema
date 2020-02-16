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
  done: boolean; // temp boolean to know which one has been updated
}

const movieSchema = new Schema({
  done: Boolean, // temp boolean to know which one has been updated
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
