import {validateQuestionOutput,validateSelectedAttributes} from "../src/validate-output.mjs";
const good={assessment:{title:"Test",subject:"Mathematics",topic:"Fractions"},questions:[{question_id:"Q1",question:"Simplify 12/18.",options:{A:"2/3",B:"3/4",C:"4/5",D:"6/9"},correct_answer:"A",attribute_ids:["A4"],difficulty:"medium"}]};
if(!validateQuestionOutput(good,1).valid)throw new Error("Good output rejected");
if(!validateSelectedAttributes(["A4","A6"]).valid)throw new Error("Valid attributes rejected");
if(validateSelectedAttributes(["A99"]).valid)throw new Error("Invalid attribute accepted");
console.log("LLM validation tests passed.");
