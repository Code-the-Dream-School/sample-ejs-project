const { StatusCodes } = require("http-status-codes");

const errorHandlerMiddleware = (err, req, res, next) => {
  if (err.name != "CastError") {
    console.log("An exception was thrown: ", err);
  }
  let customError = {
    // set default
    statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
    msg: "Something went wrong. Try again later",
  };
  if (err.name === "CastError") {
    customError.msg = `No item found with id: ${err.value}`;
    customError.statusCode = 404;
  }
  req.flash("error", customError.msg);
  return res.redirect("back");
};

module.exports = errorHandlerMiddleware;
