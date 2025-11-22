// import { InferenceClient } from "@huggingface/inference";
// import resume from "@/data/resume.json";


// export async function POST(req) {
//   const body = await req.json();
//   const { jobDescription } = body || {};
//   // console.log()
//    const jsonPrompt = `
// You are an expert resume writer. Output ONLY valid JSON (no extra text). The JSON must be an object with keys: "Name", "Contact", "Summary", "Skills", "Experience", "Education".
// Example: (all object keys must small letters)
// ${JSON.stringify(resume)}
// Create the JSON resume for this job description: 
// ${jobDescription}
// `;

//   if (!jobDescription || !jobDescription.trim()) {
//     return new Response(JSON.stringify({ error: 'jobDescription required' }), {
//       status: 400,
//       headers: { 'Content-Type': 'application/json' },
//     });
//   }
//   const client = new InferenceClient(process.env.HF_API_KEY);

//   const chatCompletion = await client.chatCompletion({
//     model: "meta-llama/Llama-3.2-1B-Instruct:novita",
//     messages: [
//       {
//         role: "user",
//         content: jsonPrompt,
//       },
//     ],
//   });
// //   console.log('chatCompletion?.choices?.[0]?.message', chatCompletion?.choices?.[0]?.message?.content );
// //   console.log('chatCompletion?.choices?.[0]?.message', chatCompletion?.choices?.[0]?.message?.content);

// //   console.log('chatCompletion.choices[0].message JSON', JSON.parse(chatCompletion?.choices?.[0]?.message?.content));
//   return new Response(JSON.stringify({ resume: chatCompletion?.choices?.[0]?.message?.content  }), {
//     status: 200,
//     headers: { 'Content-Type': 'application/json' },
//   });
// }









// // app/api/generate-resume/route.js (or wherever your POST is)
// import { InferenceClient } from "@huggingface/inference";
// import resume from "@/data/resume.json";
// import { parseGeneratedJson } from "@/utils/generatedJson"; // adjust path

// function oneLineExample(obj) {
//   // produce a compact single-line example with lowercase keys
//   const lowerObj = Object.entries(obj).reduce((acc, [k, v]) => {
//     acc[k.toLowerCase()] = v;
//     return acc;
//   }, {});
//   return JSON.stringify(lowerObj);
// }

// export async function POST(req) {
//   const body = await req.json();
//   const { jobDescription } = body || {};

//   if (!jobDescription || !jobDescription.trim()) {
//     return new Response(JSON.stringify({ error: "jobDescription required" }), {
//       status: 400,
//       headers: { "Content-Type": "application/json" },
//     });
//   }

//   // Make example one-line and keys lowercase to model instruction
//   const example = oneLineExample(resume);
// //   console.log({example});

//   const jsonPrompt = `
// You are an expert resume writer. Output ONLY valid JSON and nothing else (no commentary, no backticks).
// - Use double quotes for all strings.
// - The output MUST be a single JSON object with keys exactly:
//   "name", "contact", "summary", "skills", "experience", "education"
// - All keys must be lowercase (as shown in example).
// - Do NOT include trailing commas.

// Example (single-line):
// ${example}

// Now create the JSON resume for this job description:
// ${jobDescription}

// Respond with just the JSON object.
// `.trim();

//   const client = new InferenceClient(process.env.HF_API_KEY);

//   const chatCompletion = await client.chatCompletion({
//     model: "meta-llama/Llama-3.2-1B-Instruct:novita",
//     messages: [{ role: "user", content: jsonPrompt }],
//     // If your client supports temperature or deterministic flags, set temperature: 0
//     // e.g. temperature: 0
//   });

//   const rawOutput = chatCompletion?.choices?.[0]?.message?.content ?? "";
//   //   console.log({rawOutput});
//   console.log({rawOutput});

//   const parsed = parseGeneratedJson(rawOutput);
//   console.log({parsed});

//   if (!parsed.ok) {
//     // helpful debug payload so frontend can show the raw + cleaned output to user
//     return new Response(
//       JSON.stringify({
//         ok: false,
//         error: parsed.error,
//         previews: {
//           raw: parsed.rawPreview ?? rawOutput.slice(0, 1200),
//           extracted: parsed.extractedPreview,
//           cleaned: parsed.cleanedPreview,
//         },
//       }),
//       { status: 200, headers: { "Content-Type": "application/json" } }
//     );
//   }

//   // success: return the parsed object
//   return new Response(JSON.stringify({ ok: true, resume: parsed.data }), {
//     status: 200,
//     headers: { "Content-Type": "application/json" },
//   });
// }












// app/api/generate-resume/route.js
import baseResume from "@/data/resume.json";
import { parseGeneratedJson } from "@/utils/generatedJson";
import { OpenAI } from "openai";
import * as fs from 'fs';
import {PDFParse} from 'pdf-parse';
import { pipeline } from '@xenova/transformers';
import path from "path";


/**
 * Deep merge helper: merge parsed fields into baseResume (base wins for missing fields)
 */
function deepMerge(base, override) {
  if (!override) return base;
  if (typeof base !== "object" || base === null) return override;
  const out = Array.isArray(base) ? [...base] : { ...base };
  Object.keys(override).forEach((k) => {
    if (base[k] && typeof base[k] === "object" && !Array.isArray(base[k])) {
      out[k] = deepMerge(base[k], override[k]);
    } else {
      out[k] = override[k];
    }
  });
  return out;
}

function oneLineExample(obj) {
  const lowerObj = Object.entries(obj).reduce((acc, [k, v]) => {
    acc[k.toLowerCase()] = v;
    return acc;
  }, {});
  // compact one-line example
  return JSON.stringify(lowerObj);
}

function enforceBaseFields(parsedData, base) {
  if (!parsedData || typeof parsedData !== "object") return parsedData || {};

  const out = { ...parsedData };

  // 1) Always preserve these top-level protected primitives from base
  const protectedTop = ["name"];
  protectedTop.forEach((k) => {
    if (base[k]) out[k] = base[k];
  });

  // 2) Always preserve contact subfields exactly
  out.contact = out.contact && typeof out.contact === "object" ? { ...out.contact } : {};
  const contactFields = ["email", "phone", "address", "linkedin", "github", "portfolio"];
  contactFields.forEach((field) => {
    // If base has it, overwrite whatever model returned
    if (base.contact && base.contact[field]) out.contact[field] = base.contact[field];
    else out.contact[field] = out.contact[field] ?? "";
  });

  // 3) Preserve existing experience company names & dates and only accept responsibilities from model
  const baseExp = base.work_experience  || [];
  const parsedExp = Array.isArray(out.work_experience) ? out.work_experience : [];

  const mergedExp = baseExp.map((baseItem, idx) => {
    const parsedItem = parsedExp[idx] || {};
    return {
      role: parsedItem.role || baseItem.role || "",
      company: baseItem.company, // FORCE base company name
      start_date: baseItem.start_date || "",
      end_date: baseItem.end_date || "",
      // Use parsed responsibilities only if array, otherwise keep base responsibilities
      responsibilities: Array.isArray(parsedItem.responsibilities) && parsedItem.responsibilities.length
        ? parsedItem.responsibilities.map(r => String(r).slice(0, 200)) // keep bullets safe/short
        : (baseItem.responsibilities || [])
    };
  });

  // If model added extra experiences beyond base, allow them appended (but do NOT overwrite base entries)
  if (parsedExp.length > baseExp.length) {
    const extras = parsedExp.slice(baseExp.length).map((ex) => ({
      role: ex.role || "",
      company: ex.company || "",
      start_date: ex.start_date || "",
      end_date: ex.end_date || "",
      responsibilities: Array.isArray(ex.responsibilities) ? ex.responsibilities : []
    }));
    mergedExp.push(...extras);
  }

  out.work_experience = mergedExp;

  // 4) Ensure required keys exist and have safe defaults per your JSON contract
  out.summary = typeof out.summary === "string" ? out.summary : "";
  out.skills = typeof out.skills === "object" && out.skills !== null ? out.skills : {};
  const skillKeys = ["programming_languages","frontend","backend","databases","cloud_devops","ai","payment_and_communication","cms"];
  skillKeys.forEach(k => {
    if (!Array.isArray(out.skills[k])) out.skills[k] = [];
  });

  out.education = Array.isArray(out.education) ? out.education : [];

  return out;
}

console.time("network_call");
const client1 = new OpenAI({
  baseURL: "https://router.huggingface.co/v1",
  apiKey: process.env.HF_API_KEY,
});

console.timeEnd("network_call");

async function parseResumePdfToJson(pdfPath) {
    // Step 1: Extract text from PDF
    const dataBuffer = fs.readFileSync(pdfPath);
    // const pdfData = await pdf(dataBuffer);
    const pdfData = new PDFParse({ data: dataBuffer });
    try{
      const resumeText = await pdfData.getText();

      console.log({resumeText})
    }catch(err){
      console.error('Error extracting text from PDF:', err);
      return;
    }

     return new Response(JSON.stringify({ ok: true, resume: "s"}), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  
    // Step 2: Use a Hugging Face NER model to extract structured info
    // The 'yashpwr/resume-ner-bert-v2' model is designed for this task
    const extractor = await pipeline('token-classification', 'yashpwr/resume-ner-bert-v2');

    // Run the model on the extracted text
    const output = await extractor(resumeText);

    // Step 3: Post-process the output into a clean JSON structure
    // The raw output from the NER model is a list of tagged tokens. 
    // You'll need to write a post-processing function to organize this into a coherent JSON object.

    const structuredData = organizeNerOutput(output, resumeText);
    
    // Convert the structured data to a JSON string
    const jsonOutput = JSON.stringify(structuredData, null, 2);

    console.log(jsonOutput);
    return jsonOutput;
}

// Helper function to organize the NER output into a structured format
function organizeNerOutput(nerOutput, rawText) {
    const data = {
        name: "",
        email: "",
        phone: "",
        skills: [],
        education: [],
        experience: []
    };

    // A more complex function is needed to properly structure the data from token tags.
    // For demonstration, here is a simplified way to extract some basic entities:
    nerOutput.forEach(entity => {
        if (entity.entity_group === 'NAME') {
            data.name += entity.word.replace('##', '') + ' ';
        } else if (entity.entity_group === 'EMAIL') {
            data.email = entity.word;
        } else if (entity.entity_group === 'SKILL') {
            const skill = entity.word.replace('##', '').trim();
            if (skill && !data.skills.includes(skill)) {
                data.skills.push(skill);
            }
        }
        // ... add logic for education, experience, etc.
    });

    data.name = data.name.trim(); // Clean up the name

    return data;
}


export async function POST(req) {
  const filePath = path.join(process.cwd(), "public", "resume.pdf");

  parseResumePdfToJson(filePath)
    .then((data) => console.log('Resume parsed successfully.', data))
    .catch(err => console.error('Error during resume parsing:', err));

  return new Response(JSON.stringify({ ok: true, error: {} }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });

  try {
    const body = await req.json();
    async function makeResume() {
      console.time("handler_total");
      const { jobDescription } = body || {};
  
      if (!jobDescription || !jobDescription.trim()) {
        return new Response(JSON.stringify({ error: "jobDescription required" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }
  
      const example = oneLineExample(baseResume);
      
      const jsonPrompt = `
        SYSTEM:
        You are an expert resume writer. ALWAYS OUTPUT ONLY ONE VALID JSON OBJECT AND NOTHING ELSE (no commentary, no backticks, no extra fields). Use only double quotes for strings. If you cannot provide a value, return an empty string, empty array, or empty object as appropriate.
  
        REQUIREMENTS / RULES:
        1) The output must be a single JSON object with exact lowercase keys:
          "name", "contact", "summary", "skills", "experience", "education"
  
        2) Types:
          - "name": string
          - "contact": object with keys "email", "phone", "address", "linkedin", "github", "portfolio"
          - "summary": string
          - "skills": object with keys "programming_languages", "frontend", "backend", "databases", "cloud_devops", "ai", "payment_and_communication", "cms" (each an array of strings; if a section is not relevant return [])
          - "experience": array of experience objects. Each experience object must contain exactly:
            { "role": string, "company": string, "start_date": string, "end_date": string, "responsibilities": [string, ...] }
          - "education": array of objects (or empty array)
  
        3) DO NOT change or invent the following base/personal information — these MUST be copied exactly from the provided base resume (preserve spelling & values):
          - name
          - contact.email
          - contact.phone
          - contact.address
          - contact.linkedin
          - contact.github
          - All companies that already exist in the base resume's "work_experience" array (preserve company names and the order they appear). If you add new work_experience entries (optional), append them below the existing ones — do NOT replace or alter the existing company entries.
  
        4) What you SHOULD change / tailor to the job description:
          - "jobTitle" is optional in the output object; if included put a single short target title string (e.g., "Principal Full Stack Engineer") OR leave empty.
          - "summary": rewrite to highlight the candidate's relevant work_experience and match keywords from the job description. Keep it concise (1–3 short sentences).
          - "skills": prioritize and order skills that match the job description. Use only skills that the candidate plausibly has (use the intersection of base skills and JD skills first; you may add a couple closely-related skills if strongly implied by the JD).
          - "work_experience[].responsibilities": tailor existing work_experience responsibilities to emphasize tasks and achievements relevant to the JD. Keep each responsibility short (6–14 words). Do not invent new company names or change dates; only adapt responsibility bullets.
          - work_experience: please dont add work_experience in "experience" key.
        5) Formatting constraints:
          - Use double quotes and valid JSON only.
          - No trailing commas, no comments, no markdown.
          - Output must be parseable by JSON.parse().
  
        6) Example (single-line) — USE THIS STRUCTURE:
        ${example}
  
        USER:
        Job description:
        ${jobDescription}
  
      `;
      
    //  const jsonPrompt = `what is capital of pakistan?`;
     
    
    console.time("llm_call");
    const chatCompletion1 = await client1.chat.completions.create({
        model: "deepseek-ai/DeepSeek-R1-Distill-Qwen-7B",
        messages: [
          {
            role: "user",
            content: jsonPrompt,
          },
        ],
        // max_tokens: 16,        // small
        temperature: 0.0,      // deterministic
        top_p: 1.0,
      });
      console.timeEnd("llm_call");
      
      const rawOutput = chatCompletion1?.choices?.[0]?.message?.content ?? "";
      console.time("parse");
      // console.log("rawOutput:", rawOutput);
      const parsed = parseGeneratedJson(rawOutput);
      // console.log({parsed});
      
      console.timeEnd("parse");
      // const parsed = { ok: true, data: {} }; // TODO: replace with actual parsing
      if (!parsed.ok) {
        // await new Promise((r) => setTimeout(r, 1000)); 
        return await makeResume();
      }
      return parsed;
    }

    const parsed = await makeResume();
    const enforcedData = enforceBaseFields(parsed.data || {}, baseResume);
    const merged = deepMerge(baseResume, enforcedData);

    console.timeEnd("handler_total");
    return new Response(JSON.stringify({ ok: true, resume: merged }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("generate-resume error:", err);
    return new Response(JSON.stringify({ ok: false, error: err.message || String(err) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
