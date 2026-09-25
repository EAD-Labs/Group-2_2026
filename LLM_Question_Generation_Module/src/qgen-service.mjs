import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  makeClient,
  uploadPdf,
  identifyAttributes,
  generateQuestions,
  generateQuestionsFromText
} from "./gemini-provider.mjs";
import {validateSelectedAttributes,validateQuestionOutput} from "./validate-output.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, "..");
const attrSchema=JSON.parse(await fs.readFile(path.join(root,"schemas/attribute-identification.schema.json"),"utf8"));
const qSchema=JSON.parse(await fs.readFile(path.join(root,"schemas/question-generation.schema.json"),"utf8"));
const attrPrompt=await fs.readFile(path.join(root,"prompts/identify-attributes.txt"),"utf8");
const qPrompt=await fs.readFile(path.join(root,"prompts/generate-questions.txt"),"utf8");

export async function identifyAttributesFromPdf({apiKey,model,pdfPath}){
  const c=makeClient(apiKey), f=await uploadPdf(c,pdfPath);
  return identifyAttributes(c,{model,fileId:f,text:attrPrompt,schema:attrSchema});
}

function buildPrompt(selectedAttributes,numQuestions,difficulty){
  const check=validateSelectedAttributes(selectedAttributes);
  if(!check.valid) throw new Error(check.errors.join("; "));
  return `${qPrompt}\n\nTEACHER-CONFIRMED ATTRIBUTES: ${selectedAttributes.join(", ")}\nNUMBER OF QUESTIONS: ${numQuestions}\nDIFFICULTY TARGET: ${difficulty||"balanced"}\nGenerate exactly ${numQuestions} questions.`;
}

export async function generateFromPdf(args){
  const c=makeClient(args.apiKey), f=await uploadPdf(c,args.pdfPath);
  const result=await generateQuestions(c,{model:args.model,fileId:f,text:buildPrompt(args.selectedAttributes,args.numQuestions,args.difficulty),schema:qSchema});
  const check=validateQuestionOutput(result,args.numQuestions);
  if(!check.valid) throw new Error(`Generated JSON failed validation: ${check.errors.join(" | ")}`);
  return result;
}

export async function generateFromText(args){
  const c=makeClient(args.apiKey);
  const result=await generateQuestionsFromText(c,{model:args.model,sourceText:args.sourceText,text:buildPrompt(args.selectedAttributes,args.numQuestions,args.difficulty),schema:qSchema});
  const check=validateQuestionOutput(result,args.numQuestions);
  if(!check.valid) throw new Error(`Generated JSON failed validation: ${check.errors.join(" | ")}`);
  return result;
}
