// Fixed prompt that is not user customizable
export const TITLE_GENERATION_PROMPT = `Analyze the following note content and create a precise title. Identify the single most important CORE NOUN that represents what this note is about, then add 2-4 helper words that provide essential context.

Respond with ONLY a JSON object in this exact format:
{"title": "your generated title here"}

Examples:
{"title": "Project Planning Meeting"}
{"title": "Database Schema Design"}
{"title": "Python Error Handling"}

The title should be 2-5 words maximum. Do not include quotes around individual words, explanations, or multiple options.

Content to analyze:

`;