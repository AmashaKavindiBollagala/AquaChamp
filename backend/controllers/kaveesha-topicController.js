import Topic from "../models/kaveesha-topicModel.js";
import Subtopic from "../models/kaveesha-subtopicModel.js";
import fs from "fs";
import path from "path";

function diskPathForTopicImage(imageUrl) {
  if (!imageUrl || !imageUrl.startsWith("/uploads/images/")) return null;
  return path.join(process.cwd(), imageUrl.replace(/^\/+/, ""));
}

function unlinkTopicImageIfLocal(imageUrl) {
  const p = diskPathForTopicImage(imageUrl);
  if (p && fs.existsSync(p)) {
    try {
      fs.unlinkSync(p);
    } catch (e) {
      console.error("unlink topic image:", e);
    }
  }
}

// create topic
export const createTopic = async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title) {
      return res.status(400).json({ message: "Topic title is required" });
    }

    const topic = await Topic.create({ title, description });

    res.status(201).json(topic);
  } catch (error) {
    // duplicate title error
    if (error.code === 11000) {
      return res.status(400).json({
        message: "Topic already exists",
      });
    }

    res.status(500).json({ message: error.message });
  }
};

// get all topics
export const getTopics = async (req, res) => {
  try {
    const topics = await Topic.find();
    res.json(topics);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// get topic by id
export const getTopicById = async (req, res) => {
  try {
    const topic = await Topic.findById(req.params.id);
    res.json(topic);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// update topic
export const updateTopic = async (req, res) => {
  try {
    const { title } = req.body;

    if (title) {
      const exists = await Topic.findOne({
        title,
        _id: { $ne: req.params.id },
      });

      if (exists) {
        return res.status(400).json({
          message: "Another topic with this title already exists",
        });
      }
    }

    const topic = await Topic.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    res.json(topic);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const uploadTopicImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No image uploaded" });
    }

    const topic = await Topic.findById(req.params.id);
    if (!topic) {
      return res.status(404).json({ message: "Topic not found" });
    }

    if (topic.imageUrl) {
      unlinkTopicImageIfLocal(topic.imageUrl);
    }

    topic.imageUrl = `/uploads/images/${req.file.filename}`;
    await topic.save();
    res.json(topic);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteTopicImage = async (req, res) => {
  try {
    const topic = await Topic.findById(req.params.id);
    if (!topic) {
      return res.status(404).json({ message: "Topic not found" });
    }

    if (topic.imageUrl) {
      unlinkTopicImageIfLocal(topic.imageUrl);
    }

    topic.imageUrl = null;
    await topic.save();
    res.json(topic);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// delete topic

// delete topic with restrict check
export const deleteTopic = async (req, res) => {
  try {
    const topicId = req.params.id;

    const topicDoc = await Topic.findById(topicId);
    if (!topicDoc) {
      return res.status(404).json({ message: "Topic not found" });
    }

    // Check if subtopics exist under this topic
    const subtopics = await Subtopic.find({ topicId });
    if (subtopics.length > 0) {
      return res.status(400).json({
        message:
          "Cannot delete topic because it has subtopics. Delete subtopics first.",
      });
    }

    if (topicDoc.imageUrl) {
      unlinkTopicImageIfLocal(topicDoc.imageUrl);
    }

    await Topic.findByIdAndDelete(topicId);
    res.json({ message: "Topic deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
