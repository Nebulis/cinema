import { Document, model, Schema } from "mongoose";

// consider using typegoose
interface ITag extends Document {
  color: string;
  label: string;
}

const tagSchema = new Schema({
  color: String,
  label: String
});

export const Tag = model<ITag>("Tag", tagSchema);
