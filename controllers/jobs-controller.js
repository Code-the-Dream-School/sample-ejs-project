const Job = require("../models/Job");
const parse_v = require("../util/parse_v_error");
const { setCsrf } = require("../middleware/auth");

const status_values = Job.schema.path("status").enumValues;

const jobs = async (req, res) => {
  const joblist = await Job.find({ createdBy: req.user.id });
  res.render("pages/jobs", {
    jobs: joblist,
    errors: req.flash("error"),
    info: req.flash("info"),
  });
};

const new_job = async (req, res) => {
  const job_values = {
    company: "",
    position: "",
    status: "",
    action: "/jobs/add",
    submit: "Add",
    title: "Add a Job Entry",
  };
  await setCsrf(req, res);
  res.render("pages/job", {
    status_values,
    job_values,
    errors: req.flash("error"),
    info: req.flash("info"),
  });
};

const add_job = async (req, res, next) => {
  try {
    await Job.create({
      company: req.body.company,
      position: req.body.position,
      status: req.body.status,
      createdBy: req.user.id,
    });
  } catch (e) {
    if (e.name === "ValidationError") {
      parse_v(e, req);
      const job_values = {
        company: req.body.company,
        position: req.body.position,
        status: req.body.status,
        action: "/jobs/add",
        submit: "Add",
        title: "Add a Job Entry",
      };
      await setCsrf(req, res);
      return res.render("pages/job", {
        status_values,
        job_values,
        errors: req.flash("error"),
        info: req.flash("info"),
      });
    } else {
      return next(e);
    }
  }
  req.flash("info", "The job entry was added.");
  res.redirect("/jobs");
};

const edit_job = async (req, res) => {
  const this_job = await Job.findOne({
    _id: req.params.job,
    createdBy: req.user.id,
  });
  if (!this_job) {
    req.flash("error", "That job was not found.");
    return res.redirect("/jobs");
  }
  const job_values = {};
  job_values.company = this_job.company || "";
  job_values.position = this_job.position || "";
  job_values.status = this_job.status || "";
  job_values.action = `/jobs/update/${this_job._id}`;
  job_values.submit = "Update";
  job_values.title = "Edit a Job Entry";
  await setCsrf(req, res);
  res.render("pages/job", {
    status_values,
    job_values,
    errors: req.flash("error"),
    info: req.flash("info"),
  });
};

const update_job = async (req, res, next) => {
  let this_job = null;
  try {
    this_job = await Job.findOneAndUpdate(
      { _id: req.params.job, createdBy: req.user.id },
      req.body,
      { runValidators: true }
    );
  } catch (e) {
    if (e.name === "ValidationError") {
      parse_v(e, req);
      const job_values = {};
      job_values.company = req.body.company;
      job_values.position = req.body.position;
      job_values.status = req.body.status;
      job_values.action = `/jobs/update/${req.params.job}`;
      job_values.submit = "Update";
      job_values.title = "Edit a Job Entry";
      await setCsrf(req, res);
      return res.render("pages/job", {
        status_values,
        job_values,
        errors: req.flash("error"),
        info: req.flash("info"),
      });
    } else {
      return next(e);
    }
  }
  if (this_job) {
    req.flash("info", "The job entry was updated.");
  } else {
    req.flash("error", "The job entry was not found.");
  }
  res.redirect("/jobs");
};

const delete_job = async (req, res, next) => {
  const this_job = await Job.findOneAndDelete({
    _id: req.params.job,
    createdBy: req.user.id,
  });
  if (!this_job) {
    req.flash("error", "The job entry was not found.");
  } else {
    req.flash("info", "The job entry was deleted.");
  }
  res.redirect("/jobs");
};

module.exports = {
  jobs,
  add_job,
  new_job,
  edit_job,
  update_job,
  delete_job,
};
