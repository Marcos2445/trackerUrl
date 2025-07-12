import mongoose, { Schema } from "mongoose";

const TrackingSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, required: true },
  url: { type: String, required: true },
  createdAt: { type: Date, required: true, default: Date.now}
});

TrackingSchema.index({ userId: 1 });
TrackingSchema.index({ createdAt: -1 });

export const TrackingModel = mongoose.model('trackings', TrackingSchema);