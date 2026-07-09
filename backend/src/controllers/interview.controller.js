const pdfParse = require("pdf-parse")
const generate = require("../services/ai.service")
const {generateInterviewReport, generateResumePdf} = require("../services/ai.service")
const interviewReportModel = require("../models/interviewReport.model")

/**
 * @description generate new interview report on the basis of user self description, resume pdf, job description
 */
async function generateInterviewReportController(req, res) {
    const resumeFile = req.file
    console.log(req.file)
    const resumeContent = await (new pdfParse.PDFParse((Uint8Array.from(req.file.buffer)))).getText()
    const {selfDescription, jobDescription} = req.body

    const interviewReportByAi = await generateInterviewReport({
        resume: resumeContent.text,
        selfDescription,
        jobDescription
    })

    const interviewReport = await interviewReportModel.create({
        user: req.user.id,
        resume: resumeContent.text,
        selfDescription,
        jobDescription,
        ...interviewReportByAi
    })

    res.status(201).json({
        message: "Interview report generated successfully",
        interviewReport
    })
}

/**
 * @description get interview report by id
 */
async function getInterviewReportByIdController(req, res) {
    const {interviewId} = req.params

    const interviewReport = await interviewReportModel.findById(interviewId)
    if(!interviewReport) {
        return res.status(404).json({
            message: "Interview report not found"
        })
    }

    return res.status(200).json({
        message: "Interview report fetched successfully",
        interviewReport
    })
}


/**
 * @description get all interview reports of the user
 */
async function getAllInterviewReportsController(req, res) {
    const interviewReports = await interviewReportModel.find({user: req.user.id}).sort({createdAt: -1}).select("-resume -selfDescription -jobDescription -_v -technicalQuestions -behavioralQuestions -skillGaps")

    return res.status(200).json({
        message: "Interview reports fetched successfully",
        interviewReports
    })
}

/**
 * @description Controller to generate resume PDF based on user self description, resume and job description.
 */
async function generateResumePdfController(req, res) {
    const { interviewReportId } = req.params

    const interviewReport = await interviewReportModel.findById(interviewReportId)

    if (!interviewReport) {
        return res.status(404).json({
            message: "Interview report not found."
        })
    }

    const { resume, jobDescription, selfDescription } = interviewReport

    const pdfBuffer = await generateResumePdf({ resume, jobDescription, selfDescription })

    res.set({
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename=resume_${interviewReportId}.pdf`
    })

    res.send(pdfBuffer)
}


module.exports = {generateInterviewReportController, getInterviewReportByIdController, getAllInterviewReportsController, generateResumePdfController}