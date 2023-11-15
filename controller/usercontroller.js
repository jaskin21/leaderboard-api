import { UserLeague } from '../model/UserModel.js';
import errorResponseFactory from '../utils/errorResponseFactory.js';
import responseFactory, { responseStatus } from '../utils/ResponseFactory.js';
import { userValidation } from '../validation/userValidation.js';

// view specific user
export const viewUser = async (req, res) => {
  try {
    const user = await UserLeague.findOne({ _id: req.params._id });
    return responseFactory(res, 200, { user });
  } catch (error) {
    return errorResponseFactory(
      res,
      400,
      error?.message ?? 'Something went wrong, please try again'
    );
  }
};

// create user
export const addUser = async (req, res) => {
  //VALIDATE THE DATA BEFORE USER
  const { error } = userValidation(req.body);
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

  const newUser = new UserLeague({
    ...req.body,
  });

  try {
    const saveNewUser = await newUser.save();

    return responseFactory(res, 200, { user: saveNewUser });
  } catch (error) {
    return errorResponseFactory(
      res,
      400,
      error?.message ?? 'Something went wrong, please try again'
    );
  }
};


