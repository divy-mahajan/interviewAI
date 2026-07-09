const { GoogleGenAI, Type } = require("@google/genai");
const puppeteer = require("puppeteer")

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
};

async function generatePdfFromHtml(htmlContent) {
    const browser = await puppeteer.launch({
        headless: true,
        args: [
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--disable-dev-shm-usage",
            "--disable-gpu"
        ]
    });
    try {
        const page = await browser.newPage();

        // Standard desktop viewport
        await page.setViewport({
            width: 1280,
            height: 1800,
            deviceScaleFactor: 1
        });

        // Load the HTML
        await page.setContent(htmlContent, {
            waitUntil: "networkidle0"
        });

        // Generate PDF
        const pdfBuffer = await page.pdf({
            format: "A4",
            printBackground: true,
            preferCSSPageSize: true,
            displayHeaderFooter: false,
            margin: {
                top: "20mm",
                bottom: "20mm",
                left: "15mm",
                right: "15mm"
            }
        });

        return pdfBuffer;

    } finally {
        await browser.close();
    }
}

async function generateResumePdf({ resume, selfDescription, jobDescription }) {

    const prompt =`Generate resume for a candidate with the following details:
                        Resume: ${resume}
                        Self Description: ${selfDescription}
                        Job Description: ${jobDescription}

                        the response should be a JSON object with a single field "html" which contains the HTML content of the resume which can be converted to PDF using any library like puppeteer.
                        The resume should be tailored for the given job description and should highlight the candidate's strengths and relevant experience. The HTML content should be well-formatted and structured, making it easy to read and visually appealing.
                        The content of resume should be not sound like it's generated by AI and should be as close as possible to a real human-written resume.
                        you can highlight the content using some colors or different font styles but the overall design should be simple and professional.
                        The content should be ATS friendly, i.e. it should be easily parsable by ATS systems without losing important information.
                        The resume should not be so lengthy, it should ideally be 1-2 pages long when converted to PDF. Focus on quality rather than quantity and make sure to include all the relevant information that can increase the candidate's chances of getting an interview call for the given job description.
                    `;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json"
        }
    });

    const { html } = JSON.parse(response.text);

    const pdfBuffer = await generatePdfFromHtml(html);

    return pdfBuffer;
}
module.exports = {generateInterviewReport, generateResumePdf};