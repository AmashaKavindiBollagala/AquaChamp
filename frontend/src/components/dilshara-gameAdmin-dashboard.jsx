import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_URL;

const MAIN_TOPICS = [
  { id: "safe-drinking-water",                      name: "Safe Drinking Water" },
  { id: "hand-washing-and-personal-hygiene",        name: "Handwashing and Personal Hygiene" },
  { id: "toilet-and-sanpracticesitation-practices", name: "Toilet and Sanitation Practices" },
  { id: "water-borne-diseases-and-prevention",      name: "Water-Borne Diseases and Prevention" },
  { id: "water-conservation-and-environment-care",  name: "Water Conservation and Environmental Care" },
];

const TRIVIA_CATEGORIES = [
  { id: 17, label: "Science & Nature" },
  { id: 27, label: "Animals" },
  { id: 19, label: "Mathematics" },
  { id: 9,  label: "General Knowledge" },
];

const DIFF_CONFIG = {
  easy:   { timeLimit: 30, pointsPerQuestion: 10, questionCount: 5  },
  medium: { timeLimit: 20, pointsPerQuestion: 15, questionCount: 8  },
  hard:   { timeLimit: 15, pointsPerQuestion: 20, questionCount: 10 },
};

//  ADDED "cleanordirty" to this list 
const NON_QUIZ_TYPES = ["germcatcher", "waterdrop", "memory", "cleanordirty", "cleandirtygame"];

//  ADDED "cleanordirty" entry 
const GAME_TYPE_INFO = {

  cleandirtygame: {
    emoji: "🚰", label: "Germ Catcher",
    howItWorks: "Kids tap floating germ bubbles to catch the correct answer. Content is auto-generated from a word bank based on the topic you selected.",
    contentSource: "Word-bank (auto)", color: "#8ce3f3",
  },
  germcatcher: {
    emoji: "🦠", label: "Germ Catcher",
    howItWorks: "Kids tap floating germ bubbles to catch the correct answer. Content is auto-generated from a word bank based on the topic you selected.",
    contentSource: "Word-bank (auto)", color: "#EC4899",
  },
  waterdrop: {
    emoji: "💧", label: "Water Drop Adventure",
    howItWorks: "Kids guide a water drop along a river path by answering questions. Content is auto-generated from a word bank based on the topic.",
    contentSource: "Word-bank (auto)", color: "#0EA5E9",
  },
  memory: {
    emoji: "🃏", label: "Memory Match",
    howItWorks: "Kids flip cards and match water/hygiene word-icon pairs. Card pairs are auto-selected from a topic-specific library — no questions needed.",
    contentSource: "Card library (auto)", color: "#A855F7",
  },
  cleanordirty: {
    emoji: "🫧", label: "Clean or Dirty?",
    howItWorks: "Kids drag item cards (muddy water, washed hands, open drain, etc.) into a CLEAN ✅ or DIRTY ❌ bin. Fully touch-friendly with instant feedback.",
    contentSource: "Card library (auto)", color: "#0EA5E9",
  },

  
};

const sidebarItems = [
  { icon: "⊞", label: "Dashboard",       key: "dashboard" },
  { icon: "🎮", label: "All Games",       key: "games"     },
  { icon: "✚", label: "Create Game",     key: "create"    },
  { icon: "📋", label: "Recent Activity", key: "activity"  },
];

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


//  SIDEBAR

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


//  QUESTION EDITOR

function QuestionEditor({ question, index, onChange, onDelete }) {
  const handleOption = (i, value) => {
    const opts = [...question.options];
    opts[i] = value;
    onChange({ ...question, options: opts });
  };
  return (
    <div style={{
      background: "#0B1E33", border: "1px solid #1E3A56",
      borderRadius: 8, padding: 16, marginBottom: 12,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: "#2B7FD4" }}>Question {index + 1}</span>
        <button onClick={onDelete} style={{
          background: "transparent", border: "none", color: "#E07070",
          cursor: "pointer", fontSize: 18, lineHeight: 1, padding: 0,
        }}>✕</button>
      </div>
      <div style={{ marginBottom: 10 }}>
        <label style={labelStyle}>Question Text *</label>
        <textarea value={question.questionText}
          onChange={e => onChange({ ...question, questionText: e.target.value })}
          rows={2} placeholder="Enter the question..."
          style={{ ...inputStyle, resize: "vertical" }} />
      </div>
      <div style={{ marginBottom: 10 }}>
        <label style={labelStyle}>Answer Options (4 required) *</label>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {[0,1,2,3].map(i => (
            <input key={i} value={question.options[i] || ""}
              onChange={e => handleOption(i, e.target.value)}
              placeholder={`Option ${String.fromCharCode(65+i)}`}
              style={{ ...inputStyle, fontSize: 13 }} />
          ))}
        </div>
      </div>
      <div style={{ marginBottom: 10 }}>
        <label style={labelStyle}>Correct Answer *</label>
        <select value={question.correctAnswer}
          onChange={e => onChange({ ...question, correctAnswer: e.target.value })}
          style={inputStyle}>
          <option value="">-- Select correct answer --</option>
          {question.options.filter(Boolean).map((opt, i) => (
            <option key={i} value={opt}>{opt}</option>
          ))}
        </select>
      </div>
      <div>
        <label style={labelStyle}>Hint (optional)</label>
        <input value={question.hint || ""}
          onChange={e => onChange({ ...question, hint: e.target.value })}
          placeholder="e.g. Think about where rain comes from..."
          style={inputStyle} />
      </div>
    </div>
  );
}


//  NON-QUIZ STEP 2

function NonQuizStep2({ form, onBack, onSave, loading, msg }) {
  const info = GAME_TYPE_INFO[form.subType];
  const diffColor = { easy: "#1D9E75", medium: "#EF9F27", hard: "#E05252" };
  const badge = (label, color) => (
    <span style={{
      display: "inline-block", padding: "2px 10px", borderRadius: 20,
      background: color + "22", border: `1px solid ${color}`, color, fontSize: 11, fontWeight: 700,
    }}>{label}</span>
  );
  return (
    <div style={{ maxWidth: 680 }}>
      <div style={{ ...sectionStyle, display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <span style={{ fontSize: 13, color: "#F0F6FF", fontWeight: 600 }}>{form.title}</span>
        {badge(form.topicName, "#2B7FD4")}
        {badge(form.ageGroup, "#7BAED4")}
        {badge(form.difficulty, diffColor[form.difficulty])}
        <button onClick={onBack} style={{
          marginLeft: "auto", background: "transparent", border: "1px solid #1E3A56",
          borderRadius: 6, color: "#7BAED4", fontSize: 12, padding: "4px 12px",
          cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
        }}>← Edit Info</button>
      </div>
      <div style={{ ...sectionStyle, borderColor: info.color + "55" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 14, fontSize: 26,
            background: info.color + "22", border: `2px solid ${info.color}`,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>{info.emoji}</div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#F0F6FF" }}>{info.label}</div>
            <div style={{ fontSize: 11, color: info.color, fontWeight: 700 }}>Ages 5–10 · Auto-content game</div>
          </div>
        </div>
        <div style={{ background: "#0B1E33", borderRadius: 10, padding: 16, marginBottom: 16, border: "1px solid #1E3A56" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#7BAED4", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 8 }}>How kids will play</div>
          <p style={{ fontSize: 13, color: "#CBD5E1", margin: 0, lineHeight: 1.6 }}>{info.howItWorks}</p>
        </div>
        <div style={{ background: info.color + "11", border: `1px solid ${info.color}44`, borderRadius: 10, padding: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <span style={{ fontSize: 16 }}>✨</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: info.color, textTransform: "uppercase", letterSpacing: "0.8px" }}>
              Content Source: {info.contentSource}
            </span>
          </div>
          <p style={{ fontSize: 13, color: "#94A3B8", margin: 0, lineHeight: 1.5 }}>
            {form.subType === "memory" || form.subType === "cleanordirty"
              ? `${info.label} uses a built-in card library for ${form.topicName}. No extra setup needed.`
              : `Auto-generates from topic word-bank at play time for ${form.topicName}. No manual questions required.`
            }
          </p>
        </div>
      </div>
      <div style={sectionStyle}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "#7BAED4", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 12 }}>
          What gets saved to the database
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {[
            ["📚 Topic", form.topicName],
            ["🎮 Game Type", info.label],
            ["👶 Age Group", form.ageGroup],
            ["⚡ Difficulty", form.difficulty],
            ["⏱ Time Limit", `${DIFF_CONFIG[form.difficulty].timeLimit}s / question`],
            ["🏆 Points", `${DIFF_CONFIG[form.difficulty].pointsPerQuestion} pts / correct`],
          ].map(([k, v]) => (
            <div key={k} style={{ background: "#0B1E33", border: "1px solid #1E3A56", borderRadius: 8, padding: "10px 14px" }}>
              <div style={{ fontSize: 11, color: "#4A6A88", marginBottom: 3 }}>{k}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#F0F6FF" }}>{v}</div>
            </div>
          ))}
        </div>
      </div>
      {msg && (
        <div style={{
          background: msg.startsWith("✅") ? "#0D2A1E" : "#2A1010",
          border: `1px solid ${msg.startsWith("✅") ? "#1D9E75" : "#5C2020"}`,
          borderRadius: 8, padding: "10px 14px", marginBottom: 16,
          fontSize: 13, color: msg.startsWith("✅") ? "#4AE0A0" : "#E07070",
        }}>{msg}</div>
      )}
      <button onClick={onSave} disabled={loading} style={{
        padding: "12px 32px", background: loading ? "#1A3050" : "#1D9E75",
        color: "#fff", fontSize: 14, fontWeight: 700, fontFamily: "'DM Sans', sans-serif",
        border: "none", borderRadius: 8, cursor: loading ? "not-allowed" : "pointer",
      }}>
        {loading ? "Saving..." : `💾 Save ${info.label} Game`}
      </button>
    </div>
  );
}


//  EDIT GAME FORM

function EditGameForm({ game, token, onSuccess, onCancel }) {
  const [loading, setLoading] = useState(false);
  const [msg,     setMsg]     = useState("");

  const [form, setForm] = useState({
    title:       game.title       || "",
    description: game.description || "",
    topicId:     game.topicId     || "",
    topicName:   game.lessonTopic || game.topicName || "",
    ageGroup:    game.ageGroup    || "5-10",
    difficulty:  game.difficulty  || "easy",
    subType:     game.subType     || "quiz",
  });

  const [questions, setQuestions] = useState(
    (game.questions || []).map(q => ({
      questionText:  q.questionText  || "",
      options:       q.options       || ["","","",""],
      correctAnswer: q.correctAnswer || "",
      hint:          q.hint          || "",
    }))
  );

  const [generating,     setGenerating]     = useState(false);
  const [generateMsg,    setGenerateMsg]    = useState("");
  const [triviaCategory, setTriviaCategory] = useState(17);

  const config    = DIFF_CONFIG[form.difficulty];
  const isNonQuiz = NON_QUIZ_TYPES.includes(form.subType);
  const diffColor = { easy: "#1D9E75", medium: "#EF9F27", hard: "#E05252" };

  const handleField = (key, value) => {
    if (key === "topicId") {
      const topic = MAIN_TOPICS.find(t => t.id === value);
      setForm(f => ({ ...f, topicId: value, topicName: topic?.name || "" }));
    } else {
      setForm(f => ({ ...f, [key]: value }));
    }
  };

  const addBlankQuestion = () =>
    setQuestions(q => [...q, { questionText: "", options: ["","","",""], correctAnswer: "", hint: "" }]);
  const updateQuestion = (i, updated) =>
    setQuestions(qs => qs.map((q, idx) => idx === i ? updated : q));
  const deleteQuestion = i =>
    setQuestions(qs => qs.filter((_, idx) => idx !== i));

  const handleGenerate = async () => {
    setGenerating(true); setGenerateMsg("");
    try {
      const url = `${API_BASE}/api/games/generate-questions?category=${triviaCategory}&difficulty=${form.difficulty}&amount=${config.questionCount}`;
      const res  = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (!res.ok) { setGenerateMsg("⚠️ " + (data.message || "Failed.")); return; }
      setQuestions(q => [...q, ...data.questions]);
      setGenerateMsg(`✅ ${data.questions.length} questions added.`);
    } catch { setGenerateMsg("❌ Could not reach the server."); }
    finally { setGenerating(false); }
  };

  const handleSave = async () => {
    setMsg(""); setLoading(true);
    try {
      const payload = {
        title:             form.title.trim(),
        description:       form.description.trim(),
        topicId:           form.topicId,
        lessonTopic:       form.topicName,
        topicName:         form.topicName, 
        ageGroup:          form.ageGroup,
        difficulty:        form.difficulty,
        subType:           form.subType,
        questions:         isNonQuiz ? [] : questions,
        timeLimit:         config.timeLimit,
        pointsPerQuestion: config.pointsPerQuestion,
        passMark:          60,
      };
      const res  = await fetch(`${API_BASE}/api/games/${game._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) { setMsg("❌ " + (data.message || "Failed.")); return; }
      setMsg("✅ Game updated successfully!");
      setTimeout(() => { if (onSuccess) onSuccess(); }, 1000);
    } catch { setMsg("❌ Could not connect to server."); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ maxWidth: 680 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
        <button onClick={onCancel} style={{
          background: "transparent", border: "1px solid #1E3A56", borderRadius: 8,
          color: "#7BAED4", fontSize: 12, padding: "6px 14px",
          cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
        }}>← Back to Games</button>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: "#F0F6FF", margin: 0 }}>✏️ Edit Game</h2>
      </div>

      {msg && (
        <div style={{
          background: msg.startsWith("✅") ? "#0D2A1E" : "#2A1010",
          border: `1px solid ${msg.startsWith("✅") ? "#1D9E75" : "#5C2020"}`,
          borderRadius: 8, padding: "10px 14px", marginBottom: 16,
          fontSize: 13, color: msg.startsWith("✅") ? "#4AE0A0" : "#E07070",
        }}>{msg}</div>
      )}

      {/* 1. Topic */}
      <div style={sectionStyle}>
        <h3 style={{ fontSize: 13, fontWeight: 700, color: "#7BAED4", margin: "0 0 14px", textTransform: "uppercase", letterSpacing: "0.8px" }}>1. Topic</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {MAIN_TOPICS.map(t => (
            <button key={t.id} onClick={() => handleField("topicId", t.id)} style={{
              padding: "12px 16px", borderRadius: 8, cursor: "pointer",
              border: `2px solid ${form.topicId === t.id ? "#2B7FD4" : "#1E3A56"}`,
              background: form.topicId === t.id ? "#1A3A5C" : "#0B1E33",
              color: form.topicId === t.id ? "#F0F6FF" : "#7BAED4",
              fontSize: 13, fontWeight: form.topicId === t.id ? 600 : 400,
              fontFamily: "'DM Sans', sans-serif", textAlign: "left",
            }}>{t.name}</button>
          ))}
        </div>
      </div>

      {/* 2. Age + Difficulty */}
      <div style={sectionStyle}>
        <h3 style={{ fontSize: 13, fontWeight: 700, color: "#7BAED4", margin: "0 0 14px", textTransform: "uppercase", letterSpacing: "0.8px" }}>2. Age Group & Difficulty</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
          <div>
            <label style={labelStyle}>Age Group</label>
            <div style={{ display: "flex", gap: 8 }}>
              {["5-10","11-15"].map(ag => (
                <button key={ag} onClick={() => handleField("ageGroup", ag)} style={{
                  flex: 1, padding: "10px", borderRadius: 8, cursor: "pointer",
                  border: `2px solid ${form.ageGroup === ag ? "#2B7FD4" : "#1E3A56"}`,
                  background: form.ageGroup === ag ? "#1A3A5C" : "#0B1E33",
                  color: form.ageGroup === ag ? "#F0F6FF" : "#7BAED4",
                  fontSize: 13, fontWeight: 600, fontFamily: "'DM Sans', sans-serif",
                }}>{ag === "5-10" ? "🧒 5–10" : "👦 11–15"}</button>
              ))}
            </div>
          </div>
          <div>
            <label style={labelStyle}>Difficulty</label>
            <div style={{ display: "flex", gap: 8 }}>
              {["easy","medium","hard"].map(d => (
                <button key={d} onClick={() => handleField("difficulty", d)} style={{
                  flex: 1, padding: "10px", borderRadius: 8, cursor: "pointer",
                  border: `2px solid ${form.difficulty === d ? diffColor[d] : "#1E3A56"}`,
                  background: form.difficulty === d ? diffColor[d] + "22" : "#0B1E33",
                  color: form.difficulty === d ? diffColor[d] : "#7BAED4",
                  fontSize: 12, fontWeight: 600, fontFamily: "'DM Sans', sans-serif", textTransform: "capitalize",
                }}>{d}</button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Game Type */}
      <div style={sectionStyle}>
        <h3 style={{ fontSize: 13, fontWeight: 700, color: "#7BAED4", margin: "0 0 6px", textTransform: "uppercase", letterSpacing: "0.8px" }}>3. Game Type</h3>
        <p style={{ fontSize: 12, color: "#4A6A88", margin: "0 0 14px" }}>Note: changing game type will clear existing questions.</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {[
            { id: "quiz",         label: "📝 Standard Quiz",       desc: "Manual questions", noteColor: "#EF9F27" },
            { id: "germcatcher",  label: "🦠 Germ Catcher",        desc: "Auto-content",     noteColor: "#1D9E75" },
            { id: "waterdrop",    label: "💧 Water Drop Adventure", desc: "Auto-content",     noteColor: "#1D9E75" },
            { id: "memory",       label: "🃏 Memory Match",         desc: "Auto-content",     noteColor: "#1D9E75" },
            { id: "cleanordirty", label: "🫧 Clean or Dirty?",      desc: "Auto-content",     noteColor: "#1D9E75" },
          ].map(exp => (
            <button key={exp.id} onClick={() => { handleField("subType", exp.id); if (exp.id !== form.subType) setQuestions([]); }} style={{
              padding: "12px 14px", borderRadius: 8, cursor: "pointer", textAlign: "left",
              border: `2px solid ${form.subType === exp.id ? "#2B7FD4" : "#1E3A56"}`,
              background: form.subType === exp.id ? "#1A3A5C" : "#0B1E33",
              fontFamily: "'DM Sans', sans-serif",
            }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: form.subType === exp.id ? "#F0F6FF" : "#7BAED4", marginBottom: 2 }}>{exp.label}</div>
              <div style={{ fontSize: 10, fontWeight: 700, color: exp.noteColor }}>{exp.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* 4. Title + description */}
      <div style={sectionStyle}>
        <h3 style={{ fontSize: 13, fontWeight: 700, color: "#7BAED4", margin: "0 0 14px", textTransform: "uppercase", letterSpacing: "0.8px" }}>4. Title & Description</h3>
        <div style={{ marginBottom: 14 }}>
          <label style={labelStyle}>Title *</label>
          <input value={form.title} onChange={e => handleField("title", e.target.value)}
            placeholder="e.g. Water Cycle Challenge — Easy" style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Description</label>
          <textarea value={form.description} onChange={e => handleField("description", e.target.value)}
            rows={2} style={{ ...inputStyle, resize: "vertical" }} />
        </div>
      </div>

      {/* 5. Questions — only for quiz */}
      {!isNonQuiz && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ ...sectionStyle, borderColor: "#1A4A6A" }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: "#2B7FD4", margin: "0 0 4px", textTransform: "uppercase", letterSpacing: "0.8px" }}>✨ Auto-Generate Questions</h3>
            <div style={{ display: "flex", gap: 12, alignItems: "flex-end", flexWrap: "wrap", marginTop: 12 }}>
              <div style={{ flex: 1, minWidth: 180 }}>
                <label style={labelStyle}>Trivia Category</label>
                <select value={triviaCategory} onChange={e => setTriviaCategory(Number(e.target.value))} style={inputStyle}>
                  {TRIVIA_CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                </select>
              </div>
              <button onClick={handleGenerate} disabled={generating} style={{
                padding: "10px 20px", background: generating ? "#1A3050" : "#1A4A6A",
                border: "1.5px solid #2B7FD4", borderRadius: 8, color: generating ? "#4A6A88" : "#7BCEF4",
                fontSize: 13, fontWeight: 700, fontFamily: "'DM Sans', sans-serif",
                cursor: generating ? "not-allowed" : "pointer", whiteSpace: "nowrap",
              }}>
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
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#7BAED4" }}>
              Questions ({questions.length} / {config.questionCount} recommended)
            </span>
            <button onClick={addBlankQuestion} style={{
              padding: "7px 16px", background: "#0F2840", border: "1.5px solid #1E3A56",
              borderRadius: 8, color: "#7BAED4", fontSize: 12, fontWeight: 600,
              cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
            }}>+ Add Question</button>
          </div>
          {questions.length === 0 && (
            <div style={{ background: "#0F2840", border: "1px dashed #1E3A56", borderRadius: 10, padding: 24, textAlign: "center", color: "#4A6A88", fontSize: 13 }}>
              No questions yet.
            </div>
          )}
          {questions.map((q, i) => (
            <QuestionEditor key={i} question={q} index={i}
              onChange={updated => updateQuestion(i, updated)}
              onDelete={() => deleteQuestion(i)} />
          ))}
        </div>
      )}

      {/* Non-quiz info box */}
      {isNonQuiz && (
        <div style={{ ...sectionStyle, borderColor: (GAME_TYPE_INFO[form.subType]?.color || "#1E3A56") + "55" }}>
          <p style={{ fontSize: 13, color: "#94A3B8", margin: 0 }}>
            {GAME_TYPE_INFO[form.subType]?.emoji}{" "}
            <strong style={{ color: "#F0F6FF" }}>{GAME_TYPE_INFO[form.subType]?.label}</strong> — auto-generates its own content. No questions needed.
          </p>
        </div>
      )}

      <div style={{ display: "flex", gap: 12 }}>
        <button onClick={handleSave} disabled={loading} style={{
          padding: "12px 32px", background: loading ? "#1A3050" : "#1D9E75",
          color: "#fff", fontSize: 14, fontWeight: 700,
          fontFamily: "'DM Sans', sans-serif", border: "none",
          borderRadius: 8, cursor: loading ? "not-allowed" : "pointer",
        }}>
          {loading ? "Saving..." : "💾 Save Changes"}
        </button>
        <button onClick={onCancel} style={{
          padding: "12px 24px", background: "transparent",
          border: "1px solid #1E3A56", borderRadius: 8, color: "#7BAED4",
          fontSize: 14, cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
        }}>Cancel</button>
      </div>
    </div>
  );
}


//  CREATE GAME FORM

function CreateGameForm({ token, onSuccess }) {
  const [step, setStep]       = useState(1);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg]         = useState("");
  const [form, setForm] = useState({
    topicId: "", topicName: "", ageGroup: "5-10",
    difficulty: "easy", subType: "quiz", title: "", description: "",
  });
  const [questions, setQuestions]           = useState([]);
  const [triviaCategory, setTriviaCategory] = useState(17);
  const [generating, setGenerating]         = useState(false);
  const [generateMsg, setGenerateMsg]       = useState("");

  const config    = DIFF_CONFIG[form.difficulty];
  const isNonQuiz = NON_QUIZ_TYPES.includes(form.subType);
  const diffColor = { easy: "#1D9E75", medium: "#EF9F27", hard: "#E05252" };

  const handleField = (key, value) => {
    if (key === "topicId") {
      const topic = MAIN_TOPICS.find(t => t.id === value);
      setForm(f => ({ ...f, topicId: value, topicName: topic?.name || "" }));
    } else {
      setForm(f => ({ ...f, [key]: value }));
    }
  };

  const addBlankQuestion = () =>
    setQuestions(q => [...q, { questionText: "", options: ["","","",""], correctAnswer: "", hint: "" }]);
  const updateQuestion = (i, updated) =>
    setQuestions(qs => qs.map((q, idx) => idx === i ? updated : q));
  const deleteQuestion = i =>
    setQuestions(qs => qs.filter((_, idx) => idx !== i));

  const handleGenerate = async () => {
    setGenerating(true); setGenerateMsg("");
    try {
      const url = `${API_BASE}/api/games/generate-questions?category=${triviaCategory}&difficulty=${form.difficulty}&amount=${config.questionCount}`;
      const res  = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (!res.ok) { setGenerateMsg("⚠️ " + (data.message || "Failed.")); return; }
      setQuestions(q => [...q, ...data.questions]);
      setGenerateMsg(`✅ ${data.questions.length} questions added.`);
    } catch { setGenerateMsg("❌ Could not reach the server."); }
    finally { setGenerating(false); }
  };

  const handleSaveNonQuiz = async () => {
    setMsg(""); setLoading(true);
    try {
      const payload = {
        ...form,
        lessonTopic: form.topicName,  
        topicName:   form.topicName,
        questions: [],
        timeLimit: config.timeLimit, pointsPerQuestion: config.pointsPerQuestion, passMark: 60,
        createdBy: localStorage.getItem("adminUsername") || "admin",
      };
      const res  = await fetch(`${API_BASE}/api/games`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) { setMsg("❌ " + (data.message || "Failed.")); return; }
      setMsg("✅ Game created successfully!");
      setStep(1);
      setForm({ topicId:"", topicName:"", ageGroup:"5-10", difficulty:"easy", subType:"quiz", title:"", description:"" });
      if (onSuccess) onSuccess();
    } catch { setMsg("❌ Could not connect to server."); }
    finally { setLoading(false); }
  };

  const handleSubmitQuiz = async () => {
    setMsg("");
    if (!form.topicId)          { setMsg("Select a topic."); return; }
    if (!form.title.trim())     { setMsg("Title is required."); return; }
    if (questions.length === 0) { setMsg("Add at least one question."); return; }
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.questionText.trim())               { setMsg(`Question ${i+1}: text is empty.`); return; }
      if (q.options.filter(Boolean).length < 4) { setMsg(`Question ${i+1}: fill in all 4 options.`); return; }
      if (!q.correctAnswer)                     { setMsg(`Question ${i+1}: select a correct answer.`); return; }
    }
    setLoading(true);
    try {
      const payload = {
        ...form,
        lessonTopic: form.topicName,
        topicName:   form.topicName,
        questions,
        timeLimit: config.timeLimit, pointsPerQuestion: config.pointsPerQuestion, passMark: 60,
        createdBy: localStorage.getItem("adminUsername") || "admin",
      };
      const res  = await fetch(`${API_BASE}/api/games`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) { setMsg("❌ " + (data.message || "Failed.")); return; }
      setMsg("✅ Game created successfully!");
      setStep(1);
      setForm({ topicId:"", topicName:"", ageGroup:"5-10", difficulty:"easy", subType:"quiz", title:"", description:"" });
      setQuestions([]);
      if (onSuccess) onSuccess();
    } catch { setMsg("❌ Could not connect to server."); }
    finally { setLoading(false); }
  };

  const badge = (label, color) => (
    <span style={{
      display: "inline-block", padding: "2px 10px", borderRadius: 20,
      background: color + "22", border: `1px solid ${color}`, color, fontSize: 11, fontWeight: 700,
    }}>{label}</span>
  );

  return (
    <div style={{ maxWidth: 680 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: "#F0F6FF", margin: 0 }}>Create New Game</h2>
        <div style={{ display: "flex", gap: 6 }}>
          {[1,2].map(s => (
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
        <span style={{ fontSize: 12, color: "#00070c" }}>
          {step === 1 ? "Basic Info" : isNonQuiz ? "Review & Save" : "Questions"}
        </span>
      </div>

      {msg && step === 1 && (
        <div style={{
          background: msg.startsWith("✅") ? "#0D2A1E" : "#2A1010",
          border: `1px solid ${msg.startsWith("✅") ? "#1D9E75" : "#5C2020"}`,
          borderRadius: 8, padding: "10px 14px", marginBottom: 16,
          fontSize: 13, color: msg.startsWith("✅") ? "#4AE0A0" : "#E07070",
        }}>{msg}</div>
      )}

      {step === 1 && (
        <>
          <div style={sectionStyle}>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: "#7BAED4", margin: "0 0 14px", textTransform: "uppercase", letterSpacing: "0.8px" }}>1. Select Main Topic *</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {MAIN_TOPICS.map(t => (
                <button key={t.id} onClick={() => handleField("topicId", t.id)} style={{
                  padding: "12px 16px", borderRadius: 8, cursor: "pointer",
                  border: `2px solid ${form.topicId === t.id ? "#2B7FD4" : "#1E3A56"}`,
                  background: form.topicId === t.id ? "#1A3A5C" : "#0B1E33",
                  color: form.topicId === t.id ? "#F0F6FF" : "#7BAED4",
                  fontSize: 13, fontWeight: form.topicId === t.id ? 600 : 400,
                  fontFamily: "'DM Sans', sans-serif", textAlign: "left",
                }}>{t.name}</button>
              ))}
            </div>
          </div>

          <div style={sectionStyle}>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: "#7BAED4", margin: "0 0 14px", textTransform: "uppercase", letterSpacing: "0.8px" }}>2. Age Group & Difficulty *</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
              <div>
                <label style={labelStyle}>Age Group</label>
                <div style={{ display: "flex", gap: 8 }}>
                  {["5-10","11-15"].map(ag => (
                    <button key={ag} onClick={() => handleField("ageGroup", ag)} style={{
                      flex: 1, padding: "10px", borderRadius: 8, cursor: "pointer",
                      border: `2px solid ${form.ageGroup === ag ? "#2B7FD4" : "#1E3A56"}`,
                      background: form.ageGroup === ag ? "#1A3A5C" : "#0B1E33",
                      color: form.ageGroup === ag ? "#F0F6FF" : "#7BAED4",
                      fontSize: 13, fontWeight: 600, fontFamily: "'DM Sans', sans-serif",
                    }}>{ag === "5-10" ? "🧒 5–10" : "👦 11–15"}</button>
                  ))}
                </div>
              </div>
              <div>
                <label style={labelStyle}>Difficulty</label>
                <div style={{ display: "flex", gap: 8 }}>
                  {["easy","medium","hard"].map(d => (
                    <button key={d} onClick={() => handleField("difficulty", d)} style={{
                      flex: 1, padding: "10px", borderRadius: 8, cursor: "pointer",
                      border: `2px solid ${form.difficulty === d ? diffColor[d] : "#1E3A56"}`,
                      background: form.difficulty === d ? diffColor[d] + "22" : "#0B1E33",
                      color: form.difficulty === d ? diffColor[d] : "#7BAED4",
                      fontSize: 12, fontWeight: 600, fontFamily: "'DM Sans', sans-serif", textTransform: "capitalize",
                    }}>{d}</button>
                  ))}
                </div>
              </div>
            </div>
            <div style={{ background: "#0B1E33", borderRadius: 8, padding: "12px 16px", display: "flex", gap: 20, flexWrap: "wrap" }}>
              <span style={{ fontSize: 12, color: "#4A6A88" }}>⏱ <strong style={{ color: "#F0F6FF" }}>{config.timeLimit}s</strong> per question</span>
              <span style={{ fontSize: 12, color: "#4A6A88" }}>🏆 <strong style={{ color: "#F0F6FF" }}>{config.pointsPerQuestion} pts</strong> per correct</span>
              <span style={{ fontSize: 12, color: "#4A6A88" }}>📝 <strong style={{ color: "#F0F6FF" }}>{config.questionCount}</strong> recommended</span>
            </div>
          </div>

          <div style={sectionStyle}>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: "#7BAED4", margin: "0 0 6px", textTransform: "uppercase", letterSpacing: "0.8px" }}>3. Game Experience</h3>
            <p style={{ fontSize: 12, color: "#4A6A88", margin: "0 0 14px" }}>Standard Quiz needs manual questions. All others auto-generate content.</p>
            {/* ── ADDED cleanordirty to the picker ── */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {[
                { id: "quiz",         label: "📝 Standard Quiz",       desc: "Ages 11–15",  note: "Manual questions required",       noteColor: "#EF9F27" },
                { id: "germcatcher",  label: "🦠 Germ Catcher",        desc: "Ages 5–10",   note: "Auto-content · No questions needed", noteColor: "#1D9E75" },
                { id: "waterdrop",    label: "💧 Water Drop Adventure", desc: "Ages 5–10",   note: "Auto-content · No questions needed", noteColor: "#1D9E75" },
                { id: "memory",       label: "🃏 Memory Match",         desc: "Ages 5–10",   note: "Auto-content · No questions needed", noteColor: "#1D9E75" },
                { id: "cleanordirty", label: "🫧 Clean or Dirty?",      desc: "Ages 5–10",   note: "Auto-content · No questions needed", noteColor: "#1D9E75" },
                { id: "cleandirtygame", label: "🚰 Clean water or Dirty water?",      desc: "Ages 11-15",   note: "Auto-content · No questions needed", noteColor: "#1D9E75" },
                
              ].map(exp => (
                <button key={exp.id} onClick={() => handleField("subType", exp.id)} style={{
                  padding: "12px 14px", borderRadius: 8, cursor: "pointer", textAlign: "left",
                  border: `2px solid ${form.subType === exp.id ? "#2B7FD4" : "#1E3A56"}`,
                  background: form.subType === exp.id ? "#1A3A5C" : "#0B1E33",
                  fontFamily: "'DM Sans', sans-serif",
                }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: form.subType === exp.id ? "#F0F6FF" : "#7BAED4", marginBottom: 2 }}>{exp.label}</div>
                  <div style={{ fontSize: 11, color: "#4A6A88", marginBottom: 4 }}>{exp.desc}</div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: exp.noteColor }}>{exp.note}</div>
                </button>
              ))}
            </div>
          </div>

          <div style={sectionStyle}>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: "#7BAED4", margin: "0 0 14px", textTransform: "uppercase", letterSpacing: "0.8px" }}>4. Game Title & Description</h3>
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Title *</label>
              <input value={form.title} onChange={e => handleField("title", e.target.value)}
                placeholder="e.g. Water Cycle Challenge — Easy" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Description</label>
              <textarea value={form.description} onChange={e => handleField("description", e.target.value)}
                rows={2} style={{ ...inputStyle, resize: "vertical" }} />
            </div>
          </div>

          <button onClick={() => {
            if (!form.topicId)      { setMsg("Select a topic."); return; }
            if (!form.title.trim()) { setMsg("Title is required."); return; }
            setMsg(""); setStep(2);
          }} style={{
            padding: "12px 32px", background: "#2B7FD4", color: "#fff",
            fontSize: 14, fontWeight: 700, fontFamily: "'DM Sans', sans-serif",
            border: "none", borderRadius: 8, cursor: "pointer",
          }}>
            {isNonQuiz ? "Next: Review & Save →" : "Next: Add Questions →"}
          </button>
        </>
      )}

      {step === 2 && isNonQuiz && (
        <NonQuizStep2 form={form} onBack={() => setStep(1)} onSave={handleSaveNonQuiz} loading={loading} msg={msg} />
      )}

      {step === 2 && !isNonQuiz && (
        <>
          {msg && (
            <div style={{
              background: msg.startsWith("✅") ? "#0D2A1E" : "#2A1010",
              border: `1px solid ${msg.startsWith("✅") ? "#1D9E75" : "#5C2020"}`,
              borderRadius: 8, padding: "10px 14px", marginBottom: 16,
              fontSize: 13, color: msg.startsWith("✅") ? "#4AE0A0" : "#E07070",
            }}>{msg}</div>
          )}
          <div style={{ ...sectionStyle, display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
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
          <div style={{ ...sectionStyle, borderColor: "#1A4A6A" }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: "#2B7FD4", margin: "0 0 4px", textTransform: "uppercase", letterSpacing: "0.8px" }}>✨ Auto-Generate Questions</h3>
            <div style={{ display: "flex", gap: 12, alignItems: "flex-end", flexWrap: "wrap", marginTop: 12 }}>
              <div style={{ flex: 1, minWidth: 180 }}>
                <label style={labelStyle}>Trivia Category</label>
                <select value={triviaCategory} onChange={e => setTriviaCategory(Number(e.target.value))} style={inputStyle}>
                  {TRIVIA_CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                </select>
              </div>
              <button onClick={handleGenerate} disabled={generating} style={{
                padding: "10px 20px", background: generating ? "#1A3050" : "#1A4A6A",
                border: "1.5px solid #2B7FD4", borderRadius: 8, color: generating ? "#4A6A88" : "#7BCEF4",
                fontSize: 13, fontWeight: 700, fontFamily: "'DM Sans', sans-serif",
                cursor: generating ? "not-allowed" : "pointer", whiteSpace: "nowrap",
              }}>{generating ? "Generating..." : `⚡ Generate ${config.questionCount} Questions`}</button>
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
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#7BAED4" }}>Questions ({questions.length} / {config.questionCount} recommended)</span>
              <button onClick={addBlankQuestion} style={{
                padding: "7px 16px", background: "#0F2840", border: "1.5px solid #1E3A56",
                borderRadius: 8, color: "#7BAED4", fontSize: 12, fontWeight: 600,
                cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
              }}>+ Add Question Manually</button>
            </div>
            {questions.length === 0 && (
              <div style={{ background: "#0F2840", border: "1px dashed #1E3A56", borderRadius: 10, padding: 24, textAlign: "center", color: "#4A6A88", fontSize: 13 }}>
                No questions yet. Use "Generate" above or "Add Question Manually".
              </div>
            )}
            {questions.map((q, i) => (
              <QuestionEditor key={i} question={q} index={i}
                onChange={updated => updateQuestion(i, updated)}
                onDelete={() => deleteQuestion(i)} />
            ))}
          </div>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <button onClick={handleSubmitQuiz} disabled={loading || questions.length === 0} style={{
              padding: "12px 32px", background: loading ? "#1A3050" : "#1D9E75",
              color: "#fff", fontSize: 14, fontWeight: 700, fontFamily: "'DM Sans', sans-serif",
              border: "none", borderRadius: 8, cursor: loading ? "not-allowed" : "pointer",
              opacity: questions.length === 0 ? 0.5 : 1,
            }}>{loading ? "Saving..." : "💾 Save Game"}</button>
            <span style={{ fontSize: 12, color: "#4A6A88" }}>{questions.length} question{questions.length !== 1 ? "s" : ""} ready</span>
          </div>
        </>
      )}
    </div>
  );
}


//  STAT CARD

function StatCard({ label, value, color }) {
  return (
    <div style={{ background: "#0F2840", border: "1px solid #1E3A56", borderRadius: 10, padding: "16px 20px", flex: 1 }}>
      <div style={{ fontSize: 12, color: "#4A6A88", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.8px" }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 700, color: color || "#F0F6FF" }}>{value}</div>
    </div>
  );
}


//  GAME CARD

function GameCard({ game, onDelete, onEdit }) {
  const diff = { easy: "#1D9E75", medium: "#EF9F27", hard: "#E05252" };
  // ── ADDED cleanordirty emoji 
  const subTypeEmoji = { quiz: "📝", germcatcher: "🦠", waterdrop: "💧", memory: "🃏", cleanordirty: "🫧" };
  return (
    <div style={{ background: "#0F2840", border: "1px solid #1E3A56", borderRadius: 10, padding: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: "#F0F6FF" }}>{game.title}</div>
        <span style={{
          fontSize: 11, padding: "2px 8px", borderRadius: 20, background: "#122136",
          color: diff[game.difficulty] || "#7BAED4", border: `1px solid ${diff[game.difficulty] || "#7BAED4"}`,
          textTransform: "capitalize",
        }}>{game.difficulty}</span>
      </div>
      <div style={{ fontSize: 12, color: "#4A6A88", marginBottom: 8 }}>{game.description || "No description"}</div>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 10 }}>
        <span style={{ fontSize: 11, color: "#7BAED4" }}>📚 {game.topicName || game.lessonTopic || "—"}</span>
        <span style={{ fontSize: 11, color: "#4A6A88" }}>• Age {game.ageGroup}</span>
        <span style={{ fontSize: 11, color: "#4A6A88" }}>• {subTypeEmoji[game.subType] || "🎮"} {game.subType || "quiz"}</span>
        {game.subType === "quiz" && <span style={{ fontSize: 11, color: "#4A6A88" }}>• {game.questions?.length || 0} questions</span>}
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        {onEdit && (
          <button onClick={() => onEdit(game)} style={{
            padding: "6px 14px", background: "transparent",
            border: "1px solid #2B7FD4", borderRadius: 6, color: "#2B7FD4",
            fontSize: 12, cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
          }}>✏️ Edit</button>
        )}
        {onDelete && (
          <button onClick={() => onDelete(game._id)} style={{
            padding: "6px 14px", background: "transparent",
            border: "1px solid #5C2020", borderRadius: 6, color: "#E07070",
            fontSize: 12, cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
          }}>Delete</button>
        )}
      </div>
    </div>
  );
}


//  ALL GAMES

function AllGames({ token, onEdit }) {
  const [games,   setGames]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter,  setFilter]  = useState({ topicId: "", ageGroup: "", difficulty: "", subType: "" });

  const fetchGames = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter.topicId)    params.set("topicId",    filter.topicId);
      if (filter.ageGroup)   params.set("ageGroup",   filter.ageGroup);
      if (filter.difficulty) params.set("difficulty", filter.difficulty);
      // removed &active=true from 
      const res  = await fetch(`${API_BASE}/api/games?${params}`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      let g = data.games || [];
      if (filter.subType) g = g.filter(x => (x.subType || "quiz") === filter.subType);
      setGames(g);
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
      <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
        <select value={filter.topicId} onChange={e => setFilter(f => ({ ...f, topicId: e.target.value }))} style={{ ...inputStyle, width: "auto", fontSize: 12 }}>
          <option value="">All Topics</option>
          {MAIN_TOPICS.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
        <select value={filter.ageGroup} onChange={e => setFilter(f => ({ ...f, ageGroup: e.target.value }))} style={{ ...inputStyle, width: "auto", fontSize: 12 }}>
          <option value="">All Ages</option>
          <option value="5-10">5–10</option>
          <option value="11-15">11–15</option>
        </select>
        <select value={filter.difficulty} onChange={e => setFilter(f => ({ ...f, difficulty: e.target.value }))} style={{ ...inputStyle, width: "auto", fontSize: 12 }}>
          <option value="">All Difficulties</option>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
        {/* ── ADDED cleanordirty filter option ── */}
        <select value={filter.subType} onChange={e => setFilter(f => ({ ...f, subType: e.target.value }))} style={{ ...inputStyle, width: "auto", fontSize: 12 }}>
          <option value="">All Game Types</option>
          <option value="quiz">📝 Quiz</option>
          <option value="germcatcher">🦠 Germ Catcher</option>
          <option value="waterdrop">💧 Water Drop</option>
          <option value="memory">🃏 Memory Match</option>
          <option value="cleanordirty">🫧 Clean or Dirty?</option>
        </select>
      </div>
      {loading
        ? <div style={{ color: "#4A6A88", fontSize: 14 }}>Loading games...</div>
        : games.length === 0
          ? <div style={{ color: "#4A6A88", fontSize: 13, padding: 20, textAlign: "center" }}>No games found.</div>
          : <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
              {games.map(g => <GameCard key={g._id} game={g} onDelete={handleDelete} onEdit={onEdit} />)}
            </div>
      }
    </div>
  );
}


//  DASHBOARD

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
        <p style={{ fontSize: 13, color: "#000000", marginTop: 4 }}>Here's a quick overview of your games.</p>
      </div>
      <div style={{ display: "flex", gap: 16, marginBottom: 28, flexWrap: "wrap" }}>
        <StatCard label="Total Games" value={total}  color="#2B7FD4" />
        <StatCard label="Easy"        value={easy}   color="#1D9E75" />
        <StatCard label="Medium"      value={medium} color="#EF9F27" />
        <StatCard label="Hard"        value={hard}   color="#E05252" />
      </div>
      <h3 style={{ fontSize: 14, fontWeight: 700, color: "#7BAED4", marginBottom: 14, textTransform: "uppercase", letterSpacing: "0.8px" }}>Recently Added</h3>
      {recent.length
        ? <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 14 }}>
            {recent.map(g => <GameCard key={g._id} game={g} />)}
          </div>
        : <div style={{ color: "#4A6A88", fontSize: 13 }}>No games yet. Create one!</div>
      }
    </div>
  );
}

function Activity({ token }) {
  const [data,           setData]          = useState(null);
  const [loading,        setLoading]       = useState(true);
  const [activitySearch, setActivitySearch] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const [stats, feed] = await Promise.all([
          fetch(`${API_BASE}/api/analytics/summary`,
            { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
          fetch(`${API_BASE}/api/analytics/recent-activity?limit=10`,
            { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
        ]);
        setData({ ...stats, recentActivity: feed.activity });
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    }
    load();
  }, []);


  if (loading) return <div style={{color:'#4A6A88',fontSize:14}}>Loading analytics...</div>;
if (!data)   return <div style={{color:'#E07070',fontSize:14}}>Could not load analytics.</div>;

return (
  <div>
    <h2 style={{fontSize:18,fontWeight:700,color:"#F0F6FF",marginBottom:20}}>📋 Recent Activity</h2>
    <div style={{display:"flex",gap:16,marginBottom:24,flexWrap:"wrap"}}>
      <StatCard label="Total Plays"    value={data.totalPlays}    color="#2B7FD4" />
      <StatCard label="Unique Players" value={data.uniquePlayers} color="#A855F7" />
      <StatCard label="Avg Score"      value={`${data.avgScore}%`} color="#1D9E75" />
      <StatCard label="Pass Rate"      value={`${data.passRate}%`} color="#EF9F27" />
    </div>

    <h3 style={{fontSize:13,fontWeight:700,color:"#7BAED4",marginBottom:12,textTransform:"uppercase",letterSpacing:"0.8px"}}>Top Games</h3>
    <div style={{background:"#0F2840",border:"1px solid #1E3A56",borderRadius:10,padding:16,marginBottom:20}}>
      {data.topGames?.length === 0
        ? <div style={{color:"#4A6A88",fontSize:13}}>No data yet.</div>
        : data.topGames?.map((g,i) => (
          <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:"1px solid #1E3A56"}}>
            <span style={{fontSize:13,color:"#F0F6FF"}}>{g.title}</span>
            <span style={{fontSize:12,color:"#7BAED4"}}>{g.plays} plays</span>
          </div>
        ))
      }
    </div>

<h3 style={{fontSize:13,fontWeight:700,color:"#7BAED4",marginBottom:12,textTransform:"uppercase",letterSpacing:"0.8px"}}>Recent Activity</h3>
    <input
      placeholder="🔍 Search by player, game, topic or difficulty..."
      onChange={e => setActivitySearch(e.target.value)}
      style={{...inputStyle, marginBottom:12}}
    />
    <div style={{background:"#0F2840",border:"1px solid #1E3A56",borderRadius:10,padding:16, maxHeight:400, overflowY:"auto"}}>
      {data.recentActivity?.filter(a =>
        [a.userId, a.gameTitle, a.topicId, a.difficulty]
          .join(" ").toLowerCase()
          .includes(activitySearch.toLowerCase())
      ).length === 0
        ? <div style={{color:"#4A6A88",fontSize:13}}>No results found.</div>
        : data.recentActivity?.filter(a =>
            [a.userId, a.gameTitle, a.topicId, a.difficulty]
              .join(" ").toLowerCase()
              .includes(activitySearch.toLowerCase())
          ).map((a,i) => (
          <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:"1px solid #1E3A56"}}>
            <div>
              <div style={{fontSize:13,color:"#F0F6FF"}}>{a.gameTitle}</div>
              <div style={{fontSize:11,color:"#4A6A88"}}>{a.userId} · {a.difficulty} · {a.topicId}</div>
            </div>
            <span style={{
              fontSize:11,padding:"2px 8px",borderRadius:20,
              background: a.passed ? "#0D2A1E" : "#2A1010",
              color: a.passed ? "#4AE0A0" : "#E07070",
              border: `1px solid ${a.passed ? "#1D9E75" : "#5C2020"}`,
            }}>{a.percentage}% · {a.passed ? "Pass" : "Fail"}</span>
          </div>))
      }
    </div>
  </div>
);
}

//  ROOT

export default function GameAdminDashboard() {
  const [active,      setActive]      = useState("dashboard");
  const [games,       setGames]       = useState([]);
  const [editingGame, setEditingGame] = useState(null);
  const navigate = useNavigate();

  const token    = localStorage.getItem("superAdminToken");
  const username = localStorage.getItem("adminUsername") || "Game Admin";

  useEffect(() => {
    const roles = JSON.parse(localStorage.getItem("adminRoles") || "[]");
    if (!roles.includes("Game_ADMIN") && !roles.includes("SUPER_ADMIN")) navigate("/admin-login");
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
  ["superAdminToken","adminRoles","adminUsername"].forEach(k => localStorage.removeItem(k));
  navigate("/");
};
  const handleEditGame = (game) => {
    setEditingGame(game);
    setActive("edit");
  };

  const renderContent = () => {
    if (active === "edit" && editingGame) {
      return (
        <EditGameForm
          game={editingGame}
          token={token}
          onSuccess={() => { fetchGames(); setEditingGame(null); setActive("games"); }}
          onCancel={() => { setEditingGame(null); setActive("games"); }}
        />
      );
    }
    switch (active) {
      case "dashboard": return <Dashboard username={username} games={games} />;
      case "games":     return <AllGames token={token} onEdit={handleEditGame} />;
      case "create":    return <CreateGameForm token={token} onSuccess={() => { fetchGames(); setActive("games"); }} />;
      case "activity":  return <Activity token={token} />;
      default:          return null;
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#b8b8b9", fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');`}</style>
      <Sidebar active={active} setActive={(key) => { setEditingGame(null); setActive(key); }} username={username} onLogout={handleLogout} />
      <main style={{ flex: 1, padding: "32px 36px", overflowY: "auto", display: "flex", justifyContent: "center" }}>
  <div style={{ width: "100%", maxWidth: 720 }}>
    {renderContent()}
  </div>
</main>
    </div>
  );
}