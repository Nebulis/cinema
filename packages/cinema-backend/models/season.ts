import { Document, model, Schema } from "mongoose";

// consider using typegoose
export interface ISeason extends Document {
  productionYear?: number;
}

export const seasonSchema = new Schema({
  productionYear: Number
});

export const Season = model<ISeason>("Season", seasonSchema);
