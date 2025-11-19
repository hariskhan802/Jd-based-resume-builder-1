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
import { InferenceClient } from "@huggingface/inference";
import baseResume from "@/data/resume.json";
import { parseGeneratedJson } from "@/utils/generatedJson";
import { OpenAI } from "openai";

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

export async function POST(req) {
  try {
    const body = await req.json();
    const { jobDescription } = body || {};

    if (!jobDescription || !jobDescription.trim()) {
      return new Response(JSON.stringify({ error: "jobDescription required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const example = oneLineExample(baseResume);

//     const jsonPrompt = `
// You are an expert resume writer. OUTPUT ONLY A SINGLE JSON OBJECT AND NOTHING ELSE (no commentary, no code fences).
// - Use strictly double quotes for strings.
// - The object MUST have these exact lowercase keys:
//   "name", "contact", "summary", "skills", "experience", "education"
// - Keep values appropriate types (contact = object, skills = object, experience = array).
// - Do NOT include trailing commas or comments.
// - If some fields are not applicable, return an empty string or empty array/object for those fields.
// Example (single-line):
// ${example}

// Create a concise JSON resume tailored to this job description (be precise, use bullet-like short sentences inside arrays for responsibilities):

// ${jobDescription}

// Respond with just the JSON object.
// `.trim();

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
   - All companies that already exist in the base resume's "experience" array (preserve company names and the order they appear). If you add new experience entries (optional), append them below the existing ones — do NOT replace or alter the existing company entries.

4) What you SHOULD change / tailor to the job description:
   - "jobTitle" is optional in the output object; if included put a single short target title string (e.g., "Principal Full Stack Engineer") OR leave empty.
   - "summary": rewrite to highlight the candidate's relevant experience and match keywords from the job description. Keep it concise (1–3 short sentences).
   - "skills": prioritize and order skills that match the job description. Use only skills that the candidate plausibly has (use the intersection of base skills and JD skills first; you may add a couple closely-related skills if strongly implied by the JD).
   - "experience[].responsibilities": tailor existing experience responsibilities to emphasize tasks and achievements relevant to the JD. Keep each responsibility short (6–14 words). Do not invent new company names or change dates; only adapt responsibility bullets.
   - You may add one or two new experience entries **if** the JD requires specific prior roles not present in the base resume — but do not change existing company names/dates.

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

    const client1 = new OpenAI({
      baseURL: "https://router.huggingface.co/v1",
      apiKey: process.env.HF_API_KEY,
    });

    const chatCompletion1 = await client1.chat.completions.create({
      model: "deepseek-ai/DeepSeek-R1-Distill-Qwen-7B",
      messages: [
        {
          role: "user",
          content: jsonPrompt,
        },
      ],
    });

    const rawOutput = chatCompletion1?.choices?.[0]?.message?.content ?? "";
    // console.log("rawOutput:", rawOutput.slice(0, 1000));


    const parsed = parseGeneratedJson(rawOutput);
    if (!parsed.ok) {
      // return helpful debug previews so frontend can show raw + cleaned attempts
      return new Response(
        JSON.stringify({
          ok: false,
          error: parsed.error,
          previews: {
            raw: parsed.rawPreview ?? rawOutput.slice(0, 1200),
            extracted: parsed.extractedPreview,
            cleaned: parsed.cleanedPreview,
          },
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    // merge parsed data into baseResume to keep base fields (email/name etc.) if model omitted them
    const merged = deepMerge(baseResume, parsed.data);

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
