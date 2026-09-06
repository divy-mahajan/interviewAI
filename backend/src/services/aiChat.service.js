const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
    apiKey: process.env.GOOGLE_GENAI_API_KEY,
});

const SYSTEM_INSTRUCTION = `You are InterviewAI, an expert technical and behavioral interview preparation assistant and career coach.
Your primary mission is to help candidates prepare and excel in their software engineering and tech interviews through clear explanations, guided practice, thought-provoking follow-ups, and constructive feedback.

Core Guidelines:
1. Scope: Specialize in Data Structures & Algorithms, System Design, Core CS (Operating Systems, DBMS, Computer Networks, Object-Oriented Programming), Web/Backend technologies, and Behavioral/HR interview questions.
2. Pedagogical Style: When a candidate practices a problem, offer hints, intuition, and edge cases before handing over a full solution. Encourage them to write and reason about code.
3. Code Quality: Provide clean, readable, and idiomatic code (C++, Java, Python, JavaScript, TypeScript, or SQL). Always analyze and explain Time and Space Complexity.
4. Contextual Guidance: If the user provides an interview report, resume, or job description details, ground your response in that data without fabricating facts.
5. Tone: Concise, encouraging, professional, and practical. Avoid unnecessary preamble; get straight to the helpful content.
6. Identity: You are InterviewAI, an AI interview prep assistant. Never claim to be a human interviewer.`;

/**
 * Generate a multi-turn chat response using Google Gemini
 * @param {Array} history - Array of { role: 'user' | 'assistant', content: string }
 * @param {Object} context - Optional context (e.g., report details, topic)
 */
async function generateAIResponse(history, context = null) {
    let systemPrompt = SYSTEM_INSTRUCTION;

    if (context && context.report) {
        systemPrompt += `\n\nActive Interview Report Context:
Title: ${context.report.title || 'Untitled'}
Match Score: ${context.report.matchScore}%
Skill Gaps: ${(context.report.skillGaps || []).map(g => `${g.skill} (${g.severity})`).join(', ') || 'None identified'}
Job Description Snippet: ${(context.report.jobDescription || '').slice(0, 500)}`;
    }

    if (context && context.topic) {
        systemPrompt += `\nTarget Focus Area: ${context.topic}`;
    }

    // Map conversation history to Gemini contents format
    const contents = history
        .filter(msg => msg && typeof msg.content === 'string' && msg.content.trim())
        .map((msg) => ({
            role: msg.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: msg.content }]
        }));

    if (contents.length === 0) {
        throw new Error("No valid message content to send to AI.");
    }

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents,
        config: {
            systemInstruction: systemPrompt,
            temperature: 0.7,
        }
    });

    if (!response.text) {
        throw new Error("Empty response received from Gemini.");
    }

    return response.text;
}

/**
 * Generate a concise conversation title from the first message
 * @param {string} text - First user message
 */
function deriveConversationTitle(text) {
    if (!text || typeof text !== 'string') return 'New AI Chat';

    const cleaned = text.replace(/[^a-zA-Z0-9\s]/g, ' ').trim();
    const words = cleaned.split(/\s+/).slice(0, 5).join(' ');

    if (!words) return 'New AI Chat';

    // Capitalize first letter of each word
    const title = words.replace(/\b\w/g, char => char.toUpperCase());
    return title.length > 36 ? title.substring(0, 36) + '...' : title;
}

module.exports = {
    generateAIResponse,
    deriveConversationTitle
};
