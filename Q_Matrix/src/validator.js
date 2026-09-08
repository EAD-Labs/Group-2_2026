const { ATTRIBUTE_IDS } = require("./attributes");

function validateAssessment(assessmentJson, options = {}) {
  const errors = [];
  const warnings = [];
  const questions = assessmentJson?.questions;

  if (!Array.isArray(questions) || questions.length === 0) {
    errors.push("questions must be a non-empty array");
    return { valid: false, errors, warnings };
  }

  const minQuestionsPerAttribute = options.minQuestionsPerAttribute ?? 1;
  const seenQuestionIds = new Set();
  const seenTexts = new Set();
  const coverage = Object.fromEntries(ATTRIBUTE_IDS.map(id => [id, 0]));

  for (const [index, q] of questions.entries()) {
    const prefix = `questions[${index}]`;

    if (!q.question_id) errors.push(`${prefix}.question_id is required`);
    if (q.question_id && seenQuestionIds.has(q.question_id))
      errors.push(`${prefix}.question_id is duplicated: ${q.question_id}`);
    if (q.question_id) seenQuestionIds.add(q.question_id);

    if (typeof q.question !== "string" || !q.question.trim())
      errors.push(`${prefix}.question must be a non-empty string`);

    if (q.question && seenTexts.has(q.question.trim().toLowerCase()))
      errors.push(`${prefix}.question is duplicated`);
    if (q.question) seenTexts.add(q.question.trim().toLowerCase());

    const optionKeys = ["A", "B", "C", "D"];
    if (!q.options || typeof q.options !== "object")
      errors.push(`${prefix}.options is required`);
    else {
      for (const key of optionKeys) {
        if (typeof q.options[key] !== "string" || !q.options[key].trim())
          errors.push(`${prefix}.options.${key} must be a non-empty string`);
      }
      const values = optionKeys.map(k => q.options[k]?.trim().toLowerCase());
      if (values.filter(Boolean).length === 4 && new Set(values).size !== 4)
        errors.push(`${prefix}.options must contain four unique options`);
    }

    if (!optionKeys.includes(q.correct_answer))
      errors.push(`${prefix}.correct_answer must be one of A, B, C, D`);

    if (!Array.isArray(q.attribute_ids) || q.attribute_ids.length === 0)
      errors.push(`${prefix}.attribute_ids must contain at least one attribute`);
    else {
      if (new Set(q.attribute_ids).size !== q.attribute_ids.length)
        errors.push(`${prefix}.attribute_ids contains duplicates`);

      for (const id of q.attribute_ids) {
        if (!ATTRIBUTE_IDS.includes(id))
          errors.push(`${prefix}.attribute_ids contains unknown ID: ${id}`);
        else coverage[id]++;
      }
    }
  }

  for (const id of ATTRIBUTE_IDS) {
    if (coverage[id] === 0)
      warnings.push(`${id} is not covered by any question`);
    else if (coverage[id] < minQuestionsPerAttribute)
      warnings.push(`${id} has only ${coverage[id]} question(s); recommended minimum is ${minQuestionsPerAttribute}`);
  }

  return { valid: errors.length === 0, errors, warnings, coverage };
}

function validateQMatrix(matrix, questionCount, attributeCount = ATTRIBUTE_IDS.length) {
  const errors = [];

  if (!Array.isArray(matrix)) errors.push("matrix must be an array");
  if (Array.isArray(matrix) && matrix.length !== questionCount)
    errors.push(`matrix must have ${questionCount} rows`);
  if (Array.isArray(matrix)) {
    matrix.forEach((row, i) => {
      if (!Array.isArray(row) || row.length !== attributeCount)
        errors.push(`row ${i} must contain ${attributeCount} values`);
      else if (row.some(v => v !== 0 && v !== 1))
        errors.push(`row ${i} must contain only 0/1 values`);
    });
  }

  return { valid: errors.length === 0, errors };
}

module.exports = { validateAssessment, validateQMatrix };
