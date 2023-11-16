import Joi from 'joi';

//create laderboard validation
export const leaderboardValidation = (data) => {
  const schema = Joi.object({
    name: Joi.string().required(),
  });

  return schema.validate(data);
};

//add score validation
export const addScoreValidation = (data) => {
  const schema = Joi.object({
    score_to_add: Joi.number(),
  });

  return schema.validate(data);
};