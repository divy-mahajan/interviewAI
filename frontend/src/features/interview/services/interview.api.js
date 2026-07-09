import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:3000",
    withCredentials: true,
})

export const generateInterviewReport = async ({selfDescription, jobDescription, resume}) => {

    const formData = new FormData()
    formData.append("selfDescription", selfDescription)
    formData.append("jobDescription", jobDescription)
    formData.append("resume", resume)

   const response = await api.post("/api/interview", formData)

   console.log(response.data)

    return response.data
}

/**
 * @description get interview report by id
 */
export const getInterviewReportById = async (interviewId) => {
    const response = await api.get(`/api/interview/report/${interviewId}`)
    console.log(response.data)
    return response.data
}

/**
 * @description get all interview reports of the user
 */
export const getAllInterviewReports = async () => {
    const response = await api.get("/api/interview")
    return response.data
}

/**
 * @description Service to generate resume pdf based on user self description, resume content and job description.
 */
export const generateResumePdf = async ({ interviewReportId }) => {
    const response = await api.post(`/api/interview/resume/pdf/${interviewReportId}`, null, {
        responseType: "blob"
    })

    return response.data
}