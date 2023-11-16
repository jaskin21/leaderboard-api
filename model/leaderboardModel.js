import mongoose from 'mongoose';

// Schema for Board
const BoardSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
  },
  {
    versionKey: false,
  }
);

export const Board = mongoose.model('board', BoardSchema);

// Schema for Score
const EntrySchema = new mongoose.Schema(
  {
    board_id: {
      type: mongoose.Types.ObjectId,
      ref: 'board',
      required: true,
    },
    score: {
      type: Number,
      default: 0,
    },
    scored_at: {
      type: Date,
      default: Date.now,
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'userleague',
      required: true,
    },
  },
  {
    versionKey: false,
  }
);

export const Entry = mongoose.model('entry', EntrySchema);
