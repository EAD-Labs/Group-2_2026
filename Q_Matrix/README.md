# DiagnoMath Q-Matrix Module

This module is the finalized backend implementation for converting the finalized
question JSON into a binary Q-matrix.

## Fixed 12 attributes

A1 Numerator and denominator identification  
A2 Fraction representation  
A3 Fraction classification (proper/improper/mixed)  
A4 Fraction simplification  
A5 Equivalent fractions  
A6 Fraction comparison  
A7 Fraction ordering  
A8 Mixed/improper conversion  
A9 Like-denominator addition  
A10 Unlike-denominator addition  
A11 Fraction subtraction  
A12 Fraction application / word problems

## Pipeline

Teacher/PDF -> LLM question generation -> finalized JSON -> validation ->
deterministic Q-matrix generation -> Q-matrix validation -> GNPC

The LLM does NOT construct the binary matrix. It only supplies attribute_ids
for each generated question. The backend constructs the matrix from those IDs.

## Run

```bash
npm install
npm test
npm start
```

API: `POST /qmatrix/generate`

Send the finalized assessment JSON in the request body.

## Important validation

The validator checks question IDs, duplicate questions, four unique options,
valid correct answers, valid attribute IDs, at least one attribute per question,
and attribute coverage. Q-matrix validation checks dimensions and binary values.

The recommended minimum number of questions per selected attribute is configurable.
For the fixture, every finalized attribute is covered by at least 3 questions.
