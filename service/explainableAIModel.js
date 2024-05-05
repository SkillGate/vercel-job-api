const axios = require("axios");
const { BASE_URL } = require("../config/config");
const { explainableAICategory } = require("../constants/Constant");
const { getDegreeNames, formatArray, formatCandidateExperience, formatEducation, formatExperience } = require("./matchingPersona");
const { explainableAICategoryTechnicalSkills, explainableAICategoryEducation } = require("../constants/ExplainableAIData");

const ExplainableAIModel = async (candidatePersona, job, res, category) => {
  // Check if category is valid
  if (!Object.values(explainableAICategory).includes(category)) {
    return res.status(500).json({ error: "Invalid category!" });
  }

  // Check if required details are provided in candidate persona and job
  if (!(candidatePersona?.education && candidatePersona?.skills && candidatePersona?.experience && candidatePersona?.soft_skills)) {
    return res
      .status(400)
      .json({ error: "Required details not provided in user!" });
  }

  if (!(job?.education && job?.skills && job?.experience && job?.soft_skills)) {
    return res
      .status(400)
      .json({ error: "Required details not provided in job!" });
  }

  const candidatePersonaFormatted = {};
  const jobFormatted = {};

  // Format candidate persona and job based on category
  switch (category) {
    case explainableAICategory.education:
      candidatePersonaFormatted.education = getDegreeNames(candidatePersona.education);
      jobFormatted.education = formatEducation(job.education);
      break;
    case explainableAICategory.technical_skills:
      candidatePersonaFormatted.technical_skills = formatArray(candidatePersona.skills);
      jobFormatted.technical_skills = formatArray(job.skills);
      break;
    case explainableAICategory.experience:
      candidatePersonaFormatted.experience = formatCandidateExperience(candidatePersona.experience);
      jobFormatted.experience = formatExperience(job.experience);
      break;
    case explainableAICategory.soft_skills:
      candidatePersonaFormatted.soft_skills = formatArray(candidatePersona.soft_skills);
      jobFormatted.soft_skills = formatArray(job.soft_skills);
      break;
    default:
      break;
  }

  // Make request to the AI model
  try {
    const requestBody = {
      company_persona: jobFormatted,
      candidate_persona: candidatePersonaFormatted,
      category:category
    };
    console.log(requestBody);
    // const response = await axios.post(`${BASE_URL}/explain`, requestBody);
    // const response = explainableAICategoryTechnicalSkills;
    const response = explainableAICategoryEducation;
    // console.log(response);
    return response;
  } catch (error) {
    // console.error("Error calling AI model:", error);
    return res.status(500).json({ error: "Internal server error!" });
  }
};

module.exports = ExplainableAIModel;
