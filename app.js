import express from 'express';
import path from 'path';

import __dirname from './dirname.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import logger from 'morgan';
import 'dotenv/config';
import connectDb from './connect-db.js';

import authRouter from './routes/authRoutes.js';
import userRouter from './routes/userRoutes.js';
import leaderboard from './routes/leaderboardRoutes.js';
import { Board, Entry } from './model/leaderboardModel.js';
import { UserLeague } from './model/UserModel.js';

const app = express();



//db connecition code
connectDb(process.env.DB_CONNECTION, process.env.DB_Name);

app.use(logger('dev'));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Bot for adding score for a random player
const runCommand = async () => {
    const randomBoardData = await Board.aggregate([
      { $sample: { size: 1 } },
      { $project: { _id: 1 } },
    ]);

    const randomUserData = await UserLeague.aggregate([
      { $sample: { size: 1 } },
      { $project: { _id: 1 } },
    ]);

    const [randomBoardDataResult] = await Promise.allSettled([randomBoardData]);
    const [randomUserDataResult] = await Promise.allSettled([randomUserData]);

    if (
      randomBoardDataResult.status &&
      randomUserDataResult.status === 'fulfilled'
    ) {
        const randomBoardId = randomBoardData[0]._id.toString();
        const randomUserBoardId = randomUserData[0]._id.toString();

        let existingEntry = await Entry.findOne({
          user_id: randomUserBoardId,
          board_id: randomBoardId,
        });

        if (!existingEntry) {
          // If no existing entry, create a new one
          existingEntry = new Entry({
            board_id: randomBoardId,
            score: 0,
            user_id: randomUserBoardId,
          });
        }

        // Add the new score to the existing score
        existingEntry.score += 10;
        existingEntry.scored_at = new Date();

        const updatedEntry = await existingEntry.save();
        console.log('bot add entry every 5s:', updatedEntry);
    } else {
      throw new Error(`Error submitting the report: ${uploadResult.reason}`);
    }
}

async function continuousTask() {
  while (true) {
    runCommand();
    await new Promise((resolve) => setTimeout(resolve, 5000));
  }
}

continuousTask().catch((error) => {
  return errorResponseFactory(
    res,
    400,
    error?.message ?? 'Something went wrong.'
  );
});

// Authentication
app.use('/', leaderboard);
app.use('/auth', authRouter);
app.use('/user', userRouter);

app.use(function (req, res, next) {
  res
    .status(404)
    .json({ message: "We couldn't find what you were looking for 😞" });
});

app.use(function (err, req, res, next) {
  console.error(err.stack);
  res.status(500).json(err);
});



export default app;
