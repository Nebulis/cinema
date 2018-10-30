import { Document, model, Schema } from "mongoose";

// consider using typegoose
interface IMovie extends Document {
  fileUrl: string;
  finished: boolean;
  genre: string[];
  idAllocine: number;
  netflix: boolean;
  productionYear: number;
  seen?: boolean;
  state: number;
  stateSummary: string;
  summary: string;
  title: string;
  type: string;
}

const movieSchema = new Schema({
  fileUrl: String,
  finished: Boolean, // is tv show finished ?
  genre: [String],
  idAllocine: Number,
  netflix: Boolean,
  productionYear: Number,
  seen: Schema.Types.Mixed,
  state: Number,
  stateSummary: String,
  summary: String,
  title: String,
  trash: Boolean
});

export const Movie = model<IMovie>("Movie", movieSchema);
