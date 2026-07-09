import {
    getAllInterviewReports,
    generateInterviewReport,
    getInterviewReportById,
    generateResumePdf
} from "../services/interview.api.js";

import { useContext } from "react";
import { InterviewContext } from "../interview.context.jsx";
import { useEffect } from "react";
import { useParams } from "react-router";

export const useInterview = () => {

    const context = useContext(InterviewContext);
    const { interviewId} = useParams()

    if (!context) {
        throw new Error("useInterview must be used within an InterviewProvider");
    }

    const {
        loading,
        setLoading,
        report,
        setReport,
        reports,
        setReports
    } = context;

    const generateReport = async ({ selfDescription, jobDescription, resume }) => {

        setLoading(true);

        try {

            const data = await generateInterviewReport({
                selfDescription,
                jobDescription,
                resume
            });

            console.log("API returned:", data);
            console.log("Setting report:", data.interviewReport);

            setReport(data.interviewReport);

            return data.interviewReport;

        } catch (err) {

            console.error(err);

            throw err;

        } finally {

            setLoading(false);

        }

    };

    const getReportById = async (interviewId) => {

        setLoading(true);

        let response = null

        try {

            response = await getInterviewReportById(interviewId);

            console.log(response);

            setReport(response.interviewReport);

        } catch (err) {

            console.error(err);

        } finally {

            setLoading(false);

        }
        return response.interviewReport

    };

    const getReports = async () => {

        setLoading(true);

        let response = null

        try {
            response = await getAllInterviewReports();
            setReports(response.interviewReports);

        } catch (err) {

            console.error(err);

        } finally {
            setLoading(false);
        }
        return response.interviewReports

    };

    const getResumePdf = async (interviewReportId) => {
        setLoading(true)
        let response = null
        try {
            response = await generateResumePdf({ interviewReportId })
            const url = window.URL.createObjectURL(new Blob([ response ], { type: "application/pdf" }))
            const link = document.createElement("a")
            link.href = url
            link.setAttribute("download", `resume_${interviewReportId}.pdf`)
            document.body.appendChild(link)
            link.click()
        }
        catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
            console.log("Interview ID:", interviewId);
            if (interviewId) {
                getReportById(interviewId)
            } else{
                getReports()
            }
        }, [ interviewId ])

    return {
        loading,
        report,
        reports,
        generateReport,
        getReportById,
        getReports,
        getResumePdf
    };

};