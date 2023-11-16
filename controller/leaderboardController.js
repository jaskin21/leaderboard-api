import { Board, Entry } from '../model/leaderboardModel.js';
import { UserLeague } from '../model/UserModel.js';
import errorResponseFactory from '../utils/errorResponseFactory.js';
import responseFactory, { responseStatus } from '../utils/ResponseFactory.js';
import {
  addScoreValidation,
  leaderboardValidation,
} from '../validation/leaderboardValidation.js';

// create board
export const leaderboard = async (req, res) => {
  //VALIDATE THE DATA BEFORE USER
  const { error } = leaderboardValidation(req.body);
  if (error) {
    return errorResponseFactory(
      res,
      responseStatus.BAD_REQUEST,
      error.details[0].message,
      {
        details: error.details,
      }
    );
  }

  const newLeaderboard = new Board({
    ...req.body,
  });

  try {
    const saveNewLeaderboard = await newLeaderboard.save();

    return responseFactory(res, 200, { board: saveNewLeaderboard });
  } catch (error) {
    return errorResponseFactory(
      res,
      400,
      error?.message ?? 'Something went wrong, please try again'
    );
  }
};

// add score
export const addScore = async (req, res) => {
  //VALIDATE THE DATA BEFORE USER
  const { error } = addScoreValidation(req.body);
  if (error) {
    return errorResponseFactory(
      res,
      responseStatus.BAD_REQUEST,
      error.details[0].message,
      {
        details: error.details,
      }
    );
  }

  try {
    const { _id, user_id } = req.params;

    // Find the existing entry
    let existingEntry = await Entry.findOne({
      user_id: user_id,
      board_id: _id,
    });

    if (!existingEntry) {
      // If no existing entry, create a new one
      existingEntry = new Entry({
        board_id: _id,
        score: 0,
        user_id: user_id,
      });
    }

    // Add the new score to the existing score
    existingEntry.score += req.body.score_to_add;
    existingEntry.scored_at = new Date();

    const updatedEntry = await existingEntry.save();

    return responseFactory(res, 200, { entry: updatedEntry });
  } catch (error) {
    return errorResponseFactory(
      res,
      400,
      error?.message ?? 'Something went wrong, please try again'
    );
  }
};

// view leaderboard entries
export const viewLeaderboardEntries = async (req, res) => {
  try {
    const perPage = parseInt(req.query.per_page) || 10; // set per page 10 items
    const page = parseInt(req.query.page) || 1; // page 1 as default start page

    const skip = (page - 1) * perPage;

    const board = await Board.findOne({ _id: req.params._id });
    const entries = await Entry.find({ board_id: req.params._id })
      .sort({ score: -1, scored_at: 1 })
      .skip(skip)
      .limit(perPage);

    const formattedEntries = [];

    for (const entry of entries) {
      const user = await UserLeague.findOne({ _id: entry.user_id });

      formattedEntries.push({
        score: entry.score,
        user_id: entry.user_id,
        name: user ? user.name : 'Unknown',
        scored_at: entry.scored_at,
        rank: formattedEntries.length + skip,
      });
    }

    return responseFactory(res, 200, {
      board: {
        _id: board._id,
        name: board.name,
        entries: formattedEntries,
        pagination: {
          per_page: perPage,
          page: page,
        },
      },
    });
  } catch (error) {
    return errorResponseFactory(
      res,
      400,
      error?.message ?? 'Something went wrong, please try again'
    );
  }
};
