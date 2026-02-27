import Subtopic from "../models/kaveesha-subtopicModel.js";
import MiniQuiz from "../models/kaveesha-miniquizModel.js";
import KaveeshaLessonsProgress from "../models/kaveesha-lessonsProgressModel.js";
import mongoose from "mongoose";

// ------------------ SUBTOPIC CRUD ------------------

// Create subtopic
export const createSubtopic = async (req, res) => {
  try {
    const { title, topicId, ageGroup } = req.body;

    // Check if same title already exists under the same topic and age group
    const existing = await Subtopic.findOne({ title, topicId, ageGroup });
    if (existing) {
      return res
        .status(400)
        .json({
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
      return res
        .status(400)
        .json({
          message:
            "Cannot delete subtopic with content. Delete contents first.",
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

    if (age >= 6 && age <= 10) {
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
    const subtopic = await Subtopic.findByIdAndUpdate(
      req.params.id,
      { videoUrl: req.body.videoUrl },
      { new: true },
    );
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
      { videoUrl: null },
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
    const subtopic = await Subtopic.findByIdAndUpdate(
      req.params.id,
      { content: req.body.content },
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
      { content: null },
      { new: true },
    );
    res.json({ message: "Text deleted", subtopic });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update images
export const updateImages = async (req, res) => {
  try {
    const subtopic = await Subtopic.findByIdAndUpdate(
      req.params.id,
      { images: req.body.images },
      { new: true },
    );
    res.json(subtopic);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete images
export const deleteImages = async (req, res) => {
  try {
    const subtopic = await Subtopic.findByIdAndUpdate(
      req.params.id,
      { images: [] },
      { new: true },
    );
    res.json({ message: "Images deleted", subtopic });
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
      if (!miniQuizAnswers || miniQuizAnswers.length === 0) {
        return res.status(400).json({ message: "No quiz answers provided" });
      }

      // Fetch quiz questions
      const quiz = await MiniQuiz.findOne({ subtopicId });
      if (!quiz) return res.status(404).json({ message: "MiniQuiz not found" });

      // Validate answers
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
    }

    // Fully completed?
    if (
      progress.videoCompleted &&
      progress.textCompleted &&
      progress.imagesCompleted &&
      progress.miniQuizCompleted
    ) {
      progress.isSubtopicCompleted = true;
      progress.completedAt = new Date();

      // Unlock next subtopic
      const currentSubtopic = await Subtopic.findById(subtopicId);
      const nextSubtopic = await Subtopic.findOne({
        topicId: currentSubtopic.topicId,
        order: currentSubtopic.order + 1,
      });
      if (nextSubtopic) {
        nextSubtopic.isLocked = false;
        await nextSubtopic.save();
      }
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

    // Check if user has any progress
    const progress = await KaveeshaLessonsProgress.findOne({
      userId,
      subtopicId,
    });
    if (!progress) {
      return res
        .status(404)
        .json({
          message:
            "User has no progress for this subtopic or user does not exist",
        });
    }

    const totalItems = 4; // video, text, images, miniQuiz
    let completedItems = 0;
    if (progress.videoCompleted) completedItems++;
    if (progress.textCompleted) completedItems++;
    if (progress.imagesCompleted) completedItems++;
    if (progress.miniQuizCompleted) completedItems++;

    const percentage = Math.round((completedItems / totalItems) * 100);
    res.json({ percentage, progress });
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

    let totalProgress = 0;

    for (const sub of subtopics) {
      const prog = await KaveeshaLessonsProgress.findOne({
        userId,
        subtopicId: sub._id,
      });

      if (prog) {
        let completed = 0;
        if (prog.videoCompleted) completed++;
        if (prog.textCompleted) completed++;
        if (prog.imagesCompleted) completed++;
        if (prog.miniQuizCompleted) completed++;

        totalProgress += completed / 4;
      }
    }

    const percentage = Math.round((totalProgress / subtopics.length) * 100);

    res.json({ percentage });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
