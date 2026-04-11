import Topic from "../models/kaveesha-topicModel.js";
import Subtopic from "../models/kaveesha-subtopicModel.js";
import cloudinary from "../config/cloudinary.js";
import streamifier from "streamifier";

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



// CLOUDINARY IMAGE UPLOAD (UPDATED)
export const uploadTopicImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No image uploaded" });
    }

    const topic = await Topic.findById(req.params.id);
    if (!topic) {
      return res.status(404).json({ message: "Topic not found" });
    }

    // delete old image from cloudinary (if exists)
    if (topic.imageUrl) {
      try {
        const parts = topic.imageUrl.split("/");
        const file = parts[parts.length - 1];
        const publicId = `topics/${file.split(".")[0]}`;

        await cloudinary.uploader.destroy(publicId);
      } catch (err) {
        console.log("Old image delete error:", err.message);
      }
    }

    // upload new image to cloudinary
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "topics",
          resource_type: "image",
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(req.file.buffer);
    });

    topic.imageUrl = result.secure_url;
    await topic.save();

    res.json(topic);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



// DELETE IMAGE (CLOUDINARY VERSION)
export const deleteTopicImage = async (req, res) => {
  try {
    const topic = await Topic.findById(req.params.id);
    if (!topic) {
      return res.status(404).json({ message: "Topic not found" });
    }

    // delete from cloudinary
    if (topic.imageUrl) {
      try {
        const parts = topic.imageUrl.split("/");
        const file = parts[parts.length - 1];
        const publicId = `topics/${file.split(".")[0]}`;

        await cloudinary.uploader.destroy(publicId);
      } catch (err) {
        console.log("Cloudinary delete error:", err.message);
      }
    }

    topic.imageUrl = null;
    await topic.save();

    res.json(topic);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



// delete topic with restrict check
export const deleteTopic = async (req, res) => {
  try {
    const topicId = req.params.id;

    const topicDoc = await Topic.findById(topicId);
    if (!topicDoc) {
      return res.status(404).json({ message: "Topic not found" });
    }

    const subtopics = await Subtopic.find({ topicId });
    if (subtopics.length > 0) {
      return res.status(400).json({
        message:
          "Cannot delete topic because it has subtopics. Delete subtopics first.",
      });
    }

    // delete cloudinary image if exists
    if (topicDoc.imageUrl) {
      try {
        const parts = topicDoc.imageUrl.split("/");
        const file = parts[parts.length - 1];
        const publicId = `topics/${file.split(".")[0]}`;

        await cloudinary.uploader.destroy(publicId);
      } catch (err) {
        console.log("Cloudinary delete error:", err.message);
      }
    }

    await Topic.findByIdAndDelete(topicId);

    res.json({ message: "Topic deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};