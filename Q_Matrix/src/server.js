const express = require("express");
const { generateQMatrix } = require("./qmatrix");
const { validateAssessment, validateQMatrix } = require("./validator");

const app = express();
app.use(express.json({ limit: "2mb" }));

app.get("/health", (_req, res) => res.json({ status: "ok" }));

app.post("/qmatrix/generate", (req, res) => {
  const validation = validateAssessment(req.body, { minQuestionsPerAttribute: 1 });
  if (!validation.valid) return res.status(400).json(validation);

  const matrix = generateQMatrix(req.body);
  const matrixValidation = validateQMatrix(
    matrix, req.body.questions.length
  );

  if (!matrixValidation.valid)
    return res.status(500).json(matrixValidation);

  return res.json({
    assessment: req.body.assessment ?? null,
    attribute_ids: require("./attributes").ATTRIBUTE_IDS,
    question_ids: req.body.questions.map(q => q.question_id),
    q_matrix: matrix,
    validation
  });
});

module.exports = app;

if (require.main === module) {
  const port = process.env.PORT || 3000;
  app.listen(port, () => console.log(`DiagnoMath Q-matrix API running on port ${port}`));
}
