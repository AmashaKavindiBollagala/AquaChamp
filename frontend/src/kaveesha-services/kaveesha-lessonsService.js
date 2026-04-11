// kaveesha-services/kaveesha-lessonsService.js
// Centralized API calls for AquaChamp Lessons Admin

import axios from "axios";
import { API_KEYS } from "./kaveesha-apiConfig";

const BASE = "http://localhost:4000";

const getHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("aquachamp_token") || localStorage.getItem("token")}`,
});

const cfg = { headers: getHeaders(), withCredentials: true };

// ── TOPICS ──
export const topicsAPI = {
  getAll: () => axios.get(`${BASE}/api/topics`),
  getById: (id) => axios.get(`${BASE}/api/topics/${id}`),
  create: (data) => axios.post(`${BASE}/api/topics`, data, { headers: getHeaders(), withCredentials: true }),
  update: (id, data) => axios.put(`${BASE}/api/topics/${id}`, data, { headers: getHeaders(), withCredentials: true }),
  delete: (id) => axios.delete(`${BASE}/api/topics/${id}`, { headers: getHeaders(), withCredentials: true }),
};

// SUBTOPICS
export const subtopicsAPI = {
  getAll: (params) => axios.get(`${BASE}/api/subtopics`, { params }),
  getById: (id) => axios.get(`${BASE}/api/subtopics/${id}`),
  create: (data) => axios.post(`${BASE}/api/subtopics`, data, { headers: getHeaders(), withCredentials: true }),
  update: (id, data) => axios.put(`${BASE}/api/subtopics/${id}`, data, { headers: getHeaders(), withCredentials: true }),
  delete: (id) => axios.delete(`${BASE}/api/subtopics/${id}`, { headers: getHeaders(), withCredentials: true }),

  // Content
  updateVideo: (id, videoUrl) =>
    axios.put(`${BASE}/api/subtopics/video/${id}`, { videoUrl }, { headers: getHeaders(), withCredentials: true }),
  deleteVideo: (id) =>
    axios.delete(`${BASE}/api/subtopics/video/${id}`, { headers: getHeaders(), withCredentials: true }),

  updateText: (id, content) =>
    axios.put(`${BASE}/api/subtopics/text/${id}`, { content }, { headers: getHeaders(), withCredentials: true }),
  deleteText: (id) =>
    axios.delete(`${BASE}/api/subtopics/text/${id}`, { headers: getHeaders(), withCredentials: true }),

  updateImages: (id, formData) =>
    axios.put(`${BASE}/api/subtopics/images/${id}`, formData, {
      headers: { ...getHeaders(), "Content-Type": "multipart/form-data" },
      withCredentials: true,
    }),
  deleteImages: (id) =>
    axios.delete(`${BASE}/api/subtopics/images/${id}`, { headers: getHeaders(), withCredentials: true }),

  // Progress
  getSubtopicProgress: (userId, subtopicId) =>
    axios.get(`${BASE}/api/subtopics/progress/subtopic`, { params: { userId, subtopicId } }),
  getTopicProgress: (userId, topicId, ageGroup) =>
    axios.post(`${BASE}/api/subtopics/progress/topic`, { userId, topicId, ageGroup }),
};

// MINIQUIZ
export const quizAPI = {
  get: (subtopicId, ageGroup) =>
    axios.get(`${BASE}/api/kaveesha-miniquiz`, { params: { subtopicId, ageGroup } }),
  create: (data) =>
    axios.post(`${BASE}/api/kaveesha-miniquiz`, data, { headers: getHeaders(), withCredentials: true }),
  update: (id, data) =>
    axios.put(`${BASE}/api/kaveesha-miniquiz/${id}`, data, { headers: getHeaders(), withCredentials: true }),
  delete: (id) =>
    axios.delete(`${BASE}/api/kaveesha-miniquiz/${id}`, { headers: getHeaders(), withCredentials: true }),
};

// YOUTUBE
export const youtubeAPI = {
  search: async (query) => {
    const key = API_KEYS.YOUTUBE;
    const res = await axios.get("https://www.googleapis.com/youtube/v3/search", {
      params: { part: "snippet", q: query, type: "video", maxResults: 6, key },
    });
    return res.data.items || [];
  },
};

// GEMINI AI
export const geminiAPI = {
  generateContent: async (subtopicTitle, prompt) => {
    try {
      const key = API_KEYS.GEMINI;
      const res = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`,
        {
          contents: [
            {
              parts: [
                {
                  text: `You are an expert swimming coach writing educational lesson content for children aged 6-15. Write clear, engaging, and fun content for this swimming subtopic: "${subtopicTitle}". 

Focus on: ${prompt}

Please include:
- Clear explanations suitable for kids
- Step-by-step instructions
- Safety tips
- Fun facts or encouragement
- Keep it engaging and easy to understand`,
                },
              ],
            },
          ],
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      
      if (res.data.candidates && res.data.candidates[0] && res.data.candidates[0].content) {
        return res.data.candidates[0].content.parts[0].text;
      } else {
        throw new Error("Invalid response from Gemini API");
      }
    } catch (error) {
      console.error("Gemini API Error:", error.response?.data || error.message);
      throw error;
    }
  },
};

// OPENAI
export const openaiAPI = {
  generateLessonContent: async (subtopicTitle, prompt) => {
    const key = API_KEYS.OPENAI;
    const res = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are a swimming coach writing educational lesson content for children aged 6-15. Write clear, engaging, age-appropriate content with practical tips.",
          },
          {
            role: "user",
            content: `Write lesson content for subtopic: "${subtopicTitle}". ${prompt}`,
          },
        ],
        max_tokens: 500,
      },
      {
        headers: {
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/json",
        },
      }
    );
    return res.data.choices[0].message.content;
  },
};