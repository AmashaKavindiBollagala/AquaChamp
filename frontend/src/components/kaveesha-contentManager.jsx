import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { API_KEYS } from "../kaveesha-services/kaveesha-apiConfig";
import { geminiAPI } from "../kaveesha-services/kaveesha-lessonsService";

const API = "http://localhost:4000";

const TABS = [
  { id: "video", label: "Video", icon: "🎬", color: "#ef4444", light: "#fff0f0", border: "#fca5a5" },
  { id: "text", label: "Text", icon: "📝", color: "#6366f1", light: "#f0f4ff", border: "#a5b4fc" },
  { id: "images", label: "Images", icon: "🖼️", color: "#22c55e", light: "#f0fdf4", border: "#86efac" },
  { id: "quiz", label: "Mini Quiz", icon: "❓", color: "#f59e0b", light: "#fffbeb", border: "#fcd34d" },
];

const inputStyle = {
  background: "#f8faff",
  border: "2px solid #e0e7ff",
  borderRadius: 12,
  padding: "10px 16px",
  color: "#1e293b",
  fontSize: 14,
  width: "100%",
  outline: "none",
  transition: "border-color 0.2s, box-shadow 0.2s",
};

export default function KaveeshaContentManager({ selectedSubtopic, onBack }) {
  const [subtopics, setSubtopics] = useState([]);
  const [topics, setTopics] = useState([]);
  const [activeSubtopic, setActiveSubtopic] = useState(selectedSubtopic || null);
  const [activeTab, setActiveTab] = useState("video");
  const [subtopic, setSubtopic] = useState(null);
  const [loading, setLoading] = useState(false);
  const [miniQuizFilled, setMiniQuizFilled] = useState(false);

  const refreshMiniQuizFilled = useCallback(async () => {
    const id = activeSubtopic?._id;
    const ag = activeSubtopic?.ageGroup === "11-15" ? "11-15" : "6-10";
    if (!id) {
      setMiniQuizFilled(false);
      return;
    }
    try {
      const res = await axios.get(`${API}/api/kaveesha-miniquiz`, {
        params: { subtopicId: id, ageGroup: ag },
      });
      const filled = Array.isArray(res.data?.questions) && res.data.questions.length > 0;
      setMiniQuizFilled(filled);
    } catch {
      setMiniQuizFilled(false);
    }
  }, [activeSubtopic?._id, activeSubtopic?.ageGroup]);

  useEffect(() => {
    refreshMiniQuizFilled();
  }, [refreshMiniQuizFilled]);

  useEffect(() => {
    axios.get(`${API}/api/topics`).then((r) => setTopics(r.data || []));
  }, []);

  useEffect(() => {
    if (activeSubtopic) fetchSubtopicDetail();
  }, [activeSubtopic]);

  const fetchSubtopicDetail = async () => {
    if (!activeSubtopic) return;
    setLoading(true);
    try {
      const res = await axios.get(`${API}/api/subtopics/${activeSubtopic._id}`);
      setSubtopic(res.data);
    } catch {
      setSubtopic(activeSubtopic);
    } finally {
      setLoading(false);
    }
  };

  const loadSubtopicsForTopic = async (topicId, ageGroup = "6-10") => {
    const res = await axios.get(`${API}/api/subtopics`, { params: { topicId, ageGroup } });
    return Array.isArray(res.data) ? res.data : res.data?.subtopics || [];
  };

  const contentFilled = (tab) => {
    if (tab === "quiz") return miniQuizFilled;
    if (!subtopic) return false;
    if (tab === "video") return !!subtopic.videoUrl;
    if (tab === "text") return !!subtopic.content;
    if (tab === "images") return subtopic.images?.length > 0;
    return false;
  };

  return (
    <div className="space-y-6" style={{ minHeight: "100vh", paddingBottom: "40px" }}>
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">🎯 Content Manager</h2>
          <p className="text-slate-500 text-sm mt-1">
            {activeSubtopic ? (
              <>
                Editing: <span className="font-bold" style={{ color: "#6366f1" }}>{activeSubtopic.title}</span>
                {activeSubtopic.ageGroup && (
                  <span className="text-slate-400 font-semibold"> · Age {activeSubtopic.ageGroup}</span>
                )}
              </>
            ) : (
              "Select a subtopic to manage its content"
            )}
          </p>
        </div>
        {onBack && (
          <button
            onClick={onBack}
            className="px-5 py-2.5 rounded-xl text-sm font-bold transition-all hover:-translate-y-0.5 shadow-md hover:shadow-lg"
            style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)", border: "2px solid #4338ca", color: "#ffffff" }}
          >
            ← Back to Subtopics
          </button>
        )}
      </div>

      {/* Subtopic Selector */}
      {!selectedSubtopic && (
        <SubtopicPicker
          topics={topics}
          onSelect={(sub) => setActiveSubtopic(sub)}
          onContextChange={() => setActiveSubtopic(null)}
          loadSubtopicsForTopic={loadSubtopicsForTopic}
        />
      )}

      {/* Content Tabs */}
      {activeSubtopic && (
        <>
          {/* Tab Bar */}
          <div
            className="flex gap-2 p-2 rounded-2xl"
            style={{ background: "linear-gradient(135deg, #f8faff, #f0f4ff)", border: "2px solid #e0e7ff" }}
          >
            {TABS.map((tab) => {
              const filled = contentFilled(tab.id);
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all relative"
                  style={
                    isActive
                      ? {
                          background: `linear-gradient(135deg, ${tab.color}22, ${tab.color}44)`,
                          border: `2px solid ${tab.border}`,
                          color: tab.color,
                          boxShadow: `0 4px 12px ${tab.color}22`,
                        }
                      : {
                          background: "transparent",
                          border: "2px solid transparent",
                          color: "#94a3b8",
                        }
                  }
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = tab.light;
                      e.currentTarget.style.color = tab.color;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = "transparent";
                      e.currentTarget.style.color = "#94a3b8";
                    }
                  }}
                >
                  <span className="text-base">{tab.icon}</span>
                  <span>{tab.label}</span>
                  {filled && (
                    <span
                      className="w-2 h-2 rounded-full absolute top-2 right-2"
                      style={{ background: "#22c55e", boxShadow: "0 0 6px #22c55e88" }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Tab Content Panel */}
          <div
            className="rounded-2xl p-6"
            style={{ background: "#fff", border: "2px solid #e0e7ff", boxShadow: "0 4px 20px rgba(99,102,241,0.07)" }}
          >
            {loading ? (
              <div className="text-center py-16 text-slate-400">
                <div className="text-4xl mb-3 animate-spin">⏳</div>
                <p className="font-medium">Loading content...</p>
              </div>
            ) : (
              <>
                {activeTab === "video" && <VideoPanel subtopic={subtopic} onRefresh={fetchSubtopicDetail} />}
                {activeTab === "text" && <TextPanel subtopic={subtopic} onRefresh={fetchSubtopicDetail} />}
                {activeTab === "images" && <ImagesPanel subtopic={subtopic} onRefresh={fetchSubtopicDetail} />}
                {activeTab === "quiz" && (
                  <QuizPanel
                    subtopic={subtopic ?? activeSubtopic}
                    onMiniQuizFilledChange={refreshMiniQuizFilled}
                  />
                )}
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}

/* ── Subtopic Picker ── */
function SubtopicPicker({ topics, loadSubtopicsForTopic, onSelect, onContextChange }) {
  const [selTopic, setSelTopic] = useState(null);
  const [ageGroup, setAgeGroup] = useState("6-10");
  const [subs, setSubs] = useState([]);

  const clearParentSelection = () => {
    onContextChange?.();
  };

  const loadSubtopics = async (topic, ag) => {
    const data = await loadSubtopicsForTopic(topic._id, ag);
    setSubs(data);
  };

  const selectTopic = async (topic) => {
    clearParentSelection();
    setSelTopic(topic);
    await loadSubtopics(topic, ageGroup);
  };

  const changeAgeGroup = async (ag) => {
    setAgeGroup(ag);
    clearParentSelection();
    if (selTopic) {
      await loadSubtopics(selTopic, ag);
    } else {
      setSubs([]);
    }
  };

  return (
    <div
      className="rounded-2xl p-5 space-y-4"
      style={{ background: "linear-gradient(135deg, #f8faff, #f0f4ff)", border: "2px solid #e0e7ff" }}
    >
      <div>
        <label className="text-xs font-bold uppercase tracking-widest block mb-3" style={{ color: "#f59e0b" }}>
          1 · Age group
        </label>
        <div className="flex gap-2 flex-wrap">
          {["6-10", "11-15"].map((ag) => (
            <button
              key={ag}
              type="button"
              onClick={() => changeAgeGroup(ag)}
              className="px-4 py-1.5 rounded-lg text-sm font-bold transition-all"
              style={
                ageGroup === ag
                  ? { background: "linear-gradient(135deg, #f59e0b, #ef4444)", color: "#fff", boxShadow: "0 4px 12px rgba(245,158,11,0.3)" }
                  : { background: "#fff", border: "2px solid #fde68a", color: "#92400e" }
              }
            >
              {ag === "6-10" ? "🧒" : "👦"} Age {ag}
            </button>
          ))}
        </div>
        <p className="text-xs text-slate-500 mt-2 font-medium">Changing age reloads subtopics for this age and clears the open lesson until you pick one again.</p>
      </div>

      <div>
        <label className="text-xs font-bold uppercase tracking-widest block mb-3" style={{ color: "#6366f1" }}>2 · Topic</label>
        <div className="flex flex-wrap gap-2">
          {topics.map((t) => (
            <button
              key={t._id}
              type="button"
              onClick={() => selectTopic(t)}
              className="px-3 py-1.5 rounded-lg text-sm font-semibold transition-all"
              style={
                selTopic?._id === t._id
                  ? { background: "linear-gradient(135deg, #6366f1, #8b5cf6)", color: "#fff", boxShadow: "0 4px 12px rgba(99,102,241,0.35)" }
                  : { background: "#fff", border: "2px solid #e0e7ff", color: "#475569" }
              }
            >
              {t.title}
            </button>
          ))}
        </div>
      </div>

      {selTopic && (
        <div>
          <label className="text-xs font-bold uppercase tracking-widest block mb-3" style={{ color: "#6366f1" }}>
            3 · Subtopics (Age {ageGroup})
          </label>
          {subs.length === 0 ? (
            <p className="text-sm text-slate-500 font-medium py-2">No subtopics for this topic and age group.</p>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {subs.map((sub) => (
                <button
                  key={sub._id}
                  type="button"
                  onClick={() => onSelect(sub)}
                  className="text-left px-4 py-3.5 rounded-xl transition-all hover:-translate-y-0.5"
                  style={{
                    background: "#fff",
                    border: "2px solid #e0e7ff",
                    boxShadow: "0 2px 8px rgba(99,102,241,0.06)",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#a5b4fc"; e.currentTarget.style.boxShadow = "0 6px 16px rgba(99,102,241,0.12)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#e0e7ff"; e.currentTarget.style.boxShadow = "0 2px 8px rgba(99,102,241,0.06)"; }}
                >
                  <p className="text-sm font-bold text-slate-800">{sub.title}</p>
                  <p className="text-xs text-slate-400 mt-0.5 font-medium">Age {sub.ageGroup} · #{sub.order}</p>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Alert Helper ── */
function Alert({ msg }) {
  if (!msg) return null;
  const isError = msg.startsWith("❌");
  return (
    <div
      className="px-4 py-3 rounded-xl text-sm font-semibold"
      style={
        isError
          ? { background: "#fff0f0", border: "2px solid #fca5a5", color: "#991b1b" }
          : { background: "#f0fdf4", border: "2px solid #86efac", color: "#166534" }
      }
    >
      {msg}
    </div>
  );
}

/* ── Action Buttons ── */
function SaveBtn({ onClick, label = "Save", loading = false }) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="px-6 py-2.5 text-white rounded-xl font-bold text-sm transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-60"
      style={{ background: "linear-gradient(135deg, #06b6d4, #6366f1)" }}
    >
      {loading ? "Saving..." : `💾 ${label}`}
    </button>
  );
}

function DangerBtn({ onClick, label }) {
  return (
    <button
      onClick={onClick}
      className="px-6 py-2.5 rounded-xl font-semibold text-sm transition-all hover:-translate-y-0.5"
      style={{ background: "#fff0f0", border: "2px solid #fca5a5", color: "#991b1b" }}
    >
      🗑️ {label}
    </button>
  );
}

/* ── Section Label ── */
function Label({ children, color = "#6366f1" }) {
  return (
    <label className="text-xs font-bold uppercase tracking-widest block mb-2" style={{ color }}>
      {children}
    </label>
  );
}

/* ── Video Panel ── */
function VideoPanel({ subtopic, onRefresh }) {
  const [url, setUrl] = useState(subtopic?.videoUrl || "");
  const [videoFile, setVideoFile] = useState(null);
  const [videoType, setVideoType] = useState(subtopic?.videoType || "youtube"); // 'youtube' or 'upload'
  const [youtubeSearch, setYoutubeSearch] = useState("");
  const [youtubeResults, setYoutubeResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState("");
  
  // Ensure API key is loaded
  const YOUTUBE_API_KEY = API_KEYS?.YOUTUBE || "";
  
  // Debug: Log API key on component mount
  useEffect(() => {
    console.log("🔑 YouTube API Key loaded:", YOUTUBE_API_KEY ? "✅ Yes (" + YOUTUBE_API_KEY.substring(0, 10) + "...)" : "❌ No");
  }, [YOUTUBE_API_KEY]);

  const searchYouTube = async () => {
    if (!youtubeSearch.trim()) {
      setMsg("❌ Please enter a search term");
      return;
    }
    
    // Validate API key before making request
    if (!YOUTUBE_API_KEY || YOUTUBE_API_KEY.trim() === "") {
      setMsg("❌ YouTube API key is missing. Please check your configuration.");
      console.error("❌ YouTube API Key is not configured!");
      return;
    }
    
    setSearching(true);
    setMsg("");
    
    try {
      console.log("🔍 Searching YouTube for:", youtubeSearch);
      console.log("🔑 Using API Key:", YOUTUBE_API_KEY.substring(0, 15) + "...");
      
      const res = await axios.get("https://www.googleapis.com/youtube/v3/search", {
        params: { 
          part: "snippet", 
          q: youtubeSearch, 
          type: "video", 
          maxResults: 6, 
          key: YOUTUBE_API_KEY 
        },
      });
      
      console.log("✅ YouTube response:", res.data);
      const items = res.data.items || [];
      
      if (items.length === 0) {
        setMsg("⚠️ No videos found. Try a different search term.");
      } else {
        setYoutubeResults(items);
        setMsg(`✅ Found ${items.length} videos!`);
      }
    } catch (err) {
      console.error("❌ YouTube API Error:", err);
      const errorMsg = err.response?.data?.error?.message || err.message || "Unknown error";
      setMsg(`❌ YouTube API Error: ${errorMsg}`);
    } finally {
      setSearching(false);
    }
  };

  const saveVideo = async () => {
    if (!subtopic?._id) return;
    
    try {
      const token = localStorage.getItem("aquachamp_token") || sessionStorage.getItem("aquachamp_token");
      
      if (videoType === "upload" && videoFile) {
        // Upload video file
        setUploading(true);
        const formData = new FormData();
        formData.append("video", videoFile);
        formData.append("videoType", "upload");
        
        await axios.put(`${API}/api/subtopics/video/${subtopic._id}`, formData, {
          headers: { 
            Authorization: `Bearer ${token}`, 
            "Content-Type": "multipart/form-data" 
          }, 
          withCredentials: true,
        });
        setUploading(false);
        setMsg("✅ Video uploaded successfully!");
      } else if (videoType === "youtube" && url.trim()) {
        // Save YouTube URL
        await axios.put(`${API}/api/subtopics/video/${subtopic._id}`, { 
          videoUrl: url,
          videoType: "youtube"
        }, {
          headers: { Authorization: `Bearer ${token}` }, 
          withCredentials: true,
        });
        setMsg("✅ YouTube video saved!");
      } else {
        return setMsg("❌ Please select a video or enter a YouTube URL");
      }
      
      onRefresh?.();
      setTimeout(() => setMsg(""), 3000);
    } catch (err) {
      setUploading(false);
      setMsg("❌ Failed to save video: " + (err.response?.data?.message || "Unknown error"));
    }
  };

  const deleteVideo = async () => {
    if (!window.confirm("Remove this video?")) return;
    try {
      const token = localStorage.getItem("aquachamp_token") || sessionStorage.getItem("aquachamp_token");
      await axios.delete(`${API}/api/subtopics/video/${subtopic._id}`, {
        headers: { Authorization: `Bearer ${token}` }, withCredentials: true,
      });
      setUrl("");
      setVideoFile(null);
      setMsg("✅ Video removed");
      onRefresh?.();
      setTimeout(() => setMsg(""), 3000);
    } catch {
      setMsg("❌ Failed to delete");
    }
  };

  const getYouTubeId = (u) => {
    const match = u?.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    return match ? match[1] : null;
  };

  const videoId = getYouTubeId(url);

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2 pb-3" style={{ borderBottom: "2px solid #fee2e2" }}>
        <span className="text-2xl">🎬</span>
        <h3 className="text-lg font-bold text-slate-800">Video Content</h3>
      </div>

      {/* Video Type Selector */}
      <div
        className="rounded-xl p-4 space-y-3"
        style={{ background: "linear-gradient(135deg, #fff0f0, #fef2f2)", border: "2px solid #fca5a5" }}
      >
        <Label color="#ef4444">📹 Video Source</Label>
        <div className="flex gap-3">
          <button
            onClick={() => setVideoType("youtube")}
            className="flex-1 px-4 py-3 rounded-xl text-sm font-bold transition-all"
            style={
              videoType === "youtube"
                ? { background: "linear-gradient(135deg, #ef4444, #dc2626)", color: "#fff", boxShadow: "0 4px 12px rgba(239,68,68,0.35)" }
                : { background: "#fff", border: "2px solid #fca5a5", color: "#991b1b" }
            }
          >
            🔍 Search YouTube
          </button>
          <button
            onClick={() => setVideoType("upload")}
            className="flex-1 px-4 py-3 rounded-xl text-sm font-bold transition-all"
            style={
              videoType === "upload"
                ? { background: "linear-gradient(135deg, #ef4444, #dc2626)", color: "#fff", boxShadow: "0 4px 12px rgba(239,68,68,0.35)" }
                : { background: "#fff", border: "2px solid #fca5a5", color: "#991b1b" }
            }
          >
            📁 Upload Video
          </button>
        </div>
      </div>

      {/* YouTube Search Section */}
      {videoType === "youtube" && (
        <div className="space-y-4">
          {/* YouTube Search */}
          <div
            className="rounded-xl p-4 space-y-3"
            style={{ background: "#fff0f0", border: "2px solid #fca5a5" }}
          >
            <Label color="#ef4444">🔍 Search YouTube Videos</Label>
            <div className="flex gap-2">
              <input
                value={youtubeSearch}
                onChange={(e) => setYoutubeSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && searchYouTube()}
                placeholder="Search swimming tutorials..."
                style={{ ...inputStyle, background: "#fff", border: "2px solid #fca5a5" }}
              />
              <button
                onClick={searchYouTube}
                disabled={searching}
                className="px-4 py-2.5 text-white rounded-xl text-sm font-bold transition-all disabled:opacity-50 hover:-translate-y-0.5 shrink-0"
                style={{ background: "linear-gradient(135deg, #ef4444, #dc2626)", boxShadow: "0 4px 12px rgba(239,68,68,0.35)" }}
              >
                {searching ? "..." : "Search"}
              </button>
            </div>
          </div>

          {/* YouTube Results */}
          {youtubeResults.length > 0 && (
            <div className="grid grid-cols-3 gap-3">
              {youtubeResults.map((item) => (
                <button
                  key={item.id.videoId}
                  onClick={() => setUrl(`https://www.youtube.com/watch?v=${item.id.videoId}`)}
                  className="text-left rounded-xl overflow-hidden transition-all hover:-translate-y-1"
                  style={{ border: "2px solid #e0e7ff", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#fca5a5"; e.currentTarget.style.boxShadow = "0 8px 20px rgba(0,0,0,0.1)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#e0e7ff"; e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.06)"; }}
                >
                  <img src={item.snippet.thumbnails.medium.url} alt={item.snippet.title} className="w-full h-28 object-cover" />
                  <div className="p-2 bg-white">
                    <p className="text-xs text-slate-600 line-clamp-2 font-medium">{item.snippet.title}</p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* URL Input */}
          <div>
            <Label color="#ef4444">YouTube URL</Label>
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              style={inputStyle}
              onFocus={(e) => { e.target.style.borderColor = "#ef4444"; }}
              onBlur={(e) => { e.target.style.borderColor = "#e0e7ff"; }}
            />
          </div>
        </div>
      )}

      {/* Upload Video Section */}
      {videoType === "upload" && (
        <div>
          <Label color="#ef4444">📁 Upload Video File</Label>
          <label
            className="flex flex-col items-center justify-center rounded-xl p-10 text-center cursor-pointer transition-all"
            style={{ border: "2px dashed #fca5a5", background: "#fff0f0" }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#ef4444"; e.currentTarget.style.background = "#fee2e2"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#fca5a5"; e.currentTarget.style.background = "#fff0f0"; }}
          >
            <input 
              type="file" 
              accept="video/*" 
              className="hidden" 
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  setVideoFile(file);
                  setUrl(""); // Clear YouTube URL
                }
              }} 
            />
            <div className="text-5xl mb-3">🎥</div>
            <p className="text-base font-bold text-red-700">
              {videoFile ? `✅ ${videoFile.name}` : "Click to upload video"}
            </p>
            <p className="text-sm text-red-500 mt-2">MP4, WebM, AVI supported (Max 100MB)</p>
          </label>
          {videoFile && (
            <div className="mt-3 flex items-center gap-2 px-4 py-3 rounded-xl" style={{ background: "#dcfce7", border: "2px solid #86efac" }}>
              <span className="text-lg">✅</span>
              <div>
                <p className="text-sm font-bold text-green-800">{videoFile.name}</p>
                <p className="text-xs text-green-600">{(videoFile.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Video Preview - Large Size */}
      {(videoId || (subtopic?.videoType === "upload" && subtopic?.videoUrl)) && (
        <div>
          <Label color="#ef4444">📺 Video Preview</Label>
          <div className="rounded-xl overflow-hidden" style={{ border: "3px solid #fca5a5", boxShadow: "0 8px 24px rgba(239,68,68,0.15)" }}>
            {videoId ? (
              <iframe 
                src={`https://www.youtube.com/embed/${videoId}`} 
                className="w-full" 
                style={{ height: "450px" }}
                allowFullScreen 
                title="YouTube preview" 
              />
            ) : (
              <video 
                controls 
                className="w-full" 
                style={{ height: "450px", background: "#000" }}
                src={subtopic.videoUrl.startsWith("/") ? `${API}${subtopic.videoUrl}` : subtopic.videoUrl}
              >
                Your browser does not support the video tag.
              </video>
            )}
          </div>
        </div>
      )}

      <Alert msg={msg} />
      <div className="flex gap-3">
        <SaveBtn onClick={saveVideo} label={uploading ? "Uploading..." : "Save Video"} loading={uploading} />
        {subtopic?.videoUrl && <DangerBtn onClick={deleteVideo} label="Remove Video" />}
      </div>
    </div>
  );
}

/* ── Text Panel ── */
function TextPanel({ subtopic, onRefresh }) {
  const [content, setContent] = useState(subtopic?.content || "");
  const [contentFiles, setContentFiles] = useState(subtopic?.contentFiles || []);
  const [contentType, setContentType] = useState(subtopic?.contentType || "text"); // 'text', 'pdf', 'presentation'
  const [msg, setMsg] = useState("");
  const [aiPrompt, setAiPrompt] = useState("");
  const [generating, setGenerating] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState(false);

  const generateWithAI = async () => {
    if (!aiPrompt.trim()) return setMsg("❌ Please enter a topic for AI generation");
    if (!subtopic?.title) return setMsg("❌ Subtopic title not found");
    
    setGenerating(true);
    setMsg("");
    
    try {
      console.log("🤖 Generating AI content for:", subtopic.title);
      console.log("📝 Prompt:", aiPrompt);
      
      const generatedText = await geminiAPI.generateContent(subtopic.title, aiPrompt);
      
      if (generatedText) {
        setContent(generatedText);
        setContentType("text");
        setMsg("✅ AI content generated successfully!");
        console.log("✅ Content generated:", generatedText.substring(0, 100) + "...");
      } else {
        setMsg("❌ Failed to generate content. Please try again.");
      }
    } catch (err) {
      console.error("❌ AI Generation Error:", err);
      const errorMsg = err.response?.data?.error?.message || err.message || "Unknown error";
      setMsg(`❌ AI Error: ${errorMsg}`);
    } finally {
      setGenerating(false);
    }
  };

  const saveText = async () => {
    if (!subtopic?._id) return;
    try {
      const token = localStorage.getItem("aquachamp_token") || sessionStorage.getItem("aquachamp_token");
      await axios.put(`${API}/api/subtopics/text/${subtopic._id}`, { 
        content,
        contentType,
        contentFiles 
      }, {
        headers: { Authorization: `Bearer ${token}` }, withCredentials: true,
      });
      setMsg("✅ Content saved successfully!");
      onRefresh?.();
      setTimeout(() => setMsg(""), 3000);
    } catch (err) {
      setMsg("❌ Failed to save content: " + (err.response?.data?.message || "Unknown error"));
    }
  };

  const deleteText = async () => {
    if (!window.confirm("Remove all content?")) return;
    try {
      const token = localStorage.getItem("aquachamp_token") || sessionStorage.getItem("aquachamp_token");
      await axios.delete(`${API}/api/subtopics/text/${subtopic._id}`, {
        headers: { Authorization: `Bearer ${token}` }, withCredentials: true,
      });
      setContent("");
      setContentFiles([]);
      setContentType("text");
      setMsg("✅ Content removed");
      onRefresh?.();
      setTimeout(() => setMsg(""), 3000);
    } catch (err) {
      setMsg("❌ Failed to delete: " + (err.response?.data?.message || "Unknown error"));
    }
  };

  const deleteContentFile = async (fileId, fileName) => {
    if (!window.confirm(`Delete "${fileName}"?`)) return;
    try {
      const token = localStorage.getItem("aquachamp_token") || sessionStorage.getItem("aquachamp_token");
      const res = await axios.delete(`${API}/api/subtopics/content-file/${subtopic._id}`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
        data: { fileId }
      });
      
      // Update the contentFiles state immediately with remaining files
      const remainingFiles = res.data.contentFiles || [];
      setContentFiles(remainingFiles);
      
      // If files still exist, stay in files mode
      if (remainingFiles.length > 0) {
        setContentType("files");
      }
      
      setMsg("✅ File deleted successfully!");
      
      // Also refresh from server to ensure sync
      if (onRefresh) {
        onRefresh();
      }
      
      setTimeout(() => setMsg(""), 3000);
    } catch (err) {
      setMsg("❌ Failed to delete file: " + (err.response?.data?.message || "Unknown error"));
      setTimeout(() => setMsg(""), 5000);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2 pb-3" style={{ borderBottom: "2px solid #e0e7ff" }}>
        <span className="text-2xl">📝</span>
        <h3 className="text-lg font-bold text-slate-800">Text Content</h3>
      </div>

      {/* Content Type Selector */}
      <div
        className="rounded-xl p-4 space-y-3"
        style={{ background: "linear-gradient(135deg, #faf5ff, #eff6ff)", border: "2px solid #c4b5fd" }}
      >
        <Label color="#7c3aed">📚 Content Type</Label>
        <div className="flex gap-3">
          <button
            onClick={() => setContentType("text")}
            className="flex-1 px-4 py-3 rounded-xl text-sm font-bold transition-all"
            style={
              contentType === "text"
                ? { background: "linear-gradient(135deg, #7c3aed, #6366f1)", color: "#fff", boxShadow: "0 4px 12px rgba(139,92,246,0.35)" }
                : { background: "#fff", border: "2px solid #c4b5fd", color: "#6b21a8" }
            }
          >
            ✍️ Write Text
          </button>
          <button
            onClick={() => setContentType("files")}
            className="flex-1 px-4 py-3 rounded-xl text-sm font-bold transition-all"
            style={
              contentType === "files"
                ? { background: "linear-gradient(135deg, #7c3aed, #6366f1)", color: "#fff", boxShadow: "0 4px 12px rgba(139,92,246,0.35)" }
                : { background: "#fff", border: "2px solid #c4b5fd", color: "#6b21a8" }
            }
          >
            📁 Upload Files
          </button>
        </div>
      </div>

      {/* AI Content Generator */}
      {contentType === "text" && (
        <div className="rounded-xl p-4 space-y-3" style={{ background: "linear-gradient(135deg, #faf5ff, #eff6ff)", border: "2px solid #c4b5fd" }}>
          <Label color="#7c3aed">🤖 AI Content Generator</Label>
          <div className="flex gap-2">
            <input
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="e.g. arm movements for backstroke, breathing techniques..."
              style={{ ...inputStyle, background: "#fff", border: "2px solid #c4b5fd" }}
            />
            <button
              onClick={generateWithAI}
              disabled={generating}
              className="px-4 py-2.5 text-white rounded-xl text-sm font-bold transition-all disabled:opacity-50 hover:-translate-y-0.5 shrink-0"
              style={{ background: "linear-gradient(135deg, #7c3aed, #6366f1)", boxShadow: "0 4px 12px rgba(139,92,246,0.35)" }}
            >
              {generating ? "Generating..." : "✨ Generate"}
            </button>
          </div>
        </div>
      )}

      {/* Text Content Editor */}
      {contentType === "text" && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <Label color="#6366f1">Lesson Content</Label>
            <span className="text-xs text-slate-400 font-semibold">{content.length} characters</span>
          </div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={12}
            placeholder="Write lesson content here... You can also use AI generator above to create content automatically."
            style={{ ...inputStyle, resize: "none", fontFamily: "monospace", lineHeight: 1.7 }}
            onFocus={(e) => { e.target.style.borderColor = "#6366f1"; e.target.style.boxShadow = "0 0 0 3px rgba(99,102,241,0.1)"; }}
            onBlur={(e) => { e.target.style.borderColor = "#e0e7ff"; e.target.style.boxShadow = "none"; }}
          />
        </div>
      )}

      {/* Files Upload Section (PDF, PPT, PPTX) */}
      {contentType === "files" && (
        <div className="space-y-4">
          <div>
            <Label color="#6366f1">📁 Upload Documents (PDF, PPT, PPTX)</Label>
            <label
              className="flex flex-col items-center justify-center rounded-xl p-10 text-center cursor-pointer transition-all"
              style={{ border: "2px dashed #c4b5fd", background: "#faf5ff" }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#7c3aed"; e.currentTarget.style.background = "#ede9fe"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#c4b5fd"; e.currentTarget.style.background = "#faf5ff"; }}
            >
              <input 
                type="file" 
                accept=".pdf,.ppt,.pptx" 
                className="hidden" 
                onChange={async (e) => {
                  const file = e.target.files[0];
                  if (file) {
                    setUploadingFiles(true);
                    try {
                      const token = localStorage.getItem("aquachamp_token") || sessionStorage.getItem("aquachamp_token");
                      const formData = new FormData();
                      formData.append("contentFile", file);
                      
                      // Determine file type
                      const fileType = file.name.endsWith('.pdf') ? 'pdf' : 'presentation';
                      formData.append("fileType", fileType);
                      
                      const res = await axios.put(`${API}/api/subtopics/content-file/${subtopic._id}`, formData, {
                        headers: { 
                          Authorization: `Bearer ${token}`, 
                          "Content-Type": "multipart/form-data" 
                        },
                        withCredentials: true,
                      });
                      
                      setContentFiles(res.data.contentFiles || []);
                      setMsg("✅ File uploaded successfully!");
                      setTimeout(() => setMsg(""), 3000);
                    } catch (err) {
                      setMsg("❌ Failed to upload: " + (err.response?.data?.message || "Unknown error"));
                    } finally {
                      setUploadingFiles(false);
                    }
                  }
                }} 
              />
              <div className="text-5xl mb-3">📁</div>
              <p className="text-base font-bold text-purple-700">
                {contentFiles.length > 0 ? `📎 ${contentFiles.length} file(s) uploaded` : "Click to upload files"}
              </p>
              <p className="text-sm text-purple-500 mt-2">PDF, PPT, PPTX supported (Max 20MB each)</p>
            </label>
          </div>

          {/* Uploaded Files List */}
          {contentFiles.length > 0 && (
            <div>
              <h4 className="text-sm font-bold text-slate-700 mb-3">📚 Uploaded Files</h4>
              <div className="space-y-2">
                {contentFiles.map((file, i) => (
                  <div key={file._id || i} className="flex items-center justify-between px-4 py-3 rounded-xl" style={{ background: "#f3e8ff", border: "2px solid #c4b5fd" }}>
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <span className="text-2xl">{file.type === 'pdf' ? '📄' : '📊'}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-purple-800 truncate">{file.name}</p>
                        <p className="text-xs text-purple-600">
                          {file.type === 'pdf' ? 'PDF Document' : 'Presentation'} · {(file.size / 1024).toFixed(2)} KB
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-3">
                      <a 
                        href={file.url.startsWith("/") ? `${API}${file.url}` : file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-lg text-xs font-bold" style={{ background: "#7c3aed", color: "#fff" }}
                      >
                        👁️ View
                      </a>
                      <label className="px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all hover:scale-105" style={{ background: "#dbeafe", border: "1.5px solid #93c5fd", color: "#1e40af" }}>
                        🔄 Update
                        <input 
                          type="file" 
                          accept=".pdf,.ppt,.pptx" 
                          className="hidden" 
                          onChange={async (e) => {
                            const newFile = e.target.files[0];
                            if (newFile) {
                              setUploadingFiles(true);
                              try {
                                const token = localStorage.getItem("aquachamp_token") || sessionStorage.getItem("aquachamp_token");
                                
                                // Delete old file first
                                await axios.delete(`${API}/api/subtopics/content-file/${subtopic._id}`, {
                                  headers: { Authorization: `Bearer ${token}` },
                                  withCredentials: true,
                                  data: { fileId: file._id }
                                });
                                
                                // Upload new file
                                const formData = new FormData();
                                formData.append("contentFile", newFile);
                                const fileType = newFile.name.endsWith('.pdf') ? 'pdf' : 'presentation';
                                formData.append("fileType", fileType);
                                
                                const res = await axios.put(`${API}/api/subtopics/content-file/${subtopic._id}`, formData, {
                                  headers: { 
                                    Authorization: `Bearer ${token}`, 
                                    "Content-Type": "multipart/form-data" 
                                  },
                                  withCredentials: true,
                                });
                                
                                setContentFiles(res.data.contentFiles || []);
                                setMsg("✅ File updated successfully!");
                                setTimeout(() => setMsg(""), 3000);
                              } catch (err) {
                                setMsg("❌ Failed to update: " + (err.response?.data?.message || "Unknown error"));
                              } finally {
                                setUploadingFiles(false);
                              }
                            }
                          }} 
                        />
                      </label>
                      <button
                        onClick={() => deleteContentFile(file._id, file.name)}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all hover:scale-105"
                        style={{ background: "#fee2e2", border: "1.5px solid #fca5a5", color: "#991b1b" }}
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <Alert msg={msg} />
      <div className="flex gap-3">
        <SaveBtn onClick={saveText} label="Save Content" />
      </div>
    </div>
  );
}

/* ── Images Panel ── */
function ImagesPanel({ subtopic, onRefresh }) {
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [msg, setMsg] = useState("");
  const [uploadingFile, setUploadingFile] = useState(false);
  const [addingUrl, setAddingUrl] = useState(false);
  const [updatingPath, setUpdatingPath] = useState(null);

  const deleteImages = async () => {
    if (!window.confirm("Remove all images?")) return;
    try {
      const token = localStorage.getItem("aquachamp_token") || sessionStorage.getItem("aquachamp_token");
      await axios.delete(`${API}/api/subtopics/images/${subtopic._id}`, {
        headers: { Authorization: `Bearer ${token}` }, withCredentials: true,
      });
      setMsg("✅ Images removed");
      onRefresh?.();
      setTimeout(() => setMsg(""), 3000);
    } catch {
      setMsg("❌ Failed to delete");
    }
  };

  const deleteSingleImage = async (imagePath, index) => {
    if (!window.confirm(`Delete image #${index + 1}?`)) return;
    try {
      const token = localStorage.getItem("aquachamp_token") || sessionStorage.getItem("aquachamp_token");
      await axios.delete(`${API}/api/subtopics/image/${subtopic._id}`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
        data: { imagePath }
      });
      
      setMsg("✅ Image deleted successfully!");
      onRefresh?.();
      setTimeout(() => setMsg(""), 3000);
    } catch (err) {
      setMsg("❌ Failed to delete image: " + (err.response?.data?.message || "Unknown error"));
    }
  };

  const appendOneFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !subtopic?._id) return;
    setUploadingFile(true);
    setMsg("");
    try {
      const token = localStorage.getItem("aquachamp_token") || sessionStorage.getItem("aquachamp_token");
      const formData = new FormData();
      formData.append("image", file);
      await axios.put(`${API}/api/subtopics/images/${subtopic._id}/append`, formData, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });
      setMsg("✅ Image uploaded!");
      onRefresh?.();
      setTimeout(() => setMsg(""), 3000);
    } catch (err) {
      setMsg("❌ " + (err.response?.data?.message || "Upload failed"));
    } finally {
      setUploadingFile(false);
    }
  };

  const addImageUrl = async () => {
    const url = imageUrlInput.trim();
    if (!url || !subtopic?._id) {
      setMsg("❌ Enter a valid image URL");
      return;
    }
    setAddingUrl(true);
    setMsg("");
    try {
      const token = localStorage.getItem("aquachamp_token") || sessionStorage.getItem("aquachamp_token");
      await axios.put(
        `${API}/api/subtopics/images/${subtopic._id}/url`,
        { imageUrl: url },
        { headers: { Authorization: `Bearer ${token}` }, withCredentials: true }
      );
      setImageUrlInput("");
      setMsg("✅ Image URL added!");
      onRefresh?.();
      setTimeout(() => setMsg(""), 3000);
    } catch (err) {
      setMsg("❌ " + (err.response?.data?.message || "Failed to add URL"));
    } finally {
      setAddingUrl(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2 pb-3" style={{ borderBottom: "2px solid #dcfce7" }}>
        <span className="text-2xl">🖼️</span>
        <h3 className="text-lg font-bold text-slate-800">Images</h3>
      </div>

      {/* Existing images */}
      {subtopic?.images?.length > 0 && (
        <div>
          <Label color="#16a34a">Current Images ({subtopic.images.length})</Label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {subtopic.images.map((img, i) => (
              <div
                key={`${img}-${i}`}
                className="rounded-xl overflow-hidden flex flex-col"
                style={{ border: "2px solid #bbf7d0", background: "#f0fdf4" }}
              >
                <img
                  src={img.startsWith("/uploads") ? `${API}${img}` : img}
                  alt={`img-${i + 1}`}
                  className="h-28 w-full object-cover"
                />
                <div className="p-2 flex flex-col gap-2">
                  <span className="text-xs font-bold text-green-800 text-center">#{i + 1}</span>
                  <div className="flex gap-2 justify-center flex-wrap">
                    <label
                      className="px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all hover:scale-105"
                      style={{ background: "#dbeafe", border: "1.5px solid #93c5fd", color: "#1e40af" }}
                    >
                      {updatingPath === img ? "⏳" : "🔄 Update"}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={updatingPath === img}
                        onChange={async (ev) => {
                          const file = ev.target.files?.[0];
                          ev.target.value = "";
                          if (!file) return;
                          setUpdatingPath(img);
                          setMsg("");
                          try {
                            const token = localStorage.getItem("aquachamp_token") || sessionStorage.getItem("aquachamp_token");
                            const formData = new FormData();
                            formData.append("image", file);
                            formData.append("oldImagePath", img);
                            formData.append("imageIndex", String(i));
                            await axios.put(`${API}/api/subtopics/image/${subtopic._id}`, formData, {
                              headers: {
                                Authorization: `Bearer ${token}`,
                                "Content-Type": "multipart/form-data",
                              },
                              withCredentials: true,
                            });
                            setMsg("✅ Image updated successfully!");
                            onRefresh?.();
                            setTimeout(() => setMsg(""), 3000);
                          } catch (err) {
                            setMsg("❌ Failed to update image: " + (err.response?.data?.message || "Unknown error"));
                          } finally {
                            setUpdatingPath(null);
                          }
                        }}
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => deleteSingleImage(img, i)}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all hover:scale-105"
                      style={{ background: "#fee2e2", border: "1.5px solid #fca5a5", color: "#991b1b" }}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload one image at a time */}
      <div>
        <Label color="#16a34a">Upload from Device (one at a time)</Label>
        <label
          className="flex flex-col items-center justify-center rounded-xl p-8 text-center cursor-pointer transition-all"
          style={{ border: "2px dashed #86efac", background: "#f0fdf4", opacity: uploadingFile ? 0.7 : 1 }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#22c55e"; e.currentTarget.style.background = "#dcfce7"; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#86efac"; e.currentTarget.style.background = "#f0fdf4"; }}
        >
          <input type="file" accept="image/*" className="hidden" disabled={uploadingFile} onChange={appendOneFile} />
          <div className="text-4xl mb-2">📁</div>
          <p className="text-sm font-bold text-green-700">
            {uploadingFile ? "Uploading…" : "Click to add one image"}
          </p>
          <p className="text-xs text-green-500 mt-1">PNG, JPG, WEBP — add another after each upload</p>
        </label>
      </div>

      {/* Image URL — one at a time */}
      <div>
        <Label color="#16a34a">Add image by URL (one at a time)</Label>
        <div className="flex gap-2 flex-wrap">
          <input
            value={imageUrlInput}
            onChange={(e) => setImageUrlInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addImageUrl()}
            placeholder="https://example.com/image.jpg"
            style={{ ...inputStyle, flex: 1, minWidth: 200, border: "2px solid #86efac" }}
            onFocus={(e) => { e.target.style.borderColor = "#22c55e"; }}
            onBlur={(e) => { e.target.style.borderColor = "#86efac"; }}
          />
          <button
            type="button"
            onClick={addImageUrl}
            disabled={addingUrl}
            className="px-4 py-2.5 text-white rounded-xl text-sm font-bold transition-all disabled:opacity-50 shrink-0"
            style={{ background: "linear-gradient(135deg, #22c55e, #16a34a)", boxShadow: "0 4px 12px rgba(34,197,94,0.35)" }}
          >
            {addingUrl ? "Adding…" : "Add URL"}
          </button>
        </div>
      </div>

      <Alert msg={msg} />
      <div className="flex gap-3">
        {subtopic?.images?.length > 0 && <DangerBtn onClick={deleteImages} label="Remove All Images" />}
      </div>
    </div>
  );
}

/* ── Quiz Panel ── */
function makeEmptyQuestion() {
  return {
    clientId: `local-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    question: "",
    options: ["", ""],
    correctAnswer: "",
  };
}

function questionRowKey(q, qi) {
  return q._id ? String(q._id) : q.clientId || `idx-${qi}`;
}

function QuizPanel({ subtopic, onMiniQuizFilledChange }) {
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const ageGroup = subtopic?.ageGroup === "11-15" ? "11-15" : "6-10";

  useEffect(() => {
    if (!subtopic?._id) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${API}/api/kaveesha-miniquiz`, {
          params: { subtopicId: subtopic._id, ageGroup },
        });
        if (cancelled) return;
        setQuiz(res.data);
        setQuestions(
          (res.data.questions || []).map((q) => ({
            _id: q._id,
            question: q.question,
            options: [...(q.options || [])],
            correctAnswer: q.correctAnswer || "",
          }))
        );
      } catch (e) {
        if (cancelled) return;
        if (e.response?.status === 404) {
          setQuiz(null);
          setQuestions([]);
        } else {
          setQuiz(null);
          setQuestions([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [subtopic?._id, subtopic?.ageGroup]);

  const addQuestion = () => {
    setQuestions((prev) => [...prev, makeEmptyQuestion()]);
  };

  const removeQuestion = (i) => {
    if (!window.confirm(`Delete question ${i + 1}?`)) return;
    setQuestions((prev) => prev.filter((_, idx) => idx !== i));
  };

  const updateQuestionField = (i, field, value) => {
    setQuestions((prev) => {
      const next = [...prev];
      next[i] = { ...next[i], [field]: value };
      return next;
    });
  };

  const updateOption = (qi, oi, value) => {
    setQuestions((prev) => {
      const next = [...prev];
      const q = { ...next[qi] };
      const prevVal = q.options[oi];
      const newOptions = [...q.options];
      newOptions[oi] = value;
      let correct = q.correctAnswer;
      if (correct === prevVal) correct = value;
      const trimmedOpts = newOptions.map((o) => o.trim()).filter(Boolean);
      if (correct && !trimmedOpts.includes(correct.trim())) correct = "";
      q.options = newOptions;
      q.correctAnswer = correct;
      next[qi] = q;
      return next;
    });
  };

  const addOption = (qi) => {
    setQuestions((prev) =>
      prev.map((q, i) => (i === qi ? { ...q, options: [...q.options, ""] } : q))
    );
  };

  const removeOption = (qi, oi) => {
    let blocked = false;
    setQuestions((prev) => {
      const q = prev[qi];
      if (q.options.length <= 2) {
        blocked = true;
        return prev;
      }
      const removed = q.options[oi];
      const newOptions = q.options.filter((_, i) => i !== oi);
      let correct = q.correctAnswer;
      if (removed === correct) correct = "";
      return prev.map((qq, i) =>
        i === qi ? { ...qq, options: newOptions, correctAnswer: correct } : qq
      );
    });
    if (blocked) {
      setMsg("❌ Each question needs at least 2 options");
      setTimeout(() => setMsg(""), 3000);
    }
  };

  const setCorrectAnswer = (qi, optionText) => {
    updateQuestionField(qi, "correctAnswer", optionText);
  };

  const buildPayloadQuestions = () =>
    questions.map((q) => ({
      ...(q._id ? { _id: q._id } : {}),
      question: q.question,
      options: q.options,
      correctAnswer: q.correctAnswer,
    }));

  const saveQuiz = async () => {
    if (questions.length === 0) {
      return setMsg("❌ Add at least one question before saving");
    }
    try {
      const token = localStorage.getItem("aquachamp_token") || sessionStorage.getItem("aquachamp_token");
      const headers = { Authorization: `Bearer ${token}` };
      const payloadQuestions = buildPayloadQuestions();
      const payload = { subtopicId: subtopic._id, ageGroup, questions: payloadQuestions };
      if (quiz) {
        await axios.put(`${API}/api/kaveesha-miniquiz/${quiz._id}`, payload, { headers, withCredentials: true });
      } else {
        await axios.post(`${API}/api/kaveesha-miniquiz`, payload, { headers, withCredentials: true });
      }
      setMsg("✅ Quiz saved!");
      const res = await axios.get(`${API}/api/kaveesha-miniquiz`, {
        params: { subtopicId: subtopic._id, ageGroup },
      });
      setQuiz(res.data);
      setQuestions(
        (res.data.questions || []).map((q) => ({
          _id: q._id,
          question: q.question,
          options: [...(q.options || [])],
          correctAnswer: q.correctAnswer || "",
        }))
      );
      onMiniQuizFilledChange?.();
      setTimeout(() => setMsg(""), 3000);
    } catch (err) {
      setMsg("❌ " + (err.response?.data?.message || "Failed to save quiz"));
    }
  };

  const deleteQuiz = async () => {
    if (!quiz || !window.confirm("Delete this quiz?")) return;
    try {
      const token = localStorage.getItem("aquachamp_token") || sessionStorage.getItem("aquachamp_token");
      await axios.delete(`${API}/api/kaveesha-miniquiz/${quiz._id}`, {
        headers: { Authorization: `Bearer ${token}` }, withCredentials: true,
      });
      setQuiz(null);
      setQuestions([]);
      setMsg("✅ Quiz deleted");
      onMiniQuizFilledChange?.();
      setTimeout(() => setMsg(""), 3000);
    } catch {
      setMsg("❌ Failed to delete quiz");
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-2 pb-3" style={{ borderBottom: "2px solid #fde68a" }}>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-2xl">❓</span>
          <h3 className="text-lg font-bold text-slate-800">Mini Quiz</h3>
          <span
            className="px-2.5 py-0.5 rounded-full text-xs font-bold"
            style={{ background: "#e0e7ff", color: "#4338ca", border: "1px solid #a5b4fc" }}
          >
            Age {ageGroup}
          </span>
          <span
            className="px-2.5 py-0.5 rounded-full text-xs font-bold"
            style={{ background: "#fef3c7", color: "#92400e", border: "1px solid #fcd34d" }}
          >
            {questions.length} question{questions.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      <p className="text-xs text-slate-500 font-medium">
        Add any number of questions. Each question needs at least two options; use the radio to set the correct answer (used to mark student responses automatically).
      </p>

      {loading ? (
        <p className="text-slate-400 text-sm font-medium py-4 text-center">Loading quiz...</p>
      ) : (
        <div className="space-y-4">
          {questions.length === 0 && (
            <div
              className="rounded-xl p-6 text-center text-sm font-semibold text-amber-800"
              style={{ background: "#fffbeb", border: "2px dashed #fcd34d" }}
            >
              No questions yet for age {ageGroup}. Click &quot;Add question&quot; to start.
            </div>
          )}

          {questions.map((q, qi) => (
            <div
              key={questionRowKey(q, qi)}
              className="rounded-xl p-6 space-y-4 transition-all"
              style={{ background: "#fff", border: "2px solid #fcd34d", boxShadow: "0 4px 16px rgba(245,158,11,0.12)" }}
            >
              <div className="flex items-center justify-between flex-wrap gap-3 pb-3" style={{ borderBottom: "2px solid #fef3c7" }}>
                <div className="flex items-center gap-2">
                  <span
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold"
                    style={{ background: "linear-gradient(135deg, #f59e0b, #d97706)", color: "#fff" }}
                  >
                    {qi + 1}
                  </span>
                  <span className="text-xs font-bold uppercase tracking-widest text-amber-700">
                    Question {qi + 1}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => removeQuestion(qi)}
                  className="text-xs font-bold px-3 py-1.5 rounded-lg transition-all"
                  style={{ background: "#fee2e2", color: "#991b1b", border: "1px solid #fca5a5" }}
                >
                  Delete question
                </button>
              </div>
              <input
                value={q.question}
                onChange={(e) => updateQuestionField(qi, "question", e.target.value)}
                placeholder="Enter question text..."
                style={{ ...inputStyle, border: "2px solid #fcd34d", background: "#fff", padding: "12px 16px", fontSize: "15px", fontWeight: "500" }}
                onFocus={(e) => { e.target.style.borderColor = "#f59e0b"; e.target.style.boxShadow = "0 0 0 3px rgba(245,158,11,0.1)"; }}
                onBlur={(e) => { e.target.style.borderColor = "#fcd34d"; e.target.style.boxShadow = "none"; }}
              />

              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="text-xs font-bold uppercase tracking-widest text-amber-700">Options</span>
                <button
                  type="button"
                  onClick={() => addOption(qi)}
                  className="text-xs font-bold px-2.5 py-1 rounded-lg transition-all"
                  style={{ background: "#dcfce7", color: "#166534", border: "1px solid #86efac" }}
                >
                  + Add option
                </button>
              </div>

              <div className="space-y-3">
                {q.options.map((opt, oi) => {
                  const isMarked =
                    q.correctAnswer !== "" && q.correctAnswer === opt && opt.trim() !== "";
                  return (
                    <div
                      key={oi}
                      className="flex gap-3 items-center px-4 py-3 rounded-xl transition-all flex-wrap sm:flex-nowrap"
                      style={{
                        background: isMarked ? "#f0fdf4" : "#fff",
                        border: `2px solid ${isMarked ? "#22c55e" : "#fde68a"}`,
                        boxShadow: isMarked ? "0 2px 8px rgba(34,197,94,0.1)" : "none",
                      }}
                    >
                      <label className="flex items-center gap-2 shrink-0 cursor-pointer min-w-[90px]">
                        <input
                          type="radio"
                          name={`correct-${questionRowKey(q, qi)}`}
                          checked={isMarked}
                          onChange={() => setCorrectAnswer(qi, opt)}
                          className="shrink-0 w-4 h-4"
                          style={{ accentColor: "#22c55e" }}
                          title="Mark as correct answer"
                        />
                        <span className="text-xs font-bold text-amber-800 uppercase whitespace-nowrap">Correct</span>
                      </label>
                      <input
                        value={opt}
                        onChange={(e) => updateOption(qi, oi, e.target.value)}
                        placeholder={`Option ${oi + 1}`}
                        className="min-w-0 flex-1 py-2 px-3 rounded-lg text-sm font-medium"
                        style={{ border: "1.5px solid #fde68a", outline: "none", color: "#1e293b", background: "#fff" }}
                        onFocus={(e) => { e.target.style.borderColor = "#f59e0b"; }}
                        onBlur={(e) => { e.target.style.borderColor = "#fde68a"; }}
                      />
                      <button
                        type="button"
                        onClick={() => removeOption(qi, oi)}
                        disabled={q.options.length <= 2}
                        className="text-xs font-bold px-3 py-2 rounded-lg transition-all shrink-0 disabled:opacity-40 disabled:cursor-not-allowed hover:scale-105"
                        style={{ background: "#fef2f2", color: "#991b1b", border: "1.5px solid #fecaca" }}
                      >
                        Remove
                      </button>
                    </div>
                  );
                })}
              </div>

              {q.correctAnswer.trim() !== "" && (
                <div
                  className="flex items-center gap-2 text-sm font-bold px-4 py-3 rounded-xl"
                  style={{ background: "#dcfce7", color: "#166534", border: "2px solid #86efac" }}
                >
                  ✅ Correct Answer: {q.correctAnswer}
                </div>
              )}
            </div>
          ))}

          <button
            type="button"
            onClick={addQuestion}
            className="w-full py-3 rounded-xl text-sm font-bold transition-all hover:-translate-y-0.5"
            style={{ border: "2px dashed #fcd34d", color: "#92400e", background: "#fffbeb" }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "#fef3c7"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "#fffbeb"; }}
          >
            + Add question
          </button>
        </div>
      )}

      <Alert msg={msg} />
      <div className="flex gap-3 flex-wrap">
        <SaveBtn onClick={saveQuiz} label="Save quiz" />
        {quiz && <DangerBtn onClick={deleteQuiz} label="Delete quiz" />}
      </div>
    </div>
  );
}