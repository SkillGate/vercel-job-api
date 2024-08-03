const { PROD_AUTH_BASE_URL } = require("../config/config");
const Job = require("../models/Job");
const ExplainableAIModel = require("../service/explainableAIModel");
const { MatchingModel } = require("../service/matchingPersona");
const { verifyToken } = require("./verifyToken");
const axios = require("axios");

const router = require("express").Router();

//CREATE
router.post("/", verifyToken, async (req, res) => {
  try {
    const newJob = new Job(req.body);
    const savedJob = await newJob.save();

    const userId = newJob.userId;
    const token = req.headers.authorization;
    const increaseJobCountUrl = `${PROD_AUTH_BASE_URL}/user/applications/${userId}`;

    await axios.put(increaseJobCountUrl, null, {
      headers: {
        Authorization: token,
      },
    });

    res.status(201).json(savedJob);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//UPDATE
router.put("/:id", verifyToken, async (req, res) => {
  if (!req.params.id) {
    return res.status(400).json({ error: "ID is required" });
  }

  try {
    const updatedJob = await Job.findByIdAndUpdate(
      req.params.id,
      {
        $set: req.body,
      },
      { new: true }
    );
    res.status(200).json(updatedJob);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//DELETE
router.delete("/:id", verifyToken, async (req, res) => {
  if (!req.params.id) {
    return res.status(400).json({ error: "ID is required" });
  }

  try {
    await Job.findByIdAndDelete(req.params.id);
    res.status(200).json("Job has been deleted...");
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//GET Job
router.get("/find/:id", verifyToken, async (req, res) => {
  if (!req.params.id) {
    return res.status(400).json({ error: "ID is required" });
  }
  try {
    const job = await Job.findById(req.params.id).sort({ createdAt: -1 });
    // const { password, ...others } = Job._doc;
    res.status(200).json(job);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//GET ALL Job
router.get("/", verifyToken, async (req, res) => {
  const query = req.query.new;
  const filter = {
    $or: [{ isActive: { $exists: false } }, { isActive: true }],
  };

  try {
    const jobs = query
      ? await Job.find(filter).sort({ createdAt: -1 }).limit(5)
      : await Job.find(filter).sort({ createdAt: -1 });
    res.status(200).json(jobs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//GET Jobs by userId
router.get("/find/jobs/:userId", verifyToken, async (req, res) => {
  if (!req.params.userId) {
    return res.status(400).json({ error: "UserId is required" });
  }
  try {
    const Jobs = await Job.find({
      userId: req.params.userId,
      $or: [{ isActive: { $exists: false } }, { isActive: true }],
    }).sort({ createdAt: -1 });
    res.status(200).json(Jobs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//GET Job STATS
router.get("/stats", verifyToken, async (req, res) => {
  const date = new Date();
  const lastYear = new Date(date.setFullYear(date.getFullYear() - 1));

  try {
    const data = await Job.aggregate([
      { $match: { createdAt: { $gte: lastYear } } },
      {
        $project: {
          month: { $month: "$createdAt" },
        },
      },
      {
        $group: {
          _id: "$month",
          total: { $sum: 1 },
        },
      },
    ]);
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put("/apply/:jobId", verifyToken, async (req, res) => {
  const { candidateId, candidate_persona } = req.body;

  const jobId = req.params.jobId;

  if (!jobId) {
    return res.status(400).json({ error: "Job ID is required" });
  }

  if (!candidateId) {
    return res.status(400).json({ error: "Candidate ID is required" });
  }

  if (!candidate_persona) {
    return res.status(400).json({ error: "Please attach candidate profile" });
  }

  try {
    const job = await Job.findById(jobId);

    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }

    if (job.candidate_id_list.includes(candidateId)) {
      return res
        .status(400)
        .json({ error: "Candidate already applied for this job" });
    }

    try {
      const prediction = await MatchingModel(candidate_persona, job, res);
      console.log("Prediction:", prediction);

      prediction["candidate_id"] = candidateId;

      const updatedJob = await Job.findByIdAndUpdate(
        jobId,
        { $push: { persona_matching_score: prediction } },
        { new: true }
      );

      if (!updatedJob) {
        console.log("Job not found or not updated.");
      } else {
        console.log("Job updated successfully:", updatedJob);

        updatedJob.candidate_id_list.push(candidateId);

        const savedJob = await updatedJob.save();
        console.log("Job saved successfully:", savedJob);
        res.status(200).json(savedJob);
      }
    } catch (error) {
      console.error("Error updating job:", error);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put("/saved/:jobId", verifyToken, async (req, res) => {
  const { candidateId } = req.body;
  const jobId = req.params.jobId;

  if (!jobId) {
    return res.status(400).json({ error: "Job ID is required" });
  }

  if (!candidateId) {
    return res.status(400).json({ error: "Candidate ID is required" });
  }

  try {
    // Find the job by its ID
    const job = await Job.findById(jobId);

    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }

    if (job.saved_candidate_id_list.includes(candidateId)) {
      return res
        .status(400)
        .json({ error: "Candidate already applied for this job" });
    }

    // Push the candidate ID into saved_candidate_id_list array
    job.saved_candidate_id_list.push(candidateId);

    // Save the updated job
    const updatedJob = await job.save();

    res.status(200).json(updatedJob);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Endpoint for updating job status
router.put("/status/:jobId", verifyToken, async (req, res) => {
  const { jobStatus } = req.body;
  const jobId = req.params.jobId;

  if (!jobId) {
    return res.status(400).json({ error: "Job ID is required" });
  }

  if (!jobStatus || !jobStatus.trim()) {
    return res.status(400).json({ error: "Job status is required" });
  }

  // Check if the provided job status is valid
  if (!["Opening", "Close"].includes(jobStatus)) {
    return res.status(400).json({ error: "Invalid job status" });
  }

  try {
    // Find the job by its ID
    const job = await Job.findById(jobId);

    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }

    // Update the job status
    job.job_status = jobStatus;

    // Save the updated job
    const updatedJob = await job.save();

    res.status(200).json(updatedJob);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//GET USER DATA BASED ON JOB IDs
router.post("/jobs/details", async (req, res) => {
  const { jobIds } = req.body;
  // const userIds = candidateIds.split(",");

  if (!jobIds) {
    return res.status(404).json({ error: "jobIds not found" });
  }

  try {
    const users = await Job.find({ _id: { $in: jobIds } });

    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//GET EXPLAINABLE AI DATA
router.put("/explain/:jobId", verifyToken, async (req, res) => {
  const { candidateId, candidate_persona, category } = req.body;

  const jobId = req.params.jobId;

  if (!jobId) {
    return res.status(400).json({ error: "Job ID is required" });
  }

  if (!candidateId) {
    return res.status(400).json({ error: "Candidate ID is required" });
  }

  if (!candidate_persona) {
    return res.status(400).json({ error: "Please attach candidate profile" });
  }

  const allowedTypes = [
    "technical_skills",
    "education",
    "soft_skills",
    "experience",
  ];
  if (!allowedTypes.includes(category)) {
    return res.status(400).json({ error: "Invalid category" });
  }

  try {
    const job = await Job.findById(jobId);

    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }

    try {
      const prediction = await ExplainableAIModel(
        candidate_persona,
        job,
        res,
        category
      );
      // console.log("Prediction:", prediction);

      // const updatedJob = await Job.findByIdAndUpdate(
      //   jobId,
      //   { $push: { persona_matching_score: prediction } },
      //   { new: true }
      // );

      // if (!updatedJob) {
      //   console.log("Job not found or not updated.");
      // } else {
      //   console.log("Job updated successfully:", updatedJob);

      //   updatedJob.candidate_id_list.push(candidateId);

      //   const savedJob = await updatedJob.save();
      //   console.log("Job saved successfully:", savedJob);
      //   res.status(200).json(savedJob);
      // }
      res.status(200).json(prediction);
    } catch (error) {
      console.error("Error updating job:", error);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update isRemoved
router.put("/:id/isRemoved", verifyToken, async (req, res) => {
  try {
    const jobId = req.params.id;
    const { isRemoved } = req.body;

    if (typeof isRemoved !== "boolean") {
      return res
        .status(400)
        .json({ error: "isRemoved must be a boolean value" });
    }

    const updatedJob = await Job.findByIdAndUpdate(
      jobId,
      { isRemoved },
      { new: true }
    );

    if (!updatedJob) {
      return res.status(404).json({ error: "Job not found" });
    }

    res.status(200).json({
      message: "Job removal status updated successfully",
      isRemoved: updatedJob.isRemoved,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update isActive
router.put("/:id/isActive", verifyToken, async (req, res) => {
  try {
    const jobId = req.params.id;
    const { isActive } = req.body;

    if (typeof isActive !== "boolean") {
      return res
        .status(400)
        .json({ error: "isActive must be a boolean value" });
    }

    const updatedJob = await Job.findByIdAndUpdate(
      jobId,
      { isActive },
      { new: true }
    );

    if (!updatedJob) {
      return res.status(404).json({ error: "Job not found" });
    }

    res.status(200).json({
      message: "Job status updated successfully",
      isActive: updatedJob.isActive,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
