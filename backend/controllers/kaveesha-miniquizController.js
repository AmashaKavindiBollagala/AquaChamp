import MiniQuiz from "../models/kaveesha-miniquizModel.js";

// create mini quiz
export const createMiniQuiz = async (req, res) => {
  try {
    const quiz = await MiniQuiz.create(req.body);
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
    const quiz = await MiniQuiz.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    res.json(quiz);
  } catch (error) {
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
