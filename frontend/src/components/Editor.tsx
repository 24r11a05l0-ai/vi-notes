import React, { useEffect, useRef, useState } from "react";
import "./Editor.css";

// 🔹 Types (cleaner than any[])
type Keystroke = {
  key: string;
  timestamp: number;
};

type PasteEvent = {
  length: number;
  timestamp: number;
};

type Session = {
  startTime: number;
  endTime?: number;
  text: string;
  keystrokes: Keystroke[];
  pasteEvents: PasteEvent[];
};

export default function Editor() {
  const [text, setText] = useState("");
  const [alerts, setAlerts] = useState<string[]>([]);
  const [stats, setStats] = useState({
    keystrokes: 0,
    pastes: 0
  });

  // 🔹 Session Storage (no re-renders)
  const sessionRef = useRef<Session>({
    startTime: performance.now(),
    text: "",
    keystrokes: [],
    pasteEvents: []
  });

  const lastLengthRef = useRef(0);

  // 🔹 Add Alert (limit to 5)
  const addAlert = (msg: string) => {
    setAlerts(prev => [msg, ...prev].slice(0, 5));
  };

  // 🔹 Key Tracking
  const handleKeyDown = (e: KeyboardEvent) => {
    if (["Shift", "Control", "Alt"].includes(e.key)) return;

    sessionRef.current.keystrokes.push({
      key: e.key,
      timestamp: performance.now()
    });

    setStats(prev => ({
      ...prev,
      keystrokes: prev.keystrokes + 1
    }));
  };

  // 🔹 Paste Detection
  const handlePaste = (e: ClipboardEvent) => {
    const pastedText = e.clipboardData?.getData("text") || "";

    sessionRef.current.pasteEvents.push({
      length: pastedText.length,
      timestamp: performance.now()
    });

    setStats(prev => ({
      ...prev,
      pastes: prev.pastes + 1
    }));

    addAlert(`📋 Paste detected (${pastedText.length} chars)`);
  };

  // 🔹 Text Change
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    const diff = newText.length - lastLengthRef.current;

    sessionRef.current.text = newText;
    setText(newText);

    // ⚠️ Spike Detection
    if (diff > 20) {
      addAlert("⚠️ Sudden text spike (possible paste)");
    }

    // 🚨 Mismatch Detection
    if (newText.length > sessionRef.current.keystrokes.length + 10) {
      addAlert("🚨 Text without typing detected");
    }

    lastLengthRef.current = newText.length;
  };

  // 💾 Save Session (Download + Optional Backend)
  const saveSession = async () => {
    const session: Session = {
      ...sessionRef.current,
      endTime: performance.now()
    };

    // ✅ OPTION 1: Download JSON (always works)
    const blob = new Blob([JSON.stringify(session, null, 2)], {
      type: "application/json"
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "session.json";
    a.click();

    // ✅ OPTION 2: Send to Backend (optional)
    try {
      await fetch("http://localhost:5000/save-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(session)
      });

      addAlert("✅ Session saved successfully");
    } catch (err) {
      addAlert("⚠️ Backend not connected (local save only)");
    }
  };

  // 🔹 Attach Keyboard Listener
  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <div className="container">
      <div className="card">
        {/* Header */}
        <div className="title">🧠 Vi-Notes</div>
        <div className="status">● Live Monitoring Active</div>

        {/* Text Editor */}
        <textarea
          className="textarea"
          value={text}
          onChange={handleChange}
          onPaste={(e) => handlePaste(e.nativeEvent)}
          placeholder="Start typing here..."
        />

        {/* Stats */}
        <div className="stats">
          <div className="stat-box">⌨️ {stats.keystrokes} Keys</div>
          <div className="stat-box">📋 {stats.pastes} Pastes</div>
          <div className="stat-box">📝 {text.length} Chars</div>
        </div>

        {/* Alerts */}
        <div className="alerts">
          {alerts.length === 0 ? (
            <p style={{ color: "#22c55e" }}>No issues detected</p>
          ) : (
            alerts.map((a, i) => (
              <div key={i} className="alert">
                {a}
              </div>
            ))
          )}
        </div>

        {/* Button */}
        <button className="button" onClick={saveSession}>
           Save Session Report
        </button>
      </div>
    </div>
  );
}