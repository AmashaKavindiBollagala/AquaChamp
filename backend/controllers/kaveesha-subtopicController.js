import Subtopic from "../models/kaveesha-subtopicModel.js";
import MiniQuiz from "../models/kaveesha-miniquizModel.js";
import KaveeshaLessonsProgress from "../models/kaveesha-lessonsProgressModel.js";
import mongoose from "mongoose";
import fs from "fs";
import path from "path";

function diskPathForSubtopicImage(imagePath) {
  if (!imagePath || !imagePath.startsWith("/uploads/images/")) return null;
  const rel = imagePath.replace(/^\/+/, "");
  return path.join(process.cwd(), rel);
}

async function miniQuizExistsForSubtopic(subtopicId, ageGroup) {
  const filter = ageGroup
    ? { subtopicId, ageGroup }
    : { subtopicId };
  const q = await MiniQuiz.findOne(filter);
  return !!q;
}

function getSubtopicContentRequirements(subtopic, hasMiniQuiz) {
  return {
    video: !!(subtopic.videoUrl && String(subtopic.videoUrl).trim()),
    text: !!(
      (subtopic.content && String(subtopic.content).trim()) ||
      (subtopic.contentFiles && subtopic.contentFiles.length > 0)
    ),
    images: !!(subtopic.images && subtopic.images.length > 0),
    miniQuiz: !!hasMiniQuiz,
  };
}

function countRequirements(req) {
  return Object.values(req).filter(Boolean).length;
}

function completedCountForRequirements(progress, req) {
  let n = 0;
  if (req.video && progress.videoCompleted) n++;
  if (req.text && progress.textCompleted) n++;
  if (req.images && progress.imagesCompleted) n++;
  if (req.miniQuiz && progress.miniQuizCompleted) n++;
  return n;
}

function isSubtopicFullyDone(progress, req) {
  const total = countRequirements(req);
  if (total === 0) return false;
  return completedCountForRequirements(progress, req) >= total;
}

function percentageFromProgress(progress, req) {
  const total = countRequirements(req);
  if (total === 0) return 0;
  return Math.round(
    (completedCountForRequirements(progress, req) / total) * 100,
  );
}

// ------------------ SUBTOPIC CRUD ------------------

// Create subtopic
export const createSubtopic = async (req, res) => {
  try {
    const { title, topicId, ageGroup } = req.body;

    // Check if same title already exists under the same topic and age group
    const existing = await Subtopic.findOne({ title, topicId, ageGroup });
    if (existing) {
      return res.status(400).json({
        message: `Subtopic '${title}' already exists for age group ${ageGroup}.`,
      });
    }

    const subtopic = await Subtopic.create(req.body);
    res.status(201).json(subtopic);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get subtopics (filter by topic & age)
export const getSubtopics = async (req, res) => {
  try {
    const { topicId, ageGroup } = req.query;
    const filter = {};
    if (topicId) filter.topicId = topicId;
    if (ageGroup) filter.ageGroup = ageGroup;

    const subtopics = await Subtopic.find(filter).sort({ order: 1 });

    // If no subtopics, send message with empty array
    if (subtopics.length === 0) {
      return res.json({
        message: "No subtopics found for this topic",
        subtopics: [],
      });
    }

    // Otherwise return subtopics
    res.json(subtopics);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get one subtopic by ID
export const getSubtopicById = async (req, res) => {
  try {
    const subtopic = await Subtopic.findById(req.params.id);

    if (!subtopic) {
      return res.status(404).json({ message: "Subtopic not found" });
    }

    res.json(subtopic);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update subtopic
export const updateSubtopic = async (req, res) => {
  try {
    const { title, topicId, ageGroup } = req.body;

    // Check for duplicate first
    const existing = await Subtopic.findOne({
      _id: { $ne: req.params.id },
      title,
      topicId,
      ageGroup,
    });
    if (existing)
      return res
        .status(400)
        .json({ message: "Subtopic already exists for this age group" });

    const subtopic = await Subtopic.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    res.json(subtopic);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete subtopic
export const deleteSubtopic = async (req, res) => {
  try {
    const subtopic = await Subtopic.findById(req.params.id);
    if (!subtopic)
      return res.status(404).json({ message: "Subtopic not found" });

    // Check for any content: video, text, images, or miniquiz
    const hasMiniQuiz = await MiniQuiz.findOne({ subtopicId: subtopic._id });
    if (
      subtopic.videoUrl ||
      subtopic.content ||
      (subtopic.images && subtopic.images.length > 0) ||
      hasMiniQuiz
    ) {
      return res.status(400).json({
        message: "Cannot delete subtopic with content. Delete contents first.",
      });
    }

    await Subtopic.findByIdAndDelete(subtopic._id);
    res.json({ message: "Subtopic deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get lessons by user age
export const getLessonsByUserAge = async (req, res) => {
  try {
    const age = parseInt(req.params.age);

    if (age >= 5 && age <= 10) {
      const lessons = await Subtopic.find({ ageGroup: "6-10" }).sort({
        order: 1,
      });
      return res.json({ basic: lessons });
    } else if (age >= 11 && age <= 15) {
      const basicLessons = await Subtopic.find({ ageGroup: "6-10" }).sort({
        order: 1,
      });
      const mainLessons = await Subtopic.find({ ageGroup: "11-15" }).sort({
        order: 1,
      });
      return res.json({ basic: basicLessons, main: mainLessons });
    } else {
      return res.status(400).json({ message: "Invalid age" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ------------------ UPDATE CONTENT ------------------

// Update video
export const updateVideo = async (req, res) => {
  try {
    const updateData = {};
    
    // Check if video file was uploaded
    if (req.file) {
      updateData.videoUrl = `/uploads/videos/${req.file.filename}`;
      updateData.videoType = "upload";
    } 
    // Otherwise use YouTube URL from request body
    else if (req.body.videoUrl) {
      updateData.videoUrl = req.body.videoUrl;
      updateData.videoType = req.body.videoType || "youtube";
    } else {
      return res.status(400).json({ message: "Please provide a video file or YouTube URL" });
    }
    
    const subtopic = await Subtopic.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true },
    );
    
    if (!subtopic) {
      return res.status(404).json({ message: "Subtopic not found" });
    }
    
    res.json(subtopic);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete video
export const deleteVideo = async (req, res) => {
  try {
    const subtopic = await Subtopic.findByIdAndUpdate(
      req.params.id,
      { videoUrl: null, videoType: null },
      { new: true },
    );
    res.json({ message: "Video deleted", subtopic });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update text
export const updateText = async (req, res) => {
  try {
    const updateData = {};
    
    if (req.body.content !== undefined) {
      updateData.content = req.body.content;
    }
    if (req.body.contentType !== undefined) {
      updateData.contentType = req.body.contentType;
    }
    if (req.body.contentFiles !== undefined) {
      updateData.contentFiles = req.body.contentFiles;
    }
    
    const subtopic = await Subtopic.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true },
    );
    res.json(subtopic);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete text
export const deleteText = async (req, res) => {
  try {
    const subtopic = await Subtopic.findByIdAndUpdate(
      req.params.id,
      { content: null, contentType: "text", contentFiles: [] },
      { new: true },
    );
    res.json({ message: "Content deleted", subtopic });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Upload content file (PDF, Presentation)
export const uploadContentFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    
    const subtopic = await Subtopic.findById(req.params.id);
    if (!subtopic) {
      return res.status(404).json({ message: "Subtopic not found" });
    }
    
    // Initialize contentFiles array if it doesn't exist
    if (!subtopic.contentFiles) {
      subtopic.contentFiles = [];
    }
    
    // Add new file to the array
    const fileType = req.body.fileType || "pdf";
    subtopic.contentFiles.push({
      name: req.file.originalname,
      url: `/uploads/content/${req.file.filename}`,
      type: fileType,
      size: req.file.size,
      uploadedAt: new Date()
    });
    
    // Set content type based on file type
    subtopic.contentType = fileType;
    
    await subtopic.save();
    
    res.json({
      message: "File uploaded successfully",
      subtopic,
      contentFiles: subtopic.contentFiles
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete individual content file
export const deleteContentFile = async (req, res) => {
  try {
    const { fileId } = req.body;
    const subtopic = await Subtopic.findById(req.params.id);
    
    if (!subtopic) {
      return res.status(404).json({ message: "Subtopic not found" });
    }
    
    if (!subtopic.contentFiles || subtopic.contentFiles.length === 0) {
      return res.status(400).json({ message: "No files found" });
    }
    
    // Find the file to delete
    const fileToDelete = subtopic.contentFiles.id(fileId);
    if (!fileToDelete) {
      return res.status(404).json({ message: "File not found" });
    }
    
    // Delete file from filesystem
    const fs = await import('fs');
    const path = await import('path');
    const filePath = path.join(process.cwd(), fileToDelete.url);
    
    try {
      if (fs.default.existsSync(filePath)) {
        fs.default.unlinkSync(filePath);
      }
    } catch (err) {
      console.error("Error deleting file from filesystem:", err);
    }
    
    // Remove file from array
    subtopic.contentFiles = subtopic.contentFiles.filter(f => f._id.toString() !== fileId);
    
    // If no files left, reset content type
    if (subtopic.contentFiles.length === 0) {
      subtopic.contentType = "text";
    }
    
    await subtopic.save();
    
    res.json({
      message: "File deleted successfully",
      subtopic,
      contentFiles: subtopic.contentFiles
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update images
export const updateImages = async (req, res) => {
  try {
    const subtopic = await Subtopic.findById(req.params.id);

    if (!subtopic) {
      return res.status(404).json({ message: "Subtopic not found" });
    }

    // Delete old images from uploads folder
    if (subtopic.images && subtopic.images.length > 0) {
      subtopic.images.forEach((imgPath) => {
        if (imgPath.startsWith("/uploads/images/")) {
          const filePath = path.join("uploads/images", path.basename(imgPath));
          if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        }
      });
    }

    let imagePaths = [];

    // Images uploaded from device
    if (req.files && req.files.length > 0) {
      const uploadedImages = req.files.map(
        (file) => `/uploads/images/${file.filename}`,
      );
      imagePaths = [...imagePaths, ...uploadedImages];
    }

    // Images pasted as URLs
    if (req.body.imageUrls) {
      const urls = Array.isArray(req.body.imageUrls)
        ? req.body.imageUrls
        : [req.body.imageUrls];
      imagePaths = [...imagePaths, ...urls];
    }

    if (imagePaths.length === 0) {
      return res.status(400).json({
        message: "No images provided (upload file or paste URL)",
      });
    }

    subtopic.images = imagePaths;
    await subtopic.save();

    res.json({
      message: "Images updated successfully",
      images: subtopic.images,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete images
export const deleteImages = async (req, res) => {
  try {
    const subtopic = await Subtopic.findById(req.params.id);
    if (!subtopic)
      return res.status(404).json({ message: "Subtopic not found" });

    // Delete files from disk
    if (subtopic.images && subtopic.images.length > 0) {
      subtopic.images.forEach((imgPath) => {
        if (imgPath.startsWith("/uploads/images/")) {
          const filePath = path.join("uploads/images", path.basename(imgPath));
          if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        }
      });
    }

    subtopic.images = [];
    await subtopic.save();

    res.json({ message: "Images deleted successfully", subtopic });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Append one uploaded image (does not remove existing)
export const appendSubtopicImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No image uploaded" });
    }

    const subtopic = await Subtopic.findById(req.params.id);
    if (!subtopic) {
      return res.status(404).json({ message: "Subtopic not found" });
    }

    if (!subtopic.images) subtopic.images = [];
    subtopic.images.push(`/uploads/images/${req.file.filename}`);
    await subtopic.save();

    res.json({
      message: "Image added",
      subtopic,
      images: subtopic.images,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Append one image URL
export const appendSubtopicImageUrl = async (req, res) => {
  try {
    const raw = (req.body?.imageUrl ?? "").trim();
    if (!raw) {
      return res.status(400).json({ message: "imageUrl is required" });
    }
    if (!/^https?:\/\//i.test(raw)) {
      return res.status(400).json({ message: "Invalid image URL" });
    }

    const subtopic = await Subtopic.findById(req.params.id);
    if (!subtopic) {
      return res.status(404).json({ message: "Subtopic not found" });
    }

    if (!subtopic.images) subtopic.images = [];
    subtopic.images.push(raw);
    await subtopic.save();

    res.json({
      message: "Image URL added",
      subtopic,
      images: subtopic.images,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete individual image
export const deleteSingleImage = async (req, res) => {
  try {
    const { imagePath } = req.body;
    const subtopic = await Subtopic.findById(req.params.id);
    
    if (!subtopic) {
      return res.status(404).json({ message: "Subtopic not found" });
    }
    
    if (!subtopic.images || subtopic.images.length === 0) {
      return res.status(400).json({ message: "No images found" });
    }
    
    const imageToDelete = imagePath;
    const idx = subtopic.images.findIndex((img) => img === imageToDelete);
    if (idx === -1) {
      return res.status(404).json({ message: "Image not found" });
    }
    
    const filePath = diskPathForSubtopicImage(imageToDelete);
    if (filePath) {
      try {
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      } catch (err) {
        console.error("Error deleting image from filesystem:", err);
      }
    }
    
    subtopic.images.splice(idx, 1);
    
    await subtopic.save();
    
    res.json({
      message: "Image deleted successfully",
      subtopic,
      images: subtopic.images
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update individual image (replace with new upload)
export const updateSingleImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No image uploaded" });
    }
    
    const { oldImagePath, imageIndex } = req.body;
    const subtopic = await Subtopic.findById(req.params.id);
    
    if (!subtopic) {
      return res.status(404).json({ message: "Subtopic not found" });
    }
    
    if (!subtopic.images || subtopic.images.length === 0) {
      return res.status(400).json({ message: "No images found to update" });
    }
    
    let idx =
      oldImagePath !== undefined && oldImagePath !== ""
        ? subtopic.images.findIndex((img) => img === oldImagePath)
        : -1;
    if (idx === -1 && imageIndex !== undefined && imageIndex !== "") {
      idx = parseInt(imageIndex, 10);
    }
    if (isNaN(idx) || idx < 0 || idx >= subtopic.images.length) {
      return res.status(400).json({ message: "Image not found" });
    }
    
    const oldPath = subtopic.images[idx];
    const oldFilePath = diskPathForSubtopicImage(oldPath);
    if (oldFilePath) {
      try {
        if (fs.existsSync(oldFilePath)) fs.unlinkSync(oldFilePath);
      } catch (err) {
        console.error("Error deleting old image:", err);
      }
    }
    
    subtopic.images[idx] = `/uploads/images/${req.file.filename}`;
    
    await subtopic.save();
    
    res.json({
      message: "Image updated successfully",
      subtopic,
      images: subtopic.images
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ------------------ PROGRESSION & LOCKING ------------------

// Complete subtopic content
export const completeSubtopicContent = async (req, res) => {
  try {
    const { userId, contentType, miniQuizAnswers } = req.body;
    const subtopicId = req.params.id;

    // Check if subtopicId is a valid ObjectId
    if (!mongoose.isValidObjectId(subtopicId)) {
      return res.status(400).json({ message: "Invalid subtopic ID" });
    }

    // Check if subtopic exists
    const currentSubtopic = await Subtopic.findById(subtopicId);
    if (!currentSubtopic) {
      return res.status(404).json({ message: "Subtopic not found" });
    }

    // Fetch progress or create new
    let progress = await KaveeshaLessonsProgress.findOne({
      userId,
      subtopicId,
    });
    if (!progress)
      progress = new KaveeshaLessonsProgress({ userId, subtopicId });

    // Regular content
    if (contentType === "video") progress.videoCompleted = true;
    else if (contentType === "text") progress.textCompleted = true;
    else if (contentType === "images") progress.imagesCompleted = true;
    // MiniQuiz
    else if (contentType === "miniQuiz") {
      const quiz = await MiniQuiz.findOne({
        subtopicId,
        ageGroup: currentSubtopic.ageGroup,
      });
      if (!quiz) {
        progress.miniQuizCompleted = true;
      } else if (miniQuizAnswers && miniQuizAnswers.length > 0) {
        let allCorrect = true;
        for (const ans of miniQuizAnswers) {
          const question = quiz.questions.id(ans.questionId);
          if (!question || question.correctAnswer !== ans.selectedOption) {
            allCorrect = false;
            break;
          }
        }

        if (!allCorrect) {
          return res.json({
            message: "Some answers are incorrect. Retry the quiz.",
            progress,
          });
        }

        progress.miniQuizCompleted = true;
      } else {
        progress.miniQuizCompleted = true;
      }
    }

    const subForReq = await Subtopic.findById(subtopicId);
    const hasMq = await miniQuizExistsForSubtopic(
      subtopicId,
      subForReq.ageGroup,
    );
    const reqSlots = getSubtopicContentRequirements(subForReq, hasMq);

    if (isSubtopicFullyDone(progress, reqSlots)) {
      progress.isSubtopicCompleted = true;
      progress.completedAt = new Date();
    }

    await progress.save();
    res.json({ message: "Progress updated", progress });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ------------------ PROGRESS PERCENTAGES ------------------

// Subtopic % completion
export const getSubtopicProgress = async (req, res) => {
  try {
    const { userId, subtopicId } = req.query;

    // Validate IDs
    if (!mongoose.isValidObjectId(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    if (!mongoose.isValidObjectId(subtopicId)) {
      return res.status(400).json({ message: "Invalid subtopic ID" });
    }

    // Check if subtopic exists
    const subtopic = await Subtopic.findById(subtopicId);
    if (!subtopic) {
      return res.status(404).json({ message: "Subtopic not found" });
    }

    const hasMq = await miniQuizExistsForSubtopic(
      subtopicId,
      subtopic.ageGroup,
    );
    const reqSlots = getSubtopicContentRequirements(subtopic, hasMq);

    const progress = await KaveeshaLessonsProgress.findOne({
      userId,
      subtopicId,
    });
    if (!progress) {
      return res.json({ percentage: 0, progress: null, requirements: reqSlots });
    }

    const percentage = percentageFromProgress(progress, reqSlots);
    res.json({ percentage, progress, requirements: reqSlots });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Topic % completion for relevant age group
export const getTopicProgress = async (req, res) => {
  try {
    const { userId, topicId, ageGroup } = req.body;

    if (!userId || !topicId || !ageGroup)
      return res
        .status(400)
        .json({ message: "userId, topicId and ageGroup required" });

    if (!["6-10", "11-15"].includes(ageGroup))
      return res.status(400).json({ message: "Invalid age group" });

    const subtopics = await Subtopic.find({ topicId, ageGroup });

    if (subtopics.length === 0) return res.json({ percentage: 0 });

    let completableCount = 0;
    let fullyCompleteCount = 0;

    for (const sub of subtopics) {
      const hasMq = await miniQuizExistsForSubtopic(sub._id, sub.ageGroup);
      const reqSlots = getSubtopicContentRequirements(sub, hasMq);
      const denom = countRequirements(reqSlots);
      if (denom === 0) continue;

      completableCount += 1;
      const prog = await KaveeshaLessonsProgress.findOne({
        userId,
        subtopicId: sub._id,
      });

      if (prog && isSubtopicFullyDone(prog, reqSlots)) {
        fullyCompleteCount += 1;
      }
    }

    const percentage =
      completableCount === 0
        ? 0
        : Math.round((fullyCompleteCount / completableCount) * 100);

    res.json({ percentage });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
