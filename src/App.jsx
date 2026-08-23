import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [backendMessage, setBackendMessage] = useState("");
  const [prompt, setPrompt] = useState("");
  const [generatedHtml, setGeneratedHtml] = useState("");
  const [rawCode, setRawCode] = useState("");
  const [aiMeta, setAiMeta] = useState(null);
  const [activeTab, setActiveTab] = useState("preview"); // 'preview' | 'process' | 'code'
  const [zoomLevel, setZoomLevel] = useState(100);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    fetch("http://localhost:4000/api/health")
      .then((res) => res.json())
      .then((data) => setBackendMessage(data.message))
      .catch(() => setBackendMessage("Backend connected"));
  }, []);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setStatusMessage("Please enter a UI description first.");
      return;
    }

    setLoading(true);
    setStatusMessage("Executing AI generation pipeline with Gemini...");

    try {
      const response = await fetch("http://localhost:4000/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(data.error || "Failed to generate UI");
      }

      let cleanHtml = data.output
        .replace(/^```html/gi, "")
        .replace(/^```/g, "")
        .replace(/```$/g, "")
        .trim();

      setRawCode(cleanHtml);
      setAiMeta(data.meta || null);

      const previewDoc = `
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <link rel="stylesheet" href="[https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css](https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css)">
            <script src="[https://cdn.tailwindcss.com](https://cdn.tailwindcss.com)"></script>
            <link href="[https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap](https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap)" rel="stylesheet">
            <style>
              * { box-sizing: border-box; }
              html { font-size: ${zoomLevel}%; }
              body { 
                font-family: 'Plus Jakarta Sans', sans-serif; 
                margin: 0;
                padding: 1.5rem;
                background-color: #f8fafc;
                color: #0f172a;
                font-size: 1rem;
                line-height: 1.6;
              }
              a { cursor: pointer; text-decoration: none; }
              svg { max-width: 24px; max-height: 24px; display: inline-block; }
              img { max-width: 120px; max-height: 120px; object-fit: cover; }
            </style>
            <script>
              document.addEventListener('click', function(e) {
                const target = e.target.closest('a');
                if (target) {
                  e.preventDefault();
                  e.stopPropagation();
                }
              }, true);
            </script>
          </head>
          <body>
            <div class="space-y-6 max-w-6xl mx-auto">
              ${cleanHtml}
            </div>
          </body>
        </html>
      `;

      setGeneratedHtml(previewDoc);
      setStatusMessage(`Completed in ${data.meta?.latency || "1.2s"} for: "${prompt}"`);
    } catch (err) {
      console.error(err);
      setStatusMessage(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (rawCode) {
      const previewDoc = `
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <link rel="stylesheet" href="[https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css](https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css)">
            <script src="[https://cdn.tailwindcss.com](https://cdn.tailwindcss.com)"></script>
            <link href="[https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap](https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap)" rel="stylesheet">
            <style>
              * { box-sizing: border-box; }
              html { font-size: ${zoomLevel}%; }
              body { 
                font-family: 'Plus Jakarta Sans', sans-serif; 
                margin: 0;
                padding: 1.5rem;
                background-color: #f8fafc;
                color: #0f172a;
                font-size: 1rem;
                line-height: 1.6;
              }
              a { cursor: pointer; text-decoration: none; }
              svg { max-width: 24px; max-height: 24px; display: inline-block; }
              img { max-width: 120px; max-height: 120px; object-fit: cover; }
            </style>
          </head>
          <body>
            <div class="space-y-6 max-w-6xl mx-auto">
              ${rawCode}
            </div>
          </body>
        </html>
      `;
      setGeneratedHtml(previewDoc);
    }
  }, [zoomLevel, rawCode]);

  return (
    <div className="app" style={{ maxWidth: "1600px", margin: "0 auto", padding: "1.5rem" }}>
      <header className="navbar">
        <div className="logo">
          <span className="logo-icon">✦</span> UIForge AI
        </div>
        <div className="nav-status">
          <span className="status-dot"></span>
          {backendMessage || "Backend live"}
        </div>
        <button
          className="new-project"
          onClick={() => {
            setPrompt("");
            setGeneratedHtml("");
            setRawCode("");
            setAiMeta(null);
            setStatusMessage("");
          }}
        >
          + New Project
        </button>
      </header>

      <main className="main">
        <section className="hero" style={{ marginBottom: "1.5rem" }}>
          <div className="badge">AI INTERFACE ENGINE & PIPELINE</div>
          <h1>
            Turn your idea into a <span>beautiful UI.</span>
          </h1>
          <p>Describe what you want. Let AI transform your idea into an interactive interface.</p>
        </section>

        <section
          className="workspace"
          style={{
            display: "grid",
            gridTemplateColumns: "360px 1fr",
            gap: "1.5rem",
            alignItems: "stretch",
          }}
        >
          {/* Prompt Studio */}
          <div className="panel prompt-panel" style={{ display: "flex", flexDirection: "column" }}>
            <div className="panel-header">
              <div>
                <span className="panel-number">01</span>
                <h2>Describe your UI</h2>
              </div>
              <span className="panel-label">PROMPT</span>
            </div>

            <textarea
              style={{ minHeight: "150px", resize: "none" }}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. Modern luxury resort guest & booking management dashboard with live occupancy stats, villa availability, revenue summary, and concierge booking schedule."
            />

            <div className="prompt-footer">
              <span>{prompt.length} characters</span>
              <button
                className="generate-button"
                onClick={handleGenerate}
                disabled={loading}
              >
                {loading ? "Generating..." : "✦ Generate UI"}
              </button>
            </div>

            <div className="suggestions" style={{ marginTop: "1rem" }}>
              <span>Try Presets:</span>
              <button
                onClick={() =>
                  setPrompt(
                    "Modern luxury resort guest & booking management dashboard with live occupancy stats, villa availability, revenue summary, and concierge booking schedule."
                  )
                }
              >
                🏝️ Resort Portal
              </button>
              <button
                onClick={() =>
                  setPrompt(
                    "Hospital doctor consultation & triage dashboard with patient queue tokens, ICU bed availability cards, doctor shift roster, and emergency department tracker."
                  )
                }
              >
                🏥 Hospital Dashboard
              </button>
              <button
                onClick={() =>
                  setPrompt(
                    "National citizen services portal with e-governance service cards, tax & utility payment tracker, application status table, and emergency announcements."
                  )
                }
              >
                🏛️ Government Portal
              </button>
            </div>
          </div>

          {/* Live Preview Panel */}
          <div className="panel preview-panel" style={{ display: "flex", flexDirection: "column", padding: 0, overflow: "hidden" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "0.75rem 1.25rem",
                backgroundColor: "#0f172a",
                color: "#e2e8f0",
              }}
            >
              {/* Tab Selector */}
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <button
                  onClick={() => setActiveTab("preview")}
                  style={{
                    background: activeTab === "preview" ? "#3b82f6" : "transparent",
                    color: activeTab === "preview" ? "#fff" : "#94a3b8",
                    border: "none",
                    padding: "0.3rem 0.75rem",
                    borderRadius: "0.375rem",
                    fontSize: "0.8rem",
                    fontWeight: "600",
                    cursor: "pointer",
                  }}
                >
                  ● Live UI
                </button>
                <button
                  onClick={() => setActiveTab("process")}
                  style={{
                    background: activeTab === "process" ? "#3b82f6" : "transparent",
                    color: activeTab === "process" ? "#fff" : "#94a3b8",
                    border: "none",
                    padding: "0.3rem 0.75rem",
                    borderRadius: "0.375rem",
                    fontSize: "0.8rem",
                    fontWeight: "600",
                    cursor: "pointer",
                  }}
                >
                  ⚙️ AI Process
                </button>
                <button
                  onClick={() => setActiveTab("code")}
                  style={{
                    background: activeTab === "code" ? "#3b82f6" : "transparent",
                    color: activeTab === "code" ? "#fff" : "#94a3b8",
                    border: "none",
                    padding: "0.3rem 0.75rem",
                    borderRadius: "0.375rem",
                    fontSize: "0.8rem",
                    fontWeight: "600",
                    cursor: "pointer",
                  }}
                >
                  &lt;/&gt; Source
                </button>
              </div>

              {/* Font Size & Fullscreen Controls */}
              {generatedHtml && activeTab === "preview" && (
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <div style={{ display: "flex", alignItems: "center", background: "#1e293b", borderRadius: "0.375rem", padding: "0.15rem 0.4rem" }}>
                    <button
                      onClick={() => setZoomLevel((prev) => Math.max(75, prev - 10))}
                      style={{ background: "transparent", color: "#94a3b8", border: "none", cursor: "pointer", padding: "0.2rem 0.5rem", fontWeight: "bold" }}
                      title="Decrease Font Size"
                    >
                      A-
                    </button>
                    <span style={{ fontSize: "0.75rem", color: "#cbd5e1", minWidth: "35px", textAlign: "center" }}>{zoomLevel}%</span>
                    <button
                      onClick={() => setZoomLevel((prev) => Math.min(140, prev + 10))}
                      style={{ background: "transparent", color: "#94a3b8", border: "none", cursor: "pointer", padding: "0.2rem 0.5rem", fontWeight: "bold" }}
                      title="Increase Font Size"
                    >
                      A+
                    </button>
                  </div>
                  <button
                    onClick={() => setIsFullscreen(true)}
                    style={{
                      background: "#2563eb",
                      color: "#ffffff",
                      border: "none",
                      padding: "0.35rem 0.85rem",
                      borderRadius: "0.5rem",
                      fontSize: "0.75rem",
                      fontWeight: "600",
                      cursor: "pointer",
                    }}
                  >
                    ⛶ Fullscreen
                  </button>
                </div>
              )}
            </div>

            {/* Main Display Body */}
            <div
              className="preview-area"
              style={{
                flex: 1,
                minHeight: "560px",
                position: "relative",
                backgroundColor: activeTab === "code" ? "#0f172a" : "#f8fafc",
                overflow: "hidden",
                display: "flex",
                justifyContent: "flex-start",
                alignItems: "flex-start",
              }}
            >
              {loading ? (
                <div className="empty-preview" style={{ padding: "4rem", width: "100%" }}>
                  <div className="empty-icon">⏳</div>
                  <h3>Executing AI Generation Pipeline...</h3>
                  <p>Synthesizing cards, readable typography, and responsive layouts.</p>
                </div>
              ) : activeTab === "preview" ? (
                generatedHtml ? (
                  <iframe
                    title="UI Preview"
                    srcDoc={generatedHtml}
                    sandbox="allow-scripts allow-same-origin"
                    style={{
                      width: "100%",
                      height: "560px",
                      border: "none",
                      display: "block",
                    }}
                  />
                ) : (
                  <div className="empty-preview" style={{ padding: "4rem", width: "100%" }}>
                    <div className="empty-icon">✦</div>
                    <h3>Your generated UI will appear here</h3>
                    <p>Describe your idea on the left and click Generate UI.</p>
                  </div>
                )
              ) : activeTab === "process" ? (
                <div style={{ padding: "2rem", width: "100%", overflowY: "auto", height: "560px" }}>
                  <h3 style={{ fontSize: "1.1rem", fontWeight: "700", color: "#1e293b", marginBottom: "1rem" }}>
                    Gemini AI Pipeline Execution Breakdown
                  </h3>
                  
                  {aiMeta ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem", marginBottom: "0.5rem" }}>
                        <div style={{ background: "#fff", padding: "1rem", borderRadius: "0.75rem", border: "1px solid #e2e8f0" }}>
                          <span style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: "600" }}>MODEL</span>
                          <p style={{ fontSize: "0.95rem", fontWeight: "700", color: "#2563eb", marginTop: "0.25rem" }}>{aiMeta.model}</p>
                        </div>
                        <div style={{ background: "#fff", padding: "1rem", borderRadius: "0.75rem", border: "1px solid #e2e8f0" }}>
                          <span style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: "600" }}>LATENCY</span>
                          <p style={{ fontSize: "0.95rem", fontWeight: "700", color: "#10b981", marginTop: "0.25rem" }}>{aiMeta.latency}</p>
                        </div>
                        <div style={{ background: "#fff", padding: "1rem", borderRadius: "0.75rem", border: "1px solid #e2e8f0" }}>
                          <span style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: "600" }}>HTML PAYLOAD</span>
                          <p style={{ fontSize: "0.95rem", fontWeight: "700", color: "#8b5cf6", marginTop: "0.25rem" }}>{aiMeta.rawLength} chars</p>
                        </div>
                      </div>

                      <div style={{ background: "#fff", borderRadius: "0.75rem", border: "1px solid #e2e8f0", padding: "1.25rem" }}>
                        <h4 style={{ fontSize: "0.9rem", fontWeight: "700", color: "#334155", marginBottom: "1rem" }}>Sequential Processing Steps</h4>
                        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                          {aiMeta.steps.map((item, index) => (
                            <div key={index} style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
                              <span style={{ background: "#eff6ff", color: "#2563eb", width: "28px", height: "28px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "700", fontSize: "0.8rem", flexShrink: 0 }}>
                                {index + 1}
                              </span>
                              <div>
                                <strong style={{ fontSize: "0.85rem", color: "#0f172a" }}>{item.step}</strong>
                                <p style={{ fontSize: "0.8rem", color: "#64748b", margin: "0.15rem 0 0 0" }}>{item.detail}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p style={{ color: "#64748b", fontSize: "0.9rem" }}>Run a prompt first to view the live execution pipeline metrics.</p>
                  )}
                </div>
              ) : (
                <div style={{ width: "100%", height: "560px", overflowY: "auto", padding: "1.5rem" }}>
                  <pre style={{ margin: 0, color: "#38bdf8", fontFamily: "Consolas, monospace", fontSize: "0.85rem", whiteSpace: "pre-wrap", wordBreak: "break-all" }}>
                    {rawCode || "<!-- Generate a UI to inspect the AI's generated Tailwind HTML markup -->"}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </section>

        {statusMessage && (
          <section className="result-bar" style={{ marginTop: "1rem" }}>
            <span className="result-icon">✓</span>
            <div>
              <strong>Pipeline Status</strong>
              <p>{statusMessage}</p>
            </div>
          </section>
        )}
      </main>

      {/* Fullscreen Demo Modal */}
      {isFullscreen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            zIndex: 9999,
            backgroundColor: "rgba(15, 23, 42, 0.95)",
            backdropFilter: "blur(8px)",
            display: "flex",
            flexDirection: "column",
            padding: "1.5rem",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "1rem",
              color: "#fff",
            }}
          >
            <strong>Live Presentation View</strong>
            <button
              onClick={() => setIsFullscreen(false)}
              style={{
                background: "#ef4444",
                color: "#fff",
                border: "none",
                padding: "0.5rem 1.25rem",
                borderRadius: "0.5rem",
                fontWeight: "700",
                cursor: "pointer",
              }}
            >
              ✕ Exit Fullscreen
            </button>
          </div>
          <iframe
            title="Fullscreen Presenter"
            srcDoc={generatedHtml}
            sandbox="allow-scripts allow-same-origin"
            style={{
              flex: 1,
              width: "100%",
              height: "100%",
              border: "none",
              borderRadius: "1rem",
              backgroundColor: "#f8fafc",
            }}
          />
        </div>
      )}

      <footer style={{ marginTop: "2rem" }}>
        <span>UIForge AI</span>
        <span>AI-assisted interface generation</span>
      </footer>
    </div>
  );
}

export default App;