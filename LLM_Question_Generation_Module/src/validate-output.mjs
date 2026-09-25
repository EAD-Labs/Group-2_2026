const IDS=Array.from({length:12},(_,i)=>`A${i+1}`);

export function validateSelectedAttributes(ids){
  const errors=[];
  if(!Array.isArray(ids)||!ids.length) errors.push("At least one attribute must be selected.");
  else for(const id of ids) if(!IDS.includes(id)) errors.push(`Unknown attribute: ${id}`);
  return {valid:!errors.length,errors};
}

export function validateQuestionOutput(data,expectedCount=null){
  const errors=[], ids=new Set(), texts=new Set();
  if(!data?.assessment) errors.push("assessment is required");
  if(!Array.isArray(data?.questions)){errors.push("questions must be an array");return {valid:false,errors};}
  if(expectedCount!==null&&data.questions.length!==expectedCount) errors.push(`Expected ${expectedCount} questions, received ${data.questions.length}`);
  data.questions.forEach((q,i)=>{
    const p=`questions[${i}]`;
    if(!q.question_id) errors.push(`${p}.question_id is required`);
    if(ids.has(q.question_id)) errors.push(`${p}.question_id is duplicated`);
    ids.add(q.question_id);
    const t=q.question?.trim().toLowerCase();
    if(!t) errors.push(`${p}.question is empty`);
    else if(texts.has(t)) errors.push(`${p}.question is duplicated`);
    texts.add(t);
    if(!q.options) errors.push(`${p}.options is required`);
    else {
      for(const k of "ABCD") if(!q.options[k]?.trim()) errors.push(`${p}.options.${k} is required`);
      const vals="ABCD".split("").map(k=>q.options[k]?.trim().toLowerCase());
      if(vals.filter(Boolean).length===4&&new Set(vals).size!==4) errors.push(`${p}.options must be unique`);
    }
    if(!"ABCD".includes(q.correct_answer)) errors.push(`${p}.correct_answer must be A/B/C/D`);
    if(!Array.isArray(q.attribute_ids)||q.attribute_ids.length<1||q.attribute_ids.length>3) errors.push(`${p}.attribute_ids must contain 1–3 IDs`);
    else for(const id of q.attribute_ids) if(!IDS.includes(id)) errors.push(`${p}.unknown attribute ${id}`);
    if(!["easy","medium","hard"].includes(q.difficulty)) errors.push(`${p}.difficulty must be easy/medium/hard`);
  });
  return {valid:!errors.length,errors};
}
