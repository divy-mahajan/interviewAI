const { GoogleGenAI, Type } = require("@google/genai");

const ai = new GoogleGenAI({
    apiKey: process.env.GOOGLE_GENAI_API_KEY,
});

const interviewReportSchema = {
    type: Type.OBJECT,
    properties: {
        title: {
            type: Type.STRING,
            description: "The title of the job.",
        },

        matchScore: {
            type: Type.NUMBER,
            description: "A score between 0 and 100 indicating how well the candidate matches the job.",
        },

        technicalQuestions: {
            type: Type.ARRAY,
            description: "Technical interview questions.",
            items: {
                type: Type.OBJECT,
                properties: {
                    question: {
                        type: Type.STRING,
                    },
                    intention: {
                        type: Type.STRING,
                    },
                    answer: {
                        type: Type.STRING,
                    },
                },
                required: ["question", "intention", "answer"],
            },
        },

        behavioralQuestions: {
            type: Type.ARRAY,
            description: "Behavioral interview questions.",
            items: {
                type: Type.OBJECT,
                properties: {
                    question: {
                        type: Type.STRING,
                    },
                    intention: {
                        type: Type.STRING,
                    },
                    answer: {
                        type: Type.STRING,
                    },
                },
                required: ["question", "intention", "answer"],
            },
        },

        skillGaps: {
            type: Type.ARRAY,
            description: "Skills the candidate should improve.",
            items: {
                type: Type.OBJECT,
                properties: {
                    skill: {
                        type: Type.STRING,
                    },
                    severity: {
                        type: Type.STRING,
                        enum: ["low", "medium", "high"],
                    },
                },
                required: ["skill", "severity"],
            },
        },

        preparationPlan: {
            type: Type.ARRAY,
            description: "Day-wise preparation plan.",
            items: {
                type: Type.OBJECT,
                properties: {
                    day: {
                        type: Type.NUMBER,
                    },
                    focus: {
                        type: Type.STRING,
                    },
                    tasks: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.STRING,
                        },
                    },
                },
                required: ["day", "focus", "tasks"],
            },
        },
    },

    required: [
        "title",
        "matchScore",
        "technicalQuestions",
        "behavioralQuestions",
        "skillGaps",
        "preparationPlan",
    ],
};

async function generateInterviewReport({
    resume,
    selfDescription,
    jobDescription,
}) {
    const prompt = `
You are an expert technical interviewer and career coach.

Analyze the candidate's resume, self-description, and the job description.

Generate ONLY valid JSON following the provided schema.

Resume:
${resume}

Self Description:
${selfDescription}

Job Description:
${jobDescription}

Instructions:
- Give an ATS match score out of 100.
- Generate 8-10 technical interview questions.
- Generate 5-7 behavioral interview questions.
- Identify all important skill gaps.
- Create a detailed 7-day preparation plan.
- Do not return markdown.
- Do not return explanations.
`;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: interviewReportSchema,
        },
    });

    if (!response.text) {
        throw new Error("Empty response received from Gemini.");
    }

    return JSON.parse(response.text);
}

module.exports = generateInterviewReport;