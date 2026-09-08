const { ATTRIBUTE_IDS } = require("./attributes");

/**
 * Deterministically converts the finalized question JSON into
 * a question x attribute binary Q-matrix.
 */
function generateQMatrix(assessmentJson) {
  if (!assessmentJson || !Array.isArray(assessmentJson.questions)) {
    throw new Error("assessmentJson.questions must be an array");
  }

  return assessmentJson.questions.map(question => {
    const selected = new Set(question.attribute_ids || []);
    return ATTRIBUTE_IDS.map(attributeId => selected.has(attributeId) ? 1 : 0);
  });
}

function matrixToRows(assessmentJson) {
  const matrix = generateQMatrix(assessmentJson);
  return assessmentJson.questions.map((q, i) => ({
    question_id: q.question_id,
    values: matrix[i]
  }));
}

module.exports = { generateQMatrix, matrixToRows };
