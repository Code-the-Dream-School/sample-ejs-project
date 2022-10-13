const express = require("express");

const {
  new_job,
  add_job,
  edit_job,
  update_job,
  jobs,
  delete_job,
} = require("../controllers/jobs-controller");

const router = express.Router();
router.route("/").get(jobs);
router.route("/add").get(new_job).post(add_job);
router.route("/edit/:job").get(edit_job);
router.route("/update/:job").post(update_job);
router.route("/delete/:job").delete(delete_job);

module.exports = router;
