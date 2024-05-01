const Job = require("../models/Job");
const { verifyToken } = require("./verifyToken");
const axios = require("axios");

const router = require("express").Router();

//CREATE
router.post("/", verifyToken, async (req, res) => {
  try {
    const newJob = new Job(req.body);
    const savedJob = await newJob.save();
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
    const job = await Job.findById(req.params.id);
    // const { password, ...others } = Job._doc;
    res.status(200).json(job);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//GET ALL Job
router.get("/", verifyToken, async (req, res) => {
  const query = req.query.new;
  try {
    const jobs = query
      ? await Job.find().sort({ _id: -1 }).limit(5)
      : await Job.find();
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
    const Jobs = await Job.find({ userId: req.params.userId });
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

// Endpoint for inserting candidate ID into candidate_id_list
router.put("/apply/:jobId", verifyToken, async (req, res) => {
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

    if (job.candidate_id_list.includes(candidateId)) {
      return res
        .status(400)
        .json({ error: "Candidate already applied for this job" });
    }

    // Push the candidate ID into candidate_id_list array
    job.candidate_id_list.push(candidateId);

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

module.exports = router;
