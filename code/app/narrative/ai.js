import { generateText } from 'ai';
// import { google } from "@ai-sdk/google";
import { createGoogleGenerativeAI } from '@ai-sdk/google';

const google = createGoogleGenerativeAI({
  apiKey:"AIzaSyA5XltRgE1WckMKxrckoECsmopHxjNQIF0"
});

export async function generateNarrative(prompt) {
    console.log("generateNarrative called")
    // API KEY EXPOSED IN BROWSER - development only
  
    const { text } = await generateText({
        model: google("gemini-2.5-flash"),
        system:
            'You are drafting task descriptions for a lawyer. '+
            'Use the given keywords to flesh out a short pragraph describing the task. No speculation. Plain text only, no formatting.',
        prompt: prompt,
    });

    return text;


}

// import { generateText} from "ai";
// import { google } from "@ai-sdk/google";

// export async function generateNarrative(prompt) {
//     const model = google({ apiKey: "AIzaSyA5XltRgE1WckMKxrckoECsmopHxjNQIF0" })("gemini-1.5-flash");

//     const result = await sdkGenerateText({
//         model,
//         system: "You are drafting narratives for a lawyer...",
//         prompt,
//     });

//     return result?.text ?? String(result);
// }