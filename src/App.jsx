import React, { useState } from 'react';

const PRESETS = [
  {
    label: '🌴 Resort Portal',
    prompt: 'Luxury tropical resort booking portal with high-res suite showcase, occupancy statistics, guest rating analytics, and concierge amenities grid.'
  },
  {
    label: '🏥 Hospital Dashboard',
    prompt: 'Apollo emergency hospital clinical care dashboard with live ICU bed availability, admitted patient triage metrics, and real-time medical staff directory.'
  },
  {
    label: '🏛️ Government Portal',
    prompt: 'National citizen civic services portal with e-governance service cards, grievance tracking speed, digital verification table, and emergency announcements.'
  }
];

export default function App() {
  const [prompt, setPrompt] = useState(PRESETS[0].prompt);
  const [loading, setLoading] = useState(false);
  const [generatedHtml, setGeneratedHtml] = useState('');
  const [meta, setMeta] = useState(null);
  const [activeTab, setActiveTab] = useState('preview');
  const [copied, setCopied] = useState(false);

  const handleGenerate = async (selectedPrompt) => {
    const activeText = selectedPrompt || prompt;
    if (!activeText.trim()) return;

    setLoading(true);
    try {
      const response = await fetch('http://localhost:4000/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: activeText })
      });

      const data = await response.json();
      if (data.output) {
        setGeneratedHtml(data.output);
        setMeta(data.meta || null);
      }
    } catch (err) {
      console.error('Generation failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedHtml);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const iframeDoc = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
        <style>
          * { box-sizing: border-box; }
          body {
            font-family: 'Plus Jakarta Sans', sans-serif;
            margin: 0;
            padding: 0;
            background-color: #090d16;
            color: #f1f5f9;
          }
        </style>
      </head>
      <body>
        ${generatedHtml || `
          <div style="min-height: 480px; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #64748b; font-family: sans-serif; text-align: center; padding: 20px;">
            <div style="width: 50px; height: 50px; border-radius: 16px; background: #1e293b; color: #818cf8; display: flex; align-items: center; justify-content: center; font-size: 24px; margin-bottom: 12px; border: 1px solid #334155;">✦</div>
            <h3 style="color: #e2e8f0; margin: 0 0 6px 0; font-size: 16px; font-weight: 700;">No UI Generated Yet</h3>
            <p style="font-size: 13px; max-width: 380px; margin: 0; line-height: 1.5;">Select a preset on the left or enter a prompt, then click "✦ Generate UI" to render the full dashboard.</p>
          </div>
        `}
      </body>
    </html>
  `;

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
        body { background: #090d16; color: #f8fafc; }
        .app-layout { min-height: 100vh; display: flex; flex-direction: column; background: #070a13; }
        .app-nav { background: #0f172a; border-bottom: 1px solid #1e293b; padding: 14px 28px; display: flex; align-items: center; justify-content: space-between; }
        .brand-box { display: flex; align-items: center; gap: 12px; }
        .brand-logo { width: 36px; height: 36px; border-radius: 10px; background: linear-gradient(135deg, #6366f1, #8b5cf6); display: flex; align-items: center; justify-content: center; color: white; font-weight: 900; font-size: 18px; }
        .brand-title { font-size: 16px; font-weight: 800; color: #ffffff; letter-spacing: 0.5px; }
        .badge-version { font-size: 10px; font-weight: 700; background: rgba(99, 102, 241, 0.15); color: #818cf8; border: 1px solid rgba(99, 102, 241, 0.3); padding: 2px 8px; border-radius: 20px; margin-left: 6px; }
        .brand-sub { font-size: 11px; color: #94a3b8; margin-top: 2px; }
        .status-pill { display: flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 600; color: #34d399; background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.25); padding: 4px 12px; border-radius: 20px; }
        .dot { width: 7px; height: 7px; border-radius: 50%; background: #34d399; }
        
        .main-grid { max-width: 1350px; width: 100%; margin: 0 auto; padding: 24px; display: grid; grid-template-columns: 420px 1fr; gap: 24px; flex: 1; }
        @media (max-width: 960px) { .main-grid { grid-template-columns: 1fr; } }
        
        .sidebar { display: flex; flex-direction: column; gap: 20px; }
        .card { background: #0f172a; border: 1px solid #1e293b; border-radius: 20px; padding: 20px; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.4); }
        .field-label { font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.8px; color: #94a3b8; display: block; margin-bottom: 8px; }
        .textarea-input { width: 100%; background: #070a13; border: 1px solid #334155; border-radius: 12px; padding: 12px; font-size: 13px; color: #f1f5f9; outline: none; resize: none; line-height: 1.5; }
        .textarea-input:focus { border-color: #6366f1; }
        
        .presets-wrap { margin-top: 14px; }
        .presets-title { font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; margin-bottom: 8px; display: block; }
        .presets-btns { display: flex; flex-wrap: wrap; gap: 8px; }
        .btn-preset { background: #1e293b; border: 1px solid #334155; color: #cbd5e1; font-size: 12px; font-weight: 600; padding: 6px 12px; border-radius: 10px; cursor: pointer; transition: all 0.2s; }
        .btn-preset:hover { background: rgba(99, 102, 241, 0.2); border-color: #6366f1; color: #a5b4fc; }
        
        .btn-generate { width: 100%; margin-top: 18px; padding: 14px; background: #6366f1; color: white; border: none; border-radius: 12px; font-size: 14px; font-weight: 800; cursor: pointer; transition: all 0.2s; box-shadow: 0 4px 14px rgba(99, 102, 241, 0.35); }
        .btn-generate:hover { background: #4f46e5; }
        .btn-generate:disabled { opacity: 0.7; cursor: not-allowed; }
        
        .telemetry-head { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #1e293b; padding-bottom: 12px; margin-bottom: 14px; }
        .telemetry-title { font-size: 12px; font-weight: 800; text-transform: uppercase; color: #e2e8f0; letter-spacing: 0.5px; }
        .telemetry-latency { font-family: monospace; font-size: 11px; color: #34d399; background: rgba(16, 185, 129, 0.1); padding: 2px 8px; border-radius: 6px; border: 1px solid rgba(16, 185, 129, 0.2); }
        
        .steps-list { display: flex; flex-direction: column; gap: 12px; }
        .step-item { display: flex; gap: 10px; align-items: flex-start; }
        .step-index { width: 20px; height: 20px; border-radius: 50%; background: rgba(99, 102, 241, 0.2); color: #818cf8; font-size: 11px; font-weight: 800; display: flex; align-items: center; justify-content: center; flex-shrink: 0; border: 1px solid rgba(99, 102, 241, 0.3); }
        .step-name { font-size: 12px; font-weight: 700; color: #f1f5f9; }
        .step-desc { font-size: 11px; color: #64748b; margin-top: 2px; line-height: 1.3; }
        
        .preview-pane { display: flex; flex-direction: column; gap: 10px; }
        .preview-bar { background: #0f172a; border: 1px solid #1e293b; border-radius: 14px; padding: 6px 12px; display: flex; justify-content: space-between; align-items: center; }
        .tab-controls { display: flex; gap: 6px; }
        .tab-button { background: transparent; border: none; color: #94a3b8; font-size: 12px; font-weight: 700; padding: 6px 12px; border-radius: 8px; cursor: pointer; transition: all 0.2s; }
        .tab-button.active { background: #6366f1; color: white; }
        .btn-copy { background: #1e293b; border: 1px solid #334155; color: #e2e8f0; font-size: 11px; font-weight: 700; padding: 5px 10px; border-radius: 8px; cursor: pointer; }
        
        .viewport-box { flex: 1; min-height: 640px; background: #090d16; border: 1px solid #1e293b; border-radius: 20px; overflow: hidden; }
        .viewport-iframe { width: 100%; height: 100%; min-height: 640px; border: none; display: block; }
        .code-container { padding: 16px; background: #05070d; height: 100%; min-height: 640px; overflow: auto; font-family: monospace; font-size: 12px; color: #a5b4fc; line-height: 1.6; }
      `}</style>

      <div className="app-layout">
        {/* Top Header */}
        <header className="app-nav">
          <div className="brand-box">
            <div className="brand-logo">✦</div>
            <div>
              <div className="brand-title">
                NEXUS UI FORGE <span className="badge-version">v2.5 Pro</span>
              </div>
              <div className="brand-sub">Autonomous Full-Stack Component Synthesizer</div>
            </div>
          </div>
          <div className="status-pill">
            <div className="dot"></div> Engine Active
          </div>
        </header>

        {/* Workspace */}
        <main className="main-grid">
          {/* Left Controls */}
          <aside className="sidebar">
            <div className="card">
              <label className="field-label">Design Specification Prompt</label>
              <textarea
                className="textarea-input"
                rows={4}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe what UI layout you want to create..."
              />

              <div className="presets-wrap">
                <span className="presets-title">Try Presets:</span>
                <div className="presets-btns">
                  {PRESETS.map((item, idx) => (
                    <button
                      key={idx}
                      className="btn-preset"
                      onClick={() => {
                        setPrompt(item.prompt);
                        handleGenerate(item.prompt);
                      }}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                className="btn-generate"
                onClick={() => handleGenerate()}
                disabled={loading}
              >
                {loading ? 'Synthesizing Components...' : '✦ Generate UI'}
              </button>
            </div>

            {/* Pipeline Step Log */}
            <div className="card">
              <div className="telemetry-head">
                <span className="telemetry-title">Pipeline Telemetry</span>
                <span className="telemetry-latency">{meta ? meta.latency : '0.38s'}</span>
              </div>

              <div className="steps-list">
                {(meta?.steps || [
                  { step: "Token Parsing", detail: "Analyzed design constraints and structural layout." },
                  { step: "Visual Composition", detail: "Synthesized Tailwind dark-mode glassmorphic theme." },
                  { step: "Asset Integration", detail: "Loaded optimized Unsplash photography and KPI charts." }
                ]).map((s, index) => (
                  <div key={index} className="step-item">
                    <div className="step-index">{index + 1}</div>
                    <div>
                      <div className="step-name">{s.step}</div>
                      <div className="step-desc">{s.detail}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>

          {/* Right Live Sandbox */}
          <section className="preview-pane">
            <div className="preview-bar">
              <div className="tab-controls">
                <button
                  className={`tab-button ${activeTab === 'preview' ? 'active' : ''}`}
                  onClick={() => setActiveTab('preview')}
                >
                  Interactive Preview
                </button>
                <button
                  className={`tab-button ${activeTab === 'code' ? 'active' : ''}`}
                  onClick={() => setActiveTab('code')}
                >
                  Clean HTML Code
                </button>
              </div>

              {generatedHtml && (
                <button className="btn-copy" onClick={copyToClipboard}>
                  {copied ? '✓ Copied' : '📋 Copy Code'}
                </button>
              )}
            </div>

            <div className="viewport-box">
              {activeTab === 'preview' ? (
                <iframe
                  title="UI Output Viewport"
                  className="viewport-iframe"
                  srcDoc={iframeDoc}
                  sandbox="allow-scripts"
                />
              ) : (
                <div className="code-container">
                  <pre>{generatedHtml || '<!-- Code output will be displayed here -->'}</pre>
                </div>
              )}
            </div>
          </section>
        </main>
      </div>
    </>
  );
}
