const mongoose =  require('mongoose')

/**
 * - job descripton schema : String
 * - resume text : String
 * - self description : String
 * 
 * - matchScore : Number
 * - technical question : 
 *          [{
 *             question : "String,"
 *             answer : "String",
 *             intention : "String",
 * }]
 * - behavioral question : 
 * [{
 *             question : "String,"
 *             answer : "String",
 *             intention : "String",
 * }]
 * - skill gaps : [{
 *           skill : "String,",
 * severity: {
 *          type: String,
 *         enum: ['low', 'medium', 'high'],}
 * }]
 * - preparation plan :[{
 *            day : NUmber,
 *           focus : "String"
 *             tasks: [String]
 * }]
 */

const technicalQuestionSchema = new mongoose.Schema({
    question: {
        type: String,
        required: [true, "Question is required"]
    },
    intention: {
        type: String,
        required: [true, "Intention is required"]
    },
    answer: {
        type: String,
        required: [true, "Answer is required"]
    }
}, {
    _id: false
})

const behavioralQuestionSchema = new mongoose.Schema({
     question: {
        type: String,
        required: [true, "Question is required"]
    },
    intention: {
        type: String,
        required: [true, "Intention is required"]
    },
    answer: {
        type: String,
        required: [true, "Answer is required"]
    }
}, {
    _id: false
})

const skillGapSchema = new mongoose.Schema({
    skill: {
        type: String, 
        required: [true, "Skill is required"]
    },
    severity: {
        type: String,
        enum: ['low', 'medium', 'high'],
        required: [true, "Severity is required"]
    }
}, {
    _id: false
})

const preparationPlanSchema = new mongoose.Schema({
    day: {
        type: Number,
        required: [true, "Day is required"]
    },
    focus: {
        type: String,
        required: [true, "Focus is required"]
    },
    tasks: [
        {
            type: String,
            required: [true, "Task is required"]
        }
    ]
})

const interviewReportSchema = new mongoose.Schema({
    jobDescription: {
        type: String,
        required: [true, "Job description is required"]
    },
    resume: {
        type: String,
    },
    selfDescription: {
        type: String,
    },
    matchScore: {
        type: Number,
        min: 0,
        max: 100,
    },
    technicalQuestions: [technicalQuestionSchema],
    behavioralQuestions: [behavioralQuestionSchema],
    skillGaps: [skillGapSchema],
    preparationPlan: [preparationPlanSchema],
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "users"
    }

}, {
    timestamps: true
})

const interviewReportModel = mongoose.model('InterviewReport', interviewReportSchema)

module.exports = interviewReportModel;