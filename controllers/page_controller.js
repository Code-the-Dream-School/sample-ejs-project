const User = require("../models/User");
const parse_v = require("../util/parse_v_error");
const { setCsrf } = require("../middleware/auth");

const render_index = (req, res) => {
  if (req.user) {
    return res.redirect("/jobs");
  }
  res.render("pages/index", {
    errors: req.flash("error"),
    info: req.flash("info"),
  });
};

const render_sign_up = async (req, res) => {
  await setCsrf(req,res);
  res.render("pages/sign-up-form", {
    user_values: {},
    errors: req.flash("error"),
    info: req.flash("info"),
  });
};

const sign_up = async (req, res, next) => {
  let error_state = false;
  const user_doc = new User(req.body);
  const user_values = { name: req.body.name, email: req.body.email };
  try {
    await user_doc.validate();
  } catch (e) {
    error_state = true;
    if (e.name === "ValidationError") {
      parse_v(e, req);
      // req.flash("error","validation error");
    } else {
      return next(e);
    }
  }
  if (req.body.password != req.body.password_confirm) {
    error_state = true;
    req.flash("error", "The passwords entered do not match.");
  }
  if (error_state === true) {
    return res.render("pages/sign-up-form", {
      user_values,
      errors: req.flash("error"),
      info: req.flash("info"),
    });
  }
  try {
    await User.create(req.body);
  } catch (e) {
    if (e.name === "MongoServerError" && e.code === 11000) {
      req.flash("error", "That email address is already registered.");
    } else {
      return next(e);
    }
    return res.render("pages/sign-up-form", {
      user_values,
      errors: req.flash("error"),
      info: req.flash("info"),
    });
  }
  return res.redirect("/");
};

const log_out = (req, res) => {
  req.session.destroy(function (err) {
    if (err) {
      console.log(err);
    }
    res.redirect("/");
  });
};

const logon = async (req, res) => {
  if (req.user) {
    return res.redirect("/jobs");
  }
  await setCsrf(req, res);
  res.render("pages/logon", {
    errors: req.flash("error"),
    info: req.flash("info"),
  });
};

module.exports = {
  render_index,
  render_sign_up,
  sign_up,
  log_out,
  logon,
};
