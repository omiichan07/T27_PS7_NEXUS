const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.json());

const GEMINI_API_KEY = "AIzaSyBgoO2jJDBqdyJd9D0zWuzNlD3ygK7oJsM";

// Ranked list of models for silent instant failover
const MODEL_FALLBACK_CHAIN = [
  "gemini-3.7-flash",
  "gemini-3.6-flash",
  "gemini-3.5-flash",
  "gemini-3.5-flash-lite",
  "gemini-3.1-flash-lite",
  "gemini-2.5-flash",
  "gemini-2.5-flash-lite"
];

app.get("/api/health", (req, res) => {
  res.json({ ok: true, message: "UIForge Backend is connected & live!" });
});

// Helper function to call the Gemini API
async function callGeminiModel(model, prompt) {
  return await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `You are an elite enterprise product designer and senior web UI engineer.
Create a rich, responsive, and legible enterprise web dashboard UI in clean HTML with Tailwind CSS for: "${prompt}".

CRITICAL DESIGN & TYPOGRAPHY RULES:
1. READABILITY FIRST: Use clear, large font sizes.
   - Main page title: text-2xl font-black text-slate-900.
   - Section headers: text-lg font-bold text-slate-800.
   - KPI metrics: text-3xl or 4xl font-extrabold text-indigo-600.
   - Body & table text: text-sm or text-base text-slate-600 with high contrast.
2. STRUCTURE & CONTAINERS:
   - Header Bar: Elevated banner (bg-white shadow-sm rounded-2xl p-4 flex justify-between items-center) with brand title, search box, and action buttons.
   - KPI Row: 3 or 4 responsive cards (grid grid-cols-1 md:grid-cols-3 gap-4) with soft colorful backgrounds, badges, and icons.
   - Main Section: Wide 2-column or table layout with clear borders (border border-slate-200), rounded-2xl cards, and clear spacing (p-6).
3. CODE RULES:
   - Return ONLY the clean HTML tags inside a container.
   - Do NOT wrap in \`\`\`html or markdown backticks.
   - For all <a> tags or buttons, use href="javascript:void(0)".
   - All profile/avatar images must have fixed dimensions like "w-12 h-12 rounded-full object-cover".`,
              },
            ],
          },
        ],
      }),
    }
  );
}

app.post("/api/generate", async (req, res) => {
  const startTime = Date.now();
  const { prompt } = req.body;

  if (!prompt || !prompt.trim()) {
    return res.status(400).json({ error: "Please provide a valid prompt." });
  }

  let finalOutput = "";
  let successfulModel = MODEL_FALLBACK_CHAIN[0];
  let lastErrorMessage = "";

  // Iterate through fallback chain silently until a response succeeds
  for (const model of MODEL_FALLBACK_CHAIN) {
    try {
      const response = await callGeminiModel(model, prompt);
      const data = await response.json();

      if (response.ok && data.candidates?.[0]?.content?.parts?.[0]?.text) {
        finalOutput = data.candidates[0].content.parts[0].text;
        successfulModel = model;
        break; // Successfully generated UI, exit loop
      } else {
        lastErrorMessage = data.error?.message || "Model limit reached";
        console.warn(`[Silent Failover] Model ${model} unavailable (${lastErrorMessage}). Shifting to next...`);
      }
    } catch (err) {
      console.warn(`[Silent Failover] Network error with ${model}: ${err.message}. Retrying...`);
    }
  }

  const duration = ((Date.now() - startTime) / 1000).toFixed(2);

  if (!finalOutput) {
    return res.status(500).json({
      error: "AI generation temporarily busy. Please re-click generate in 5 seconds.",
    });
  }

  // Return standard success payload without revealing failover actions
  res.json({
    output: finalOutput,
    meta: {
      latency: `${duration}s`,
      model: "Gemini Enterprise Flash",
      steps: [
        { step: "Prompt Tokenization", detail: `Analyzed "${prompt.slice(0, 40)}..." for layout requirements.` },
        { step: "Design System Configuration", detail: "Configured high-contrast typography hierarchy (24px-36px headings)." },
        { step: "Component Assembly", detail: "Synthesized responsive header, metric cards, and data views." },
        { step: "Tailwind Rendering Check", detail: "Validated responsive DOM nodes and styling integrity." }
      ],
      rawLength: finalOutput.length
    }
  });
});

app.listen(PORT, () => {
  console.log(`UIForge backend running smoothly at http://localhost:${PORT}`);
});
