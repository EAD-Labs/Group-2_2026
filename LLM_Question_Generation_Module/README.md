# DiagnoMath LLM Question Generation

This module is the pre-Q-matrix stage of DiagnoMath.

## Flow

Teacher PDF
→ Gemini identifies relevant fixed attributes
→ teacher confirms attributes
→ Gemini generates questions
→ JSON validation
→ output is ready for the existing Q-matrix module.

## Routes

1. `/llm/identify-attributes` — PDF → relevant attribute IDs
2. `/llm/generate-from-pdf` — PDF + teacher-confirmed attributes → questions
3. `/llm/generate-from-text` — source text + teacher-confirmed attributes → questions
4. `/health` — service health check

## Run

```bash
npm install
npm test
npm start
```

The service runs on port `3100` by default.

## Gemini API key

The API key is **not stored in this project**.

For local development, the service can read:

```text
GEMINI_API_KEY
```

It also accepts a runtime API key through the `x-llm-api-key` request header.

Do not commit API keys, `.env` files, uploaded PDFs, or other secrets to GitHub.

## Question output

The LLM generates structured question JSON containing:

- question ID
- question text
- four options
- correct answer
- fixed attribute IDs
- difficulty

The LLM does **not** generate the binary Q-matrix. The existing Q-matrix module deterministically converts `attribute_ids` into the binary question × attribute matrix.
