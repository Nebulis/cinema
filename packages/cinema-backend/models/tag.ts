import { Document, model, Schema } from "mongoose";

// consider using typegoose
interface ITag extends Document {
  _id: string;
  color: string;
  label: string;
}

const tagSchema = new Schema({
  _id: String,
  color: String,
  label: String
});

export const Tag = model<ITag>("Tag", tagSchema);
