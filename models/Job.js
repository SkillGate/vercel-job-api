const mongoose = require("mongoose");

const jobStatus = ["Opening", "Close"];

const JobSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    title: { type: String, required: true },
    company_name: { type: String, required: true },
    company_location: { type: String },
    skills: { type: [String], required: true },
    soft_skills: { type: [String], required: true },
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
    time_posted: { type: String },
    logo_url: { type: String },
    banner_url: { type: String },
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
    saved_candidate_id_list: { type: [String] },
    persona_matching_score: [
      {
        candidate_id: { type: String },
        overall_score: { type: Number, default: 0 },
        education: { type: Number, default: 0 },
        soft_skills: { type: Number, default: 0 },
        technical_skills: { type: Number, default: 0 },
        experience: { type: Number, default: 0 },
      },
    ],
    w_soft_skills: { type: Number, default: 0.25 },
    w_technical_skills: { type: Number, default: 0.25 },
    w_education: { type: Number, default: 0.25 },
    w_experience: { type: Number, default: 0.25 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Job", JobSchema);
