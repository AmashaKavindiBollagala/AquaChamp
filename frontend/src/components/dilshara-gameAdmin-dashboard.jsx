import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE = "http://localhost:4000";

// ─── The 5 main topics your app covers ───────────────────────────────────────
const MAIN_TOPICS = [
  { id: "safe-drinking-water",        name: "Safe Drinking Water" },
  { id: "hand-washing-and-personal-hygiene",        name: "Hand Washing and Personal Hygiene" },
  { id: "toilet-and-sanpracticesitation-practices",         name: "Toilet and Sanitation Practices" },
  { id: "water-borne-diseases-and-prevention",       name: "Water Borne Diseases and Prevention" },
  { id: "water-conservation-and-environment-care", name: "Water Conservation and Environment Care" },
];

// Open Trivia category IDs (science closest to water/sanitation topics)
const TRIVIA_CATEGORIES = [
  { id: 17, label: "Science & Nature" },
  { id: 27, label: "Animals" },
  { id: 19, label: "Mathematics" },
  { id: 9,  label: "General Knowledge" },
];

// Points & time per difficulty
const DIFF_CONFIG = {
  easy:   { timeLimit: 30, pointsPerQuestion: 10, questionCount: 5  },
  medium: { timeLimit: 20, pointsPerQuestion: 15, questionCount: 8  },
  hard:   { timeLimit: 15, pointsPerQuestion: 20, questionCount: 10 },
};

const sidebarItems = [
  { icon: "⊞", label: "Dashboard",       key: "dashboard" },
  { icon: "🎮", label: "All Games",       key: "games"     },
  { icon: "✚", label: "Create Game",     key: "create"    },
  { icon: "📋", label: "Recent Activity", key: "activity"  },
];

// ─── Shared styles ─────────────────────────────────────────────────────────
const inputStyle = {
  width: "100%", background: "#152B44", border: "1.5px solid #1E3A56",
  borderRadius: 8, padding: "10px 14px", color: "#F0F6FF", fontSize: 14,
  fontFamily: "'DM Sans', sans-serif", outline: "none", boxSizing: "border-box",
};
const labelStyle = {
  display: "block", fontSize: 11, fontWeight: 700, color: "#7BAED4",
  letterSpacing: "0.8px", textTransform: "uppercase", marginBottom: 6,
};
const sectionStyle = {
  background: "#0F2840", border: "1px solid #1E3A56",
  borderRadius: 10, padding: 20, marginBottom: 20,
};

// ─────────────────────────────────────────────────────────────────────────────
//  SIDEBAR
// ─────────────────────────────────────────────────────────────────────────────
function Sidebar({ active, setActive, username, onLogout }) {
  return (
    <div style={{
      width: 220, minHeight: "100vh", background: "#0D2137",
      borderRight: "1px solid #1A3050", display: "flex", flexDirection: "column",
      fontFamily: "'DM Sans', sans-serif", flexShrink: 0,
    }}>
      <div style={{ padding: "24px 20px 20px", borderBottom: "1px solid #1A3050" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 8,
            background: "linear-gradient(135deg, #2B7FD4, #1D9E75)",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18,
          }}>🌊</div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#F0F6FF" }}>AquaChamp</div>
            <div style={{ fontSize: 10, color: "#4A6A88", letterSpacing: "0.8px", textTransform: "uppercase" }}>Game Admin</div>
          </div>
        </div>
      </div>

      <nav style={{ flex: 1, padding: "12px 10px" }}>
        {sidebarItems.map(item => (
          <button key={item.key} onClick={() => setActive(item.key)} style={{
            width: "100%", display: "flex", alignItems: "center", gap: 10,
            padding: "10px 12px", borderRadius: 8, border: "none", cursor: "pointer",
            background: active === item.key ? "#1A3A5C" : "transparent",
            color: active === item.key ? "#F0F6FF" : "#7BAED4",
            fontSize: 13, fontWeight: active === item.key ? 600 : 400,
            fontFamily: "'DM Sans', sans-serif", marginBottom: 2, textAlign: "left",
          }}>
            <span style={{ fontSize: 15, width: 18, textAlign: "center" }}>{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>

      <div style={{ padding: "16px", borderTop: "1px solid #1A3050" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
          <div style={{
            width: 34, height: 34, borderRadius: "50%", background: "#1A3A5C",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#2B7FD4", fontWeight: 700, fontSize: 13,
          }}>
            {username ? username[0].toUpperCase() : "G"}
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#F0F6FF" }}>{username || "Game Admin"}</div>
            <div style={{ fontSize: 11, color: "#4A6A88" }}>Game_ADMIN</div>
          </div>
        </div>
        <button onClick={onLogout} style={{
          width: "100%", padding: "8px", background: "transparent",
          border: "1px solid #1E3A56", borderRadius: 8, color: "#7BAED4",
          fontSize: 12, cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
        }}>Sign Out</button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  QUESTION EDITOR  — Handles one question (add/edit/delete)
// ─────────────────────────────────────────────────────────────────────────────
function QuestionEditor({ question, index, onChange, onDelete }) {
  const handleOption = (i, value) => {
    const opts = [...question.options];
    opts[i] = value;
    onChange({ ...question, options: opts });
  };

  return (
    <div style={{
      background: "#0B1E33", border: "1px solid #1E3A56",
      borderRadius: 8, padding: 16, marginBottom: 12, position: "relative",
    }}>
      <div style={{
        display: "flex", justifyContent: "space-between",
        alignItems: "center", marginBottom: 10,
      }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: "#2B7FD4" }}>
          Question {index + 1}
        </span>
        <button onClick={onDelete} style={{
          background: "transparent", border: "none", color: "#E07070",
          cursor: "pointer", fontSize: 18, lineHeight: 1, padding: 0,
        }} title="Remove this question">✕</button>
      </div>

      {/* Question text */}
      <div style={{ marginBottom: 10 }}>
        <label style={labelStyle}>Question Text *</label>
        <textarea
          value={question.questionText}
          onChange={e => onChange({ ...question, questionText: e.target.value })}
          rows={2}
          placeholder="Enter the question..."
          style={{ ...inputStyle, resize: "vertical" }}
        />
      </div>

      {/* 4 options */}
      <div style={{ marginBottom: 10 }}>
        <label style={labelStyle}>Answer Options (4 required) *</label>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {[0, 1, 2, 3].map(i => (
            <input
              key={i}
              value={question.options[i] || ""}
              onChange={e => handleOption(i, e.target.value)}
              placeholder={`Option ${String.fromCharCode(65 + i)}`}
              style={{ ...inputStyle, fontSize: 13 }}
            />
          ))}
        </div>
      </div>

      {/* Correct answer */}
      <div style={{ marginBottom: 10 }}>
        <label style={labelStyle}>Correct Answer *</label>
        <select
          value={question.correctAnswer}
          onChange={e => onChange({ ...question, correctAnswer: e.target.value })}
          style={inputStyle}
        >
          <option value="">-- Select correct answer --</option>
          {question.options.filter(Boolean).map((opt, i) => (
            <option key={i} value={opt}>{opt}</option>
          ))}
        </select>
      </div>

      {/* Hint (optional) */}
      <div>
        <label style={labelStyle}>Hint (optional — shown in Easy mode)</label>
        <input
          value={question.hint || ""}
          onChange={e => onChange({ ...question, hint: e.target.value })}
          placeholder="e.g. Think about where rain comes from..."
          style={inputStyle}
        />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  CREATE GAME FORM  — The main form, fully wired
// ─────────────────────────────────────────────────────────────────────────────
function CreateGameForm({ token, onSuccess }) {
  // Step 1 = basic info, Step 2 = questions
  const [step, setStep]       = useState(1);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg]         = useState("");

  // Step 1 state
  const [form, setForm] = useState({
    topicId:    "",
    topicName:  "",
    ageGroup:   "5-10",
    difficulty: "easy",
    subType:    "quiz",
    title:      "",
    description:"",
  });

  // Step 2 state: array of question objects
  const [questions, setQuestions] = useState([]);

  // Open Trivia generate state
  const [triviaCategory, setTriviaCategory] = useState(17);
  const [generating, setGenerating]         = useState(false);
  const [generateMsg, setGenerateMsg]       = useState("");

  // ── Derived config from chosen difficulty ──────────────────────────────────
  const config = DIFF_CONFIG[form.difficulty];

  // ── Step 1: handle field changes ──────────────────────────────────────────
  const handleField = (key, value) => {
    if (key === "topicId") {
      const topic = MAIN_TOPICS.find(t => t.id === value);
      setForm(f => ({ ...f, topicId: value, topicName: topic?.name || "" }));
    } else if (key === "difficulty") {
      setForm(f => ({ ...f, difficulty: value }));
    } else {
      setForm(f => ({ ...f, [key]: value }));
    }
  };

  // ── Add a blank question ───────────────────────────────────────────────────
  const addBlankQuestion = () => {
    setQuestions(q => [...q, { questionText: "", options: ["", "", "", ""], correctAnswer: "", hint: "" }]);
  };

  // ── Update a specific question ─────────────────────────────────────────────
  const updateQuestion = (i, updated) => {
    setQuestions(qs => qs.map((q, idx) => idx === i ? updated : q));
  };

  // ── Delete a question ─────────────────────────────────────────────────────
  const deleteQuestion = i => {
    setQuestions(qs => qs.filter((_, idx) => idx !== i));
  };

  // ── Generate questions from Open Trivia API (via your backend) ─────────────
  const handleGenerate = async () => {
    setGenerating(true);
    setGenerateMsg("");
    try {
      const amount = config.questionCount;
      const url = `${API_BASE}/api/games/generate-questions?category=${triviaCategory}&difficulty=${form.difficulty}&amount=${amount}`;
      const res  = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();

      if (!res.ok) {
        setGenerateMsg("⚠️ " + (data.message || "Failed to generate questions."));
        return;
      }

      // Merge generated questions INTO existing questions (don't replace)
      setQuestions(q => [...q, ...data.questions]);
      setGenerateMsg(`✅ ${data.questions.length} questions added. Review and edit them below.`);
    } catch {
      setGenerateMsg("❌ Could not reach the server.");
    } finally {
      setGenerating(false);
    }
  };

  // ── Final submit ───────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    setMsg("");

    // Validation
    if (!form.topicId)    { setMsg("Please select a main topic."); return; }
    if (!form.title.trim()){ setMsg("Title is required."); return; }
    if (questions.length === 0) { setMsg("Add at least one question."); return; }

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.questionText.trim())              { setMsg(`Question ${i+1}: question text is empty.`); return; }
      if (q.options.filter(Boolean).length < 4){ setMsg(`Question ${i+1}: fill in all 4 options.`); return; }
      if (!q.correctAnswer)                    { setMsg(`Question ${i+1}: select a correct answer.`); return; }
    }

    setLoading(true);
    try {
      const payload = {
        ...form,
        questions,
        timeLimit:         config.timeLimit,
        pointsPerQuestion: config.pointsPerQuestion,
        passMark:          60,
        createdBy:         localStorage.getItem("adminUsername") || "admin",
      };

      const res  = await fetch(`${API_BASE}/api/games`, {
        method:  "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body:    JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) { setMsg("❌ " + (data.message || "Failed to create game.")); return; }

      setMsg("✅ Game created successfully!");
      // Reset form
      setStep(1);
      setForm({ topicId:"", topicName:"", ageGroup:"5-10", difficulty:"easy", title:"", description:"" });
      setQuestions([]);
      if (onSuccess) onSuccess();
    } catch {
      setMsg("❌ Could not connect to server.");
    } finally {
      setLoading(false);
    }
  };

  // ── Pill badge helper ──────────────────────────────────────────────────────
  const badge = (label, color) => (
    <span style={{
      display: "inline-block", padding: "2px 10px", borderRadius: 20,
      background: color + "22", border: `1px solid ${color}`,
      color, fontSize: 11, fontWeight: 700,
    }}>{label}</span>
  );

  const diffColor = { easy: "#1D9E75", medium: "#EF9F27", hard: "#E05252" };

  return (
    <div style={{ maxWidth: 680 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: "#F0F6FF", margin: 0 }}>Create New Game</h2>
        {/* Step indicator */}
        <div style={{ display: "flex", gap: 6 }}>
          {[1, 2].map(s => (
            <div key={s} style={{
              width: 28, height: 28, borderRadius: "50%",
              background: step >= s ? "#2B7FD4" : "#1A3050",
              border: `2px solid ${step >= s ? "#2B7FD4" : "#1E3A56"}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 12, fontWeight: 700, color: step >= s ? "#fff" : "#4A6A88",
              cursor: s < step ? "pointer" : "default",
            }} onClick={() => s < step && setStep(s)}>{s}</div>
          ))}
        </div>
        <span style={{ fontSize: 12, color: "#4A6A88" }}>
          {step === 1 ? "Basic Info" : "Questions"}
        </span>
      </div>

      {/* ── Global message ── */}
      {msg && (
        <div style={{
          background: msg.startsWith("✅") ? "#0D2A1E" : "#2A1010",
          border: `1px solid ${msg.startsWith("✅") ? "#1D9E75" : "#5C2020"}`,
          borderRadius: 8, padding: "10px 14px", marginBottom: 16,
          fontSize: 13, color: msg.startsWith("✅") ? "#4AE0A0" : "#E07070",
        }}>{msg}</div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          STEP 1 — BASIC INFO
      ══════════════════════════════════════════════════════════════════════ */}
      {step === 1 && (
        <>
          {/* Topic */}
          <div style={sectionStyle}>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: "#7BAED4", margin: "0 0 14px", textTransform: "uppercase", letterSpacing: "0.8px" }}>
              1. Select Main Topic *
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {MAIN_TOPICS.map(t => (
                <button key={t.id} onClick={() => handleField("topicId", t.id)} style={{
                  padding: "12px 16px", borderRadius: 8, cursor: "pointer",
                  border: `2px solid ${form.topicId === t.id ? "#2B7FD4" : "#1E3A56"}`,
                  background: form.topicId === t.id ? "#1A3A5C" : "#0B1E33",
                  color: form.topicId === t.id ? "#F0F6FF" : "#7BAED4",
                  fontSize: 13, fontWeight: form.topicId === t.id ? 600 : 400,
                  fontFamily: "'DM Sans', sans-serif", textAlign: "left",
                  transition: "all 0.15s",
                }}>
                  {t.name}
                </button>
              ))}
            </div>
          </div>

          {/* Age group + difficulty */}
          <div style={sectionStyle}>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: "#7BAED4", margin: "0 0 14px", textTransform: "uppercase", letterSpacing: "0.8px" }}>
              2. Age Group & Difficulty *
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
              <div>
                <label style={labelStyle}>Age Group</label>
                <div style={{ display: "flex", gap: 8 }}>
                  {["5-10", "11-15"].map(ag => (
                    <button key={ag} onClick={() => handleField("ageGroup", ag)} style={{
                      flex: 1, padding: "10px", borderRadius: 8, cursor: "pointer",
                      border: `2px solid ${form.ageGroup === ag ? "#2B7FD4" : "#1E3A56"}`,
                      background: form.ageGroup === ag ? "#1A3A5C" : "#0B1E33",
                      color: form.ageGroup === ag ? "#F0F6FF" : "#7BAED4",
                      fontSize: 13, fontWeight: 600, fontFamily: "'DM Sans', sans-serif",
                    }}>
                      {ag === "5-10" ? "🧒 5–10" : "👦 11–15"}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label style={labelStyle}>Difficulty</label>
                <div style={{ display: "flex", gap: 8 }}>
                  {["easy", "medium", "hard"].map(d => (
                    <button key={d} onClick={() => handleField("difficulty", d)} style={{
                      flex: 1, padding: "10px", borderRadius: 8, cursor: "pointer",
                      border: `2px solid ${form.difficulty === d ? diffColor[d] : "#1E3A56"}`,
                      background: form.difficulty === d ? diffColor[d] + "22" : "#0B1E33",
                      color: form.difficulty === d ? diffColor[d] : "#7BAED4",
                      fontSize: 12, fontWeight: 600, fontFamily: "'DM Sans', sans-serif",
                      textTransform: "capitalize",
                    }}>
                      {d}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Config preview */}
            <div style={{
              background: "#0B1E33", borderRadius: 8, padding: "12px 16px",
              display: "flex", gap: 20, flexWrap: "wrap",
            }}>
              <span style={{ fontSize: 12, color: "#4A6A88" }}>
                ⏱ <strong style={{ color: "#F0F6FF" }}>{config.timeLimit}s</strong> per question
              </span>
              <span style={{ fontSize: 12, color: "#4A6A88" }}>
                🏆 <strong style={{ color: "#F0F6FF" }}>{config.pointsPerQuestion} pts</strong> per correct answer
              </span>
              <span style={{ fontSize: 12, color: "#4A6A88" }}>
                📝 <strong style={{ color: "#F0F6FF" }}>{config.questionCount}</strong> questions recommended
              </span>
            </div>
          </div>

          {/* Title + description */}
          <div style={sectionStyle}>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: "#7BAED4", margin: "0 0 14px", textTransform: "uppercase", letterSpacing: "0.8px" }}>
              3. Game Title & Description
            </h3>
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Title *</label>
              <input
                value={form.title}
                onChange={e => handleField("title", e.target.value)}
                placeholder="e.g. Water Cycle Challenge — Easy"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Description</label>
              <textarea
                value={form.description}
                onChange={e => handleField("description", e.target.value)}
                rows={2}
                placeholder="Brief description of this game..."
                style={{ ...inputStyle, resize: "vertical" }}
              />
            </div>
          </div>

          <button
            onClick={() => {
              if (!form.topicId)    { setMsg("Select a topic."); return; }
              if (!form.title.trim()){ setMsg("Title is required."); return; }
              setMsg("");
              setStep(2);
            }}
            style={{
              padding: "12px 32px", background: "#2B7FD4", color: "#fff",
              fontSize: 14, fontWeight: 700, fontFamily: "'DM Sans', sans-serif",
              border: "none", borderRadius: 8, cursor: "pointer",
            }}
          >
            Next: Add Questions →
          </button>
        </>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          STEP 2 — QUESTIONS
      ══════════════════════════════════════════════════════════════════════ */}
      {step === 2 && (
        <>
          {/* Summary of what they set */}
          <div style={{
            ...sectionStyle,
            display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap",
          }}>
            <span style={{ fontSize: 13, color: "#F0F6FF", fontWeight: 600 }}>{form.title}</span>
            {badge(form.topicName, "#2B7FD4")}
            {badge(form.ageGroup, "#7BAED4")}
            {badge(form.difficulty, diffColor[form.difficulty])}
            <button onClick={() => setStep(1)} style={{
              marginLeft: "auto", background: "transparent", border: "1px solid #1E3A56",
              borderRadius: 6, color: "#7BAED4", fontSize: 12, padding: "4px 12px",
              cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
            }}>← Edit Info</button>
          </div>

          {/* ── Open Trivia API Generator ─────────────────────────────────── */}
          <div style={{ ...sectionStyle, borderColor: "#1A4A6A" }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: "#2B7FD4", margin: "0 0 4px", textTransform: "uppercase", letterSpacing: "0.8px" }}>
              ✨ Auto-Generate Questions (Open Trivia API)
            </h3>
            <p style={{ fontSize: 12, color: "#4A6A88", margin: "0 0 14px" }}>
              Fetches {config.questionCount} {form.difficulty} questions automatically. Review and edit them before saving.
            </p>

            <div style={{ display: "flex", gap: 12, alignItems: "flex-end", flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: 180 }}>
                <label style={labelStyle}>Trivia Category</label>
                <select
                  value={triviaCategory}
                  onChange={e => setTriviaCategory(Number(e.target.value))}
                  style={inputStyle}
                >
                  {TRIVIA_CATEGORIES.map(c => (
                    <option key={c.id} value={c.id}>{c.label}</option>
                  ))}
                </select>
              </div>
              <button
                onClick={handleGenerate}
                disabled={generating}
                style={{
                  padding: "10px 20px", background: generating ? "#1A3050" : "#1A4A6A",
                  border: "1.5px solid #2B7FD4", borderRadius: 8, color: generating ? "#4A6A88" : "#7BCEF4",
                  fontSize: 13, fontWeight: 700, fontFamily: "'DM Sans', sans-serif",
                  cursor: generating ? "not-allowed" : "pointer", whiteSpace: "nowrap",
                }}
              >
                {generating ? "Generating..." : `⚡ Generate ${config.questionCount} Questions`}
              </button>
            </div>

            {generateMsg && (
              <div style={{
                marginTop: 12, fontSize: 12, padding: "8px 12px", borderRadius: 6,
                background: generateMsg.startsWith("✅") ? "#0D2A1E" : "#2A1010",
                color: generateMsg.startsWith("✅") ? "#4AE0A0" : "#E07070",
                border: `1px solid ${generateMsg.startsWith("✅") ? "#1D9E75" : "#5C2020"}`,
              }}>{generateMsg}</div>
            )}
          </div>

          {/* ── Question list ─────────────────────────────────────────────── */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#7BAED4" }}>
                Questions ({questions.length} / {config.questionCount} recommended)
              </span>
              <button onClick={addBlankQuestion} style={{
                padding: "7px 16px", background: "#0F2840", border: "1.5px solid #1E3A56",
                borderRadius: 8, color: "#7BAED4", fontSize: 12, fontWeight: 600,
                cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
              }}>
                + Add Question Manually
              </button>
            </div>

            {questions.length === 0 && (
              <div style={{
                background: "#0F2840", border: "1px dashed #1E3A56",
                borderRadius: 10, padding: 24, textAlign: "center",
                color: "#4A6A88", fontSize: 13,
              }}>
                No questions yet. Use "Generate" above or "Add Question Manually".
              </div>
            )}

            {questions.map((q, i) => (
              <QuestionEditor
                key={i}
                question={q}
                index={i}
                onChange={updated => updateQuestion(i, updated)}
                onDelete={() => deleteQuestion(i)}
              />
            ))}
          </div>

          {/* ── Actions ───────────────────────────────────────────────────── */}
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <button
              onClick={handleSubmit}
              disabled={loading || questions.length === 0}
              style={{
                padding: "12px 32px", background: loading ? "#1A3050" : "#1D9E75",
                color: "#fff", fontSize: 14, fontWeight: 700,
                fontFamily: "'DM Sans', sans-serif", border: "none",
                borderRadius: 8, cursor: loading ? "not-allowed" : "pointer",
                opacity: questions.length === 0 ? 0.5 : 1,
              }}
            >
              {loading ? "Saving..." : "💾 Save Game"}
            </button>
            <span style={{ fontSize: 12, color: "#4A6A88" }}>
              {questions.length} question{questions.length !== 1 ? "s" : ""} ready
            </span>
          </div>
        </>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  STAT CARD + GAME CARD + ALL GAMES + DASHBOARD + ACTIVITY  (same as before)
// ─────────────────────────────────────────────────────────────────────────────
function StatCard({ label, value, color }) {
  return (
    <div style={{
      background: "#0F2840", border: "1px solid #1E3A56",
      borderRadius: 10, padding: "16px 20px", flex: 1,
    }}>
      <div style={{ fontSize: 12, color: "#4A6A88", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.8px" }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 700, color: color || "#F0F6FF" }}>{value}</div>
    </div>
  );
}

function GameCard({ game, onDelete }) {
  const diff = { easy: "#1D9E75", medium: "#EF9F27", hard: "#E05252" };
  return (
    <div style={{
      background: "#0F2840", border: "1px solid #1E3A56", borderRadius: 10, padding: 16,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: "#F0F6FF" }}>{game.title}</div>
        <span style={{
          fontSize: 11, padding: "2px 8px", borderRadius: 20, background: "#122136",
          color: diff[game.difficulty] || "#7BAED4",
          border: `1px solid ${diff[game.difficulty] || "#7BAED4"}`,
          textTransform: "capitalize",
        }}>{game.difficulty}</span>
      </div>
      <div style={{ fontSize: 12, color: "#4A6A88", marginBottom: 8 }}>
        {game.description || "No description"}
      </div>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 8 }}>
        <span style={{ fontSize: 11, color: "#7BAED4" }}>📚 {game.topicName || "—"}</span>
        <span style={{ fontSize: 11, color: "#4A6A88" }}>• Age {game.ageGroup}</span>
        <span style={{ fontSize: 11, color: "#4A6A88" }}>• {game.questions?.length || 0} questions</span>
        <span style={{ fontSize: 11, color: "#4A6A88" }}>• {game.pointsPerQuestion} pts/q</span>
      </div>
      {onDelete && (
        <button onClick={() => onDelete(game._id)} style={{
          marginTop: 4, padding: "6px 14px", background: "transparent",
          border: "1px solid #5C2020", borderRadius: 6, color: "#E07070",
          fontSize: 12, cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
        }}>Delete</button>
      )}
    </div>
  );
}

function AllGames({ token }) {
  const [games, setGames]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState({ topicId: "", ageGroup: "", difficulty: "" });

  const fetchGames = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter.topicId)   params.set("topicId",   filter.topicId);
      if (filter.ageGroup)  params.set("ageGroup",  filter.ageGroup);
      if (filter.difficulty)params.set("difficulty", filter.difficulty);

      const res  = await fetch(`${API_BASE}/api/games?${params}`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setGames(data.games || []);
    } catch { setGames([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchGames(); }, [filter]);

  const handleDelete = async id => {
    if (!confirm("Delete this game?")) return;
    await fetch(`${API_BASE}/api/games/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
    setGames(prev => prev.filter(g => g._id !== id));
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: "#F0F6FF", margin: 0 }}>All Games ({games.length})</h2>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
        <select value={filter.topicId} onChange={e => setFilter(f => ({ ...f, topicId: e.target.value }))}
          style={{ ...inputStyle, width: "auto", fontSize: 12 }}>
          <option value="">All Topics</option>
          {MAIN_TOPICS.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
        <select value={filter.ageGroup} onChange={e => setFilter(f => ({ ...f, ageGroup: e.target.value }))}
          style={{ ...inputStyle, width: "auto", fontSize: 12 }}>
          <option value="">All Ages</option>
          <option value="5-10">5–10</option>
          <option value="11-15">11–15</option>
        </select>
        <select value={filter.difficulty} onChange={e => setFilter(f => ({ ...f, difficulty: e.target.value }))}
          style={{ ...inputStyle, width: "auto", fontSize: 12 }}>
          <option value="">All Difficulties</option>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
      </div>

      {loading
        ? <div style={{ color: "#4A6A88", fontSize: 14 }}>Loading games...</div>
        : games.length === 0
          ? <div style={{ color: "#4A6A88", fontSize: 13, padding: 20, textAlign: "center" }}>No games found.</div>
          : <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
              {games.map(g => <GameCard key={g._id} game={g} onDelete={handleDelete} />)}
            </div>
      }
    </div>
  );
}

function Dashboard({ username, games }) {
  const total  = games.length;
  const easy   = games.filter(g => g.difficulty === "easy").length;
  const medium = games.filter(g => g.difficulty === "medium").length;
  const hard   = games.filter(g => g.difficulty === "hard").length;
  const recent = [...games].reverse().slice(0, 3);

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: "#F0F6FF" }}>Welcome back, {username} 👋</h2>
        <p style={{ fontSize: 13, color: "#4A6A88", marginTop: 4 }}>Here's a quick overview of your games.</p>
      </div>
      <div style={{ display: "flex", gap: 16, marginBottom: 28, flexWrap: "wrap" }}>
        <StatCard label="Total Games"  value={total}  color="#2B7FD4" />
        <StatCard label="Easy"         value={easy}   color="#1D9E75" />
        <StatCard label="Medium"       value={medium} color="#EF9F27" />
        <StatCard label="Hard"         value={hard}   color="#E05252" />
      </div>
      <h3 style={{ fontSize: 14, fontWeight: 700, color: "#7BAED4", marginBottom: 14, textTransform: "uppercase", letterSpacing: "0.8px" }}>
        Recently Added
      </h3>
      {recent.length
        ? <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 14 }}>
            {recent.map(g => <GameCard key={g._id} game={g} />)}
          </div>
        : <div style={{ color: "#4A6A88", fontSize: 13 }}>No games yet. Create one!</div>
      }
    </div>
  );
}

function Activity() {
  return (
    <div>
      <h2 style={{ fontSize: 18, fontWeight: 700, color: "#F0F6FF", marginBottom: 16 }}>Recent Activity</h2>
      <div style={{ background: "#0F2840", border: "1px solid #1E3A56", borderRadius: 10, padding: 20 }}>
        <p style={{ color: "#4A6A88", fontSize: 13 }}>Activity log — connect your backend endpoint here.</p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  ROOT COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default function GameAdminDashboard() {
  const [active, setActive] = useState("dashboard");
  const [games, setGames]   = useState([]);
  const navigate = useNavigate();

  const token    = localStorage.getItem("superAdminToken");
  const username = localStorage.getItem("adminUsername") || "Game Admin";

  useEffect(() => {
    const roles = JSON.parse(localStorage.getItem("adminRoles") || "[]");
    if (!roles.includes("Game_ADMIN") && !roles.includes("SUPER_ADMIN")) {
      navigate("/admin-login");
    }
    fetchGames();
  }, []);

  const fetchGames = async () => {
    try {
      const res  = await fetch(`${API_BASE}/api/games`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setGames(data.games || []);
    } catch { setGames([]); }
  };

  const handleLogout = () => {
    ["superAdminToken", "adminRoles", "adminUsername"].forEach(k => localStorage.removeItem(k));
    navigate("/admin-login");
  };

  const renderContent = () => {
    switch (active) {
      case "dashboard": return <Dashboard username={username} games={games} />;
      case "games":     return <AllGames token={token} />;
      case "create":    return <CreateGameForm token={token} onSuccess={() => { fetchGames(); setActive("games"); }} />;
      case "activity":  return <Activity />;
      default:          return null;
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#0B1E33", fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');`}</style>
      <Sidebar active={active} setActive={setActive} username={username} onLogout={handleLogout} />
      <main style={{ flex: 1, padding: "32px 36px", overflowY: "auto" }}>
        {renderContent()}
      </main>
    </div>
  );
}