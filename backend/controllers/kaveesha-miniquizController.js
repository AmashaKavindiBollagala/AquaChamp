import mongoose from "mongoose";
import MiniQuiz from "../models/kaveesha-miniquizModel.js";

/** Normalize and validate questions for create/update (matches student-side string compare). */
function normalizeQuestions(raw) {
  if (!Array.isArray(raw)) {
    throw new Error("questions must be an array");
  }
  if (raw.length === 0) {
    throw new Error("At least one question is required");
  }

  return raw.map((q, i) => {
    const question = String(q.question ?? "").trim();
    if (!question) {
      throw new Error(`Question ${i + 1}: text is required`);
    }

    const opts = Array.isArray(q.options)
      ? q.options.map((o) => String(o ?? "").trim()).filter(Boolean)
      : [];
    if (opts.length < 2) {
      throw new Error(`Question ${i + 1}: at least 2 non-empty options are required`);
    }

    const correctAnswer = String(q.correctAnswer ?? "").trim();
    if (!correctAnswer) {
      throw new Error(`Question ${i + 1}: mark the correct answer`);
    }
    if (!opts.includes(correctAnswer)) {
      throw new Error(`Question ${i + 1}: correct answer must match one of the options`);
    }

    const out = { question, options: opts, correctAnswer };
    if (q._id != null && mongoose.isValidObjectId(String(q._id))) {
      out._id = q._id;
    }
    return out;
  });
}

// create mini quiz
export const createMiniQuiz = async (req, res) => {
  try {
    const { subtopicId, ageGroup, questions } = req.body;

    if (!subtopicId || !ageGroup) {
      return res.status(400).json({
        message: "subtopicId and ageGroup are required",
      });
    }

    if (!["6-10", "11-15"].includes(ageGroup)) {
      return res.status(400).json({ message: "Invalid ageGroup" });
    }

    let normalized;
    try {
      normalized = normalizeQuestions(questions);
    } catch (e) {
      return res.status(400).json({ message: e.message });
    }

    const quiz = await MiniQuiz.create({
      subtopicId,
      ageGroup,
      questions: normalized,
    });
    res.status(201).json(quiz);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// get quiz by subtopic & age
export const getMiniQuiz = async (req, res) => {
  try {
    const { subtopicId, ageGroup } = req.query;

    if (!subtopicId || !ageGroup) {
      return res.status(400).json({
        message: "subtopicId and ageGroup are required",
      });
    }

    const quiz = await MiniQuiz.findOne({ subtopicId, ageGroup });

    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    res.json(quiz);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// update quiz (admin)
export const updateMiniQuiz = async (req, res) => {
  try {
    const quiz = await MiniQuiz.findById(req.params.id);

    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    const { ageGroup, questions } = req.body;

    if (ageGroup !== undefined) {
      if (!["6-10", "11-15"].includes(ageGroup)) {
        return res.status(400).json({ message: "Invalid ageGroup" });
      }
      quiz.ageGroup = ageGroup;
    }

    if (questions !== undefined) {
      try {
        quiz.questions = normalizeQuestions(questions);
      } catch (e) {
        return res.status(400).json({ message: e.message });
      }
    }

    await quiz.save();
    res.json(quiz);
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: error.message });
  }
};

// delete quiz (admin)
export const deleteMiniQuiz = async (req, res) => {
  try {
    const quiz = await MiniQuiz.findByIdAndDelete(req.params.id);

    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    res.json({ message: "Quiz deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
