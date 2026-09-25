import { GoogleGenAI } from "@google/genai";

const MODEL = "gemini-3.8-flash";

export function makeClient(apiKey) {
  return new GoogleGenAI({
    apiKey: apiKey || process.env.GEMINI_API_KEY
  });
}

export async function uploadPdf(client, pdfPath) {
  const uploadedFile = await client.files.upload({
    file: pdfPath,
    config: {
      mimeType: "application/pdf"
    }
  });

  return uploadedFile;
}

async function runStructured(client, input, schema, model = MODEL) {
  const interaction = await client.interactions.create({
    model,

    input,

    response_format: {
      type: "text",
      mime_type: "application/json",
      schema
    }
  });

  return JSON.parse(interaction.output_text);
}

export async function identifyAttributes(
  client,
  { model, fileId, text, schema }
) {
  return runStructured(
    client,
    [
      {
        type: "text",
        text
      },
      {
        type: "document",
        uri: fileId.uri,
        mime_type: fileId.mimeType || "application/pdf"
      }
    ],
    schema,
    model || MODEL
  );
}

export async function generateQuestions(
  client,
  { model, fileId, text, schema }
) {
  return runStructured(
    client,
    [
      {
        type: "text",
        text
      },
      {
        type: "document",
        uri: fileId.uri,
        mime_type: fileId.mimeType || "application/pdf"
      }
    ],
    schema,
    model || MODEL
  );
}

export async function generateQuestionsFromText(
  client,
  { model, sourceText, text, schema }
) {
  return runStructured(
    client,
    `${sourceText}\n\n${text}`,
    schema,
    model || MODEL
  );
}