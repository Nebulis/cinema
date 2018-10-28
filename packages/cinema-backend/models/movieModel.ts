import { Document, model, Schema } from "mongoose";

// consider using typegoose
interface IMovie extends Document {
  fileUrl: string;
  filedata: string;
  finished: boolean;
  genre: string[];
  idAllocine: number;
  netflix: boolean;
  productionYear: number | number[];
  season: number;
  // seen is either a boolean in case of movies, either an array on boolean in case of season
  seen: boolean | boolean[];
  state: number;
  stateSummary: string;
  summary: string;
  title: string;
  trash: boolean;
  type: string;
}

const movieSchema = new Schema({
  fileUrl: String,
  filedata: String,
  finished: Boolean,
  genre: [String],
  idAllocine: Number,
  netflix: Boolean,
  // productionYear is either a number in case of movies, either an array of number in case of season
  productionYear: Schema.Types.Mixed,
  season: Number,
  // seen is either a boolean in case of movies, either an array of boolean in case of season
  seen: Schema.Types.Mixed,
  state: Number,
  stateSummary: String,
  summary: String,
  title: String,
  trash: Boolean,
  type: String
});

export const Movie = model<IMovie>("Movie", movieSchema);
