const mongoose = require("mongoose");

const jobStatus = ["Opening", "Close"];

const JobSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    title: { type: String, required: true },
    company_name: { type: String, required: true },
    company_location: { type: String },
    skills: { type: [String], required: true },
    experience_level: { type: String, required: true },
    type_of_employment: { type: String, required: true },
    salary_range: { type: String },
    experience: [
      {
        experiencedYears: { type: String },
        experiencedArea: { type: String },
      },
    ],
    experience_job_post: { type: String },
    education: [
      {
        educationtype: { type: String },
        educationfield: { type: String },
      },
    ],
    education_job_post: { type: String },
    overview: { type: String, required: true },
    description: { type: String, required: true },
    requirements_and_responsibilities: { type: [String], required: true },
    time_posted: { type: Date },
    logo_url: { type: Buffer },
    banner_url: { type: Buffer },
    job_status: { type: String, enum: jobStatus, default: "Opening" },
    candidate_id_list: { type: [String] },
    githubCheckBox: {
      type: Boolean,
      default: false,
    },
    linkedinCheckBox: {
      type: Boolean,
      default: false,
    },
    blogsCheckBox: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Job", JobSchema);
