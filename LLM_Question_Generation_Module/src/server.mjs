import express from "express";
import multer from "multer";
import fs from "node:fs/promises";
import {
  identifyAttributesFromPdf,
  generateFromPdf,
  generateFromText
} from "./qgen-service.mjs";

const app = express();
const upload = multer({ dest: "uploads/" });

app.use(express.json({ limit: "4mb" }));

app.get("/health", (_, res) => {
  res.json({ status: "ok" });
});

// Gemini API key
const key = req =>
  req.header("x-llm-api-key") || process.env.GEMINI_API_KEY;

// Gemini model
const model = req =>
  req.body.model || process.env.GEMINI_MODEL || "gemini-3.8-flash";

app.post(
  "/llm/identify-attributes",
  upload.single("pdf"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "pdf is required" });
      }

      res.json(
        await identifyAttributesFromPdf({
          apiKey: key(req),
          model: model(req),
          pdfPath: req.file.path
        })
      );
    } catch (e) {
      res.status(400).json({ error: e.message });
    } finally {
      if (req.file) {
        await fs.rm(req.file.path, { force: true });
      }
    }
  }
);

app.post(
  "/llm/generate-from-pdf",
  upload.single("pdf"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "pdf is required" });
      }

      const attrs = JSON.parse(
        req.body.selected_attributes || "[]"
      );

      res.json(
        await generateFromPdf({
          apiKey: key(req),
          model: model(req),
          pdfPath: req.file.path,
          selectedAttributes: attrs,
          numQuestions: Number(req.body.num_questions || 10),
          difficulty: req.body.difficulty || "balanced"
        })
      );
    } catch (e) {
      res.status(400).json({ error: e.message });
    } finally {
      if (req.file) {
        await fs.rm(req.file.path, { force: true });
      }
    }
  }
);

app.post("/llm/generate-from-text", async (req, res) => {
  try {
    res.json(
      await generateFromText({
        apiKey: key(req),
        model: model(req),
        sourceText: req.body.source_text,
        selectedAttributes: req.body.selected_attributes,
        numQuestions: Number(req.body.num_questions || 10),
        difficulty: req.body.difficulty || "balanced"
      })
    );
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

app.listen(
  process.env.PORT || 3100,
  () =>
    console.log(
      `DiagnoMath LLM service running on ${process.env.PORT || 3100}`
    )
);