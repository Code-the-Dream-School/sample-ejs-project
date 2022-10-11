const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const User = require("../models/User");

const passport_init = () => {
  passport.use(
    new LocalStrategy(async function (email, password, done) {
      try {
        const user = await User.findOne({ email: email });
        if (!user) {
          return done(null, false, { message: "Incorrect credentials." });
        }
        const result = await user.comparePassword(password);
        if (result) {
          return done(null, user);
        } else {
          return done(null, false, { message: "Incorrect credentials." });
        }
      } catch (e) {
        return done(e);
      }
    })
  );
  passport.serializeUser(async function (user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(async function (id, done) {
    try {
      const user = await User.findById(id);
      if (!user) {
        return done(new Error("user not found"));
      }
      return done(null, user);
    } catch (e) {
      done(e);
    }
  });
};

module.exports = passport_init;
