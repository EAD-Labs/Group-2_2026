const fs = require("fs");
const path = require("path");
const { generateQMatrix } = require("../src/qmatrix");
const { validateAssessment, validateQMatrix } = require("../src/validator");
const { ATTRIBUTE_IDS } = require("../src/attributes");

const data = JSON.parse(
  fs.readFileSync(path.join(__dirname, "../data/fractions_questions.json"), "utf8")
);

const result = validateAssessment(data, { minQuestionsPerAttribute: 3 });
if (!result.valid) {
  console.error(result.errors);
  process.exit(1);
}

const matrix = generateQMatrix(data);
const matrixResult = validateQMatrix(matrix, data.questions.length, ATTRIBUTE_IDS.length);

if (!matrixResult.valid) {
  console.error(matrixResult.errors);
  process.exit(1);
}

if (matrix.length !== 40 || matrix[0].length !== 12) {
  throw new Error("Expected a 40 x 12 Q-matrix");
}

const a4Index = ATTRIBUTE_IDS.indexOf("A4");
if (matrix[7][a4Index] !== 1) throw new Error("Q8 should test A4");
if (matrix[7].reduce((a,b) => a+b, 0) !== 1) throw new Error("Q8 should map to exactly one attribute");

const q37 = matrix[36];
const a9Index = ATTRIBUTE_IDS.indexOf("A9");
const a12Index = ATTRIBUTE_IDS.indexOf("A12");
if (q37[a9Index] !== 1 || q37[a12Index] !== 1)
  throw new Error("Q37 should test A9 and A12");

console.log("All Q-matrix tests passed.");
console.log("Dimensions:", matrix.length, "x", matrix[0].length);
console.log("Coverage:", result.coverage);
