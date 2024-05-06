const axios = require("axios");
const { BASE_URL,BASE_URL_BENEFIT } = require("../config/config");

const MatchingModel = async (candidatePersona, job, res) => {
  if (
    !(
      candidatePersona?.education &&
      candidatePersona?.skills &&
      candidatePersona?.experience &&
      candidatePersona?.soft_skills
    )
  ) {
    return res
      .status(400)
      .json({ error: "Required details not provided in candidate persona!" });
  }

  if (!(job?.education && job?.skills && job?.experience && job?.soft_skills)) {
    return res
      .status(400)
      .json({ error: "Required details not provided in job!" });
  }

  const candidate_persona = {
    education: getDegreeNames(candidatePersona.education),
    technical_skills: formatArray(candidatePersona?.skills),
    soft_skills: formatArray(candidatePersona?.soft_skills),
    experience: formatCandidateExperience(candidatePersona?.experience),
  };

  const company_persona = {
    education: formatEducation(job?.education),
    technical_skills: formatArray(job?.skills),
    soft_skills: formatArray(job?.soft_skills),
    experience: formatExperience(job?.experience),
  };

  const requestBody = {
    company_persona: company_persona,
    candidate_persona: candidate_persona,
    w_soft_skills: job?.w_soft_skills,
    w_technical_skills: job?.w_technical_skills,
    w_education: job?.w_education,
    w_experience: job?.w_experience,
  };

  const response = await axios.post(`${BASE_URL}/predictSingle`, requestBody);

  return response.data.prediction;
};

function formatArray(arrayValues) {
  const formattedString = arrayValues.join(" | ");
  return `"${formattedString}"`;
}

function formatExperience(experienceArray) {
  const formattedStrings = experienceArray.map(
    (experience) =>
      `${experience.experiencedYears} ${experience.experiencedArea}`
  );
  const formattedString = formattedStrings.join(" | ");

  return `"${formattedString}"`;
}

function formatEducation(educationArray) {
  const formattedStrings = educationArray.map(
    (education) => `${education.educationtype} in ${education.educationfield}`
  );
  const formattedString = formattedStrings.join(" | ");
  return `"${formattedString}"`;
}

function getDegreeNames(educationArray) {
  const degreeNames = educationArray.map((education) => education.degreeName);

  const formattedDegreeNames = degreeNames.join(" | ");

  return formattedDegreeNames;
}

function formatCandidateExperience(experienceArray) {
  const formattedExperiences = experienceArray.map((experience) => {
    const duration = experience.currentlyWorking
      ? "Currently Working"
      : `${experience.startMonth}/${experience.startYear} - ${experience.endMonth}/${experience.endYear}`;
    const skills = experience.skills.join(", ");
    return `[Role:${experience.jobRole}, Duration:${duration}, Skills:${skills}]`;
  });

  const formattedString = formattedExperiences.join(", ");

  return `"${formattedString}"`;
}


//benefit prediction code.
function formatCandidateTotalExperience(experienceArray) {
  let totalDurationMonths = 0;

  experienceArray.forEach((experience) => {
    const start = new Date(`${experience.startYear}-${experience.startMonth}`);
    // console.log("start date:",start)
    const end = experience.currentlyWorking
      ? new Date()
      : new Date(`${experience.endYear}-${experience.endMonth}`);
      // console.log("end date:",end)
      const duration = (end - start) / (1000 * 60 * 60 * 24 * 30); // Convert milliseconds to months
      // console.log(duration)
      if(duration>0){
        totalDurationMonths += duration;
      }
  });

  // Convert total duration to years
  const totalExperienceYears = parseFloat(totalDurationMonths) / 12;

  return totalExperienceYears // Return total experience in years with two decimal places
}


const BenefitPredictionModel = async (candidatePersona, res) => {
  if (
    !(
      candidatePersona?.education &&
      candidatePersona?.skills &&
      candidatePersona?.experience
    )
  ) {
    return res
      .status(400)
      .json({ error: "Required details not provided in candidate persona!" });
  }


  const requestBody = {
    Education: getDegreeNames(candidatePersona.education),
    technicalSkills: formatArray(candidatePersona?.skills),
    softSkills: "leadership | problem solving",
    totalExperience: formatCandidateTotalExperience(candidatePersona?.experience),
  };
  console.log(candidatePersona?.experience)
  // console.log(requestBody.totalExperience)
  const response = await axios.post(`${BASE_URL_BENEFIT}/predictBenefits`, requestBody);

  return response.data.prediction;
}


module.exports = {
  MatchingModel,
  formatArray,
  formatExperience,
  formatEducation,
  getDegreeNames,
  formatCandidateExperience,
  BenefitPredictionModel
};

