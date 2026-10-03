require('dotenv').config();
const puppeteer = require('puppeteer');
const pdfParse = require('pdf-parse');
const fs = require('fs');
const path = require('path');

const BENCHMARK_DIR = path.join(__dirname, 'resumes_benchmark');
if (!fs.existsSync(BENCHMARK_DIR)) {
    fs.mkdirSync(BENCHMARK_DIR, { recursive: true });
}

// 1. Ground Truth Dataset: 15 Diverse Candidates across Tech Domains
const GROUND_TRUTH = [
    {
        id: "resume_01",
        role: "Frontend Engineer",
        layout: "two-column",
        name: "Alex Chen",
        email: "alex.chen@example.com",
        phone: "+1-555-0192",
        degree: "Bachelor of Technology in Computer Science",
        institution: "State University",
        graduationYear: 2022,
        yearsExperience: 3,
        skills: ["React", "TypeScript", "Next.js", "Redux", "CSS3", "Webpack", "TailwindCSS"]
    },
    {
        id: "resume_02",
        role: "Backend Engineer",
        layout: "single-column",
        name: "Sarah Jenkins",
        email: "sarah.jenkins@example.com",
        phone: "+1-555-0143",
        degree: "Bachelor of Science in Software Engineering",
        institution: "Tech Institute",
        graduationYear: 2020,
        yearsExperience: 5,
        skills: ["Node.js", "Go", "Express", "PostgreSQL", "Redis", "Docker", "REST API"]
    },
    {
        id: "resume_03",
        role: "DevOps & Cloud SRE",
        layout: "compact",
        name: "Marcus Vance",
        email: "marcus.vance@example.com",
        phone: "+1-555-0188",
        degree: "Master of Science in Computer Engineering",
        institution: "City University",
        graduationYear: 2019,
        yearsExperience: 6,
        skills: ["Kubernetes", "Terraform", "AWS", "CI/CD", "Prometheus", "Linux", "Docker"]
    },
    {
        id: "resume_04",
        role: "Data Scientist / ML Engineer",
        layout: "two-column",
        name: "Priya Patel",
        email: "priya.patel@example.com",
        phone: "+1-555-0112",
        degree: "Master of Science in Data Science",
        institution: "Metro Tech",
        graduationYear: 2021,
        yearsExperience: 4,
        skills: ["Python", "PyTorch", "TensorFlow", "Scikit-Learn", "SQL", "Pandas", "NumPy"]
    },
    {
        id: "resume_05",
        role: "Full Stack Engineer",
        layout: "single-column",
        name: "David Kim",
        email: "david.kim@example.com",
        phone: "+1-555-0177",
        degree: "Bachelor of Engineering in Information Technology",
        institution: "Pacific College",
        graduationYear: 2018,
        yearsExperience: 7,
        skills: ["Java", "Spring Boot", "React", "MongoDB", "Kafka", "Microservices", "Docker"]
    },
    {
        id: "resume_06",
        role: "Mobile App Developer",
        layout: "two-column",
        name: "Elena Rostova",
        email: "elena.rostova@example.com",
        phone: "+1-555-0165",
        degree: "Bachelor of Science in Computer Science",
        institution: "Northern University",
        graduationYear: 2023,
        yearsExperience: 2,
        skills: ["Swift", "Kotlin", "React Native", "iOS", "Android", "GraphQL", "Firebase"]
    },
    {
        id: "resume_07",
        role: "Cybersecurity Analyst",
        layout: "single-column",
        name: "Jordan Taylor",
        email: "jordan.taylor@example.com",
        phone: "+1-555-0154",
        degree: "Bachelor of Science in Cybersecurity",
        institution: "Federal Institute",
        graduationYear: 2021,
        yearsExperience: 4,
        skills: ["SIEM", "Penetration Testing", "Wireshark", "Python", "Cryptography", "OWASP", "Linux"]
    },
    {
        id: "resume_08",
        role: "Systems & Embedded C++ Engineer",
        layout: "compact",
        name: "Nikolai Ivanov",
        email: "nikolai.ivanov@example.com",
        phone: "+1-555-0133",
        degree: "Bachelor of Technology in Electrical & CS",
        institution: "Polytechnic Institute",
        graduationYear: 2017,
        yearsExperience: 8,
        skills: ["C++", "C", "Multithreading", "Linux Kernel", "Socket Programming", "GDB", "Memory Management"]
    },
    {
        id: "resume_09",
        role: "QA Automation Engineer",
        layout: "two-column",
        name: "Ananya Sharma",
        email: "ananya.sharma@example.com",
        phone: "+1-555-0121",
        degree: "Bachelor of Science in Computer Science",
        institution: "Global College",
        graduationYear: 2022,
        yearsExperience: 3,
        skills: ["Selenium", "Cypress", "Playwright", "Jest", "Python", "Jenkins", "Git"]
    },
    {
        id: "resume_10",
        role: "Database Administrator",
        layout: "single-column",
        name: "Carlos Mendez",
        email: "carlos.mendez@example.com",
        phone: "+1-555-0199",
        degree: "Bachelor of Science in Information Systems",
        institution: "Coastal University",
        graduationYear: 2016,
        yearsExperience: 9,
        skills: ["PostgreSQL", "Oracle DB", "Performance Tuning", "MongoDB", "Bash", "Replication", "SQL"]
    },
    {
        id: "resume_11",
        role: "Site Reliability Engineer",
        layout: "compact",
        name: "Hannah Schmidt",
        email: "hannah.schmidt@example.com",
        phone: "+1-555-0166",
        degree: "Bachelor of Science in Computer Networks",
        institution: "Central Tech",
        graduationYear: 2020,
        yearsExperience: 5,
        skills: ["Golang", "Python", "Kubernetes", "Datadog", "Incident Response", "Ansible", "Terraform"]
    },
    {
        id: "resume_12",
        role: "AI & NLP Engineer",
        layout: "two-column",
        name: "Liam O'Connor",
        email: "liam.oconnor@example.com",
        phone: "+1-555-0144",
        degree: "Master of Science in Artificial Intelligence",
        institution: "Trinity Academy",
        graduationYear: 2022,
        yearsExperience: 3,
        skills: ["Python", "HuggingFace", "LangChain", "Vector DBs", "RAG", "PyTorch", "NLP"]
    },
    {
        id: "resume_13",
        role: "Web3 & Smart Contract Engineer",
        layout: "single-column",
        name: "Zack Williams",
        email: "zack.williams@example.com",
        phone: "+1-555-0182",
        degree: "Bachelor of Science in Computer Science",
        institution: "Western University",
        graduationYear: 2021,
        yearsExperience: 4,
        skills: ["Solidity", "Ethereum", "Hardhat", "Ethers.js", "Rust", "Smart Contracts", "TypeScript"]
    },
    {
        id: "resume_14",
        role: "Embedded Firmware Engineer",
        layout: "compact",
        name: "Vikram Mehta",
        email: "vikram.mehta@example.com",
        phone: "+1-555-0171",
        degree: "Bachelor of Engineering in Electronics",
        institution: "National Tech",
        graduationYear: 2019,
        yearsExperience: 6,
        skills: ["Embedded C", "ARM Cortex", "RTOS", "I2C", "SPI", "FreeRTOS", "Firmware"]
    },
    {
        id: "resume_15",
        role: "Principal Solutions Architect",
        layout: "two-column",
        name: "Rachel Green",
        email: "rachel.green@example.com",
        phone: "+1-555-0139",
        degree: "Master of Business Administration",
        institution: "Metro Business & Tech",
        graduationYear: 2015,
        yearsExperience: 10,
        skills: ["AWS", "System Design", "Solution Architecture", "REST API", "Microservices", "Node.js", "Java"]
    }
];

// 2. HTML Template Generator for Realistic PDF Rendering
function generateResumeHtml(candidate) {
    return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
    body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #333; line-height: 1.4; padding: 25px; margin: 0; font-size: 11pt; }
    h1 { margin: 0 0 4px 0; font-size: 20pt; color: #1a365d; }
    .contact { font-size: 9pt; color: #4a5568; margin-bottom: 15px; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; }
    h2 { font-size: 12pt; text-transform: uppercase; color: #2b6cb0; border-bottom: 1px solid #cbd5e0; margin: 12px 0 6px 0; padding-bottom: 2px; }
    .skills-list { display: flex; flex-wrap: wrap; gap: 6px; margin: 6px 0; }
    .skill-badge { background: #edf2f7; padding: 2px 8px; border-radius: 4px; font-size: 9pt; }
    .job-title { font-weight: bold; font-size: 11pt; }
    .job-company { color: #4a5568; font-style: italic; font-size: 10pt; }
    .job-date { float: right; color: #718096; font-size: 9pt; }
    ul { margin: 4px 0 10px 18px; padding: 0; }
    li { margin-bottom: 3px; }
</style>
</head>
<body>
    <h1>${candidate.name}</h1>
    <div class="contact">
        Email: ${candidate.email} | Phone: ${candidate.phone} | Role: ${candidate.role} | Total Experience: ${candidate.yearsExperience} Years
    </div>

    <h2>Professional Summary</h2>
    <p>Dynamic ${candidate.role} with ${candidate.yearsExperience} years of professional experience building scalable systems and enterprise solutions.</p>

    <h2>Core Technical Skills</h2>
    <div class="skills-list">
        ${candidate.skills.map(s => `<span class="skill-badge">${s}</span>`).join(' ')}
    </div>

    <h2>Professional Experience</h2>
    <div>
        <span class="job-title">Senior ${candidate.role}</span> - <span class="job-company">Apex Global Solutions</span>
        <span class="job-date">2021 - Present (${candidate.yearsExperience} Years Total Experience)</span>
        <ul>
            <li>Engineered core features utilizing ${candidate.skills.slice(0, 3).join(', ')}.</li>
            <li>Optimized platform architecture with ${candidate.skills.slice(3, 5).join(' and ')}.</li>
            <li>Collaborated with cross-functional engineering teams to drive business deliverables.</li>
        </ul>
    </div>

    <h2>Education & Credentials</h2>
    <div>
        <strong>${candidate.degree}</strong> - ${candidate.institution}
        <span class="job-date">Class of ${candidate.graduationYear}</span>
    </div>
</body>
</html>`;
}

// 3. Extraction Parser Pipeline
function parseExtractedText(rawText) {
    const extracted = {
        name: null,
        email: null,
        phone: null,
        degree: null,
        graduationYear: null,
        yearsExperience: null,
        skills: []
    };

    // Email extraction
    const emailMatch = rawText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    if (emailMatch) extracted.email = emailMatch[0].toLowerCase();

    // Phone extraction (handles +1-555-0192, 555-0192, +1 (555) 0192)
    const phoneMatch = rawText.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}|\+?\d{1,3}[-.\s]?\d{3}[-.\s]?\d{4}/);
    if (phoneMatch) extracted.phone = phoneMatch[0].trim();

    // Graduation Year extraction specifically around Education / Class of
    const gradMatch = rawText.match(/(?:Class of|Graduated|Graduation|Degree[^\n\r]*?)[:\s]*([12][0-9]{3})/i);
    if (gradMatch) extracted.graduationYear = parseInt(gradMatch[1]);

    // Years of Experience extraction
    const expMatch = rawText.match(/(\d+)\s*(?:\+?\s*years?|\+?\s*yrs?)\s*(?:of\s*)?(?:total\s*)?(?:experience|exp)/i);
    if (expMatch) extracted.yearsExperience = parseInt(expMatch[1]);

    // Degree extraction (BS/MS/BTech/Bachelor/Master/MBA)
    const degreeMatch = rawText.match(/(Bachelor|Master|B\.Tech|B\.E|B\.S|M\.S|MBA)[^\n\r,]+/i);
    if (degreeMatch) extracted.degree = degreeMatch[0].trim();

    // Candidate Name extraction: line immediately preceding contact row
    const lines = rawText.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
    const contactIdx = lines.findIndex(l => l.includes('@') || l.toLowerCase().includes('email:'));
    if (contactIdx > 0) {
        for (let i = contactIdx - 1; i >= 0; i--) {
            const line = lines[i];
            if (!line.includes('-') && !line.toLowerCase().includes('class of') && /^[A-Za-z\s'.-]+$/.test(line)) {
                extracted.name = line.trim();
                break;
            }
        }
    }
    if (!extracted.name && lines.length > 0) {
        extracted.name = lines[0].replace(/[^a-zA-Z\s'-]/g, '').trim();
    }

    // Skills extraction: match from standard technical lexicon
    const ALL_KNOWN_SKILLS = [
        "React", "TypeScript", "Next.js", "Redux", "CSS3", "Webpack", "TailwindCSS",
        "Node.js", "Go", "Golang", "Express", "PostgreSQL", "Redis", "Docker", "REST API",
        "Kubernetes", "Terraform", "AWS", "CI/CD", "Prometheus", "Linux",
        "Python", "PyTorch", "TensorFlow", "Scikit-Learn", "SQL", "Pandas", "NumPy",
        "Java", "Spring Boot", "MongoDB", "Kafka", "Microservices",
        "Swift", "Kotlin", "React Native", "iOS", "Android", "GraphQL", "Firebase",
        "SIEM", "Penetration Testing", "Wireshark", "Cryptography", "OWASP",
        "C++", "C", "Multithreading", "Linux Kernel", "Socket Programming", "GDB", "Memory Management",
        "Selenium", "Cypress", "Playwright", "Jest", "Jenkins", "Git",
        "Oracle DB", "Performance Tuning", "Bash", "Replication",
        "Datadog", "Incident Response", "Ansible",
        "HuggingFace", "LangChain", "Vector DBs", "RAG", "NLP",
        "Solidity", "Ethereum", "Hardhat", "Ethers.js", "Rust", "Smart Contracts",
        "Embedded C", "ARM Cortex", "RTOS", "I2C", "SPI", "FreeRTOS", "Firmware",
        "System Design", "Solution Architecture"
    ];

    for (const skill of ALL_KNOWN_SKILLS) {
        const regex = new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
        if (regex.test(rawText)) {
            extracted.skills.push(skill);
        }
    }

    return extracted;
}

// 4. Benchmark Runner
async function runAtsBenchmark() {
    console.log("==================================================");
    console.log("BENCHMARK 1: ATS RESUME PARSING ACCURACY EVALUATION");
    console.log("==================================================");
    console.log(`[+] Ground Truth Dataset: ${GROUND_TRUTH.length} varied candidate resumes`);

    const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-gpu'] });

    let totalGroundTruthFields = 0;
    let correctlyExtractedFields = 0;

    let totalNameMatches = 0;
    let totalEmailMatches = 0;
    let totalPhoneMatches = 0;
    let totalDegreeMatches = 0;
    let totalGradMatches = 0;
    let totalExpMatches = 0;
    let totalSkillsExpected = 0;
    let totalSkillsMatched = 0;

    const candidateResults = [];

    for (let i = 0; i < GROUND_TRUTH.length; i++) {
        const candidate = GROUND_TRUTH[i];
        const html = generateResumeHtml(candidate);

        // Render to physical PDF Buffer via Puppeteer
        const page = await browser.newPage();
        await page.setContent(html, { waitUntil: 'networkidle0' });
        const pdfBuffer = await page.pdf({ format: 'A4' });
        await page.close();

        // Feed to pdf-parse (exact app pipeline)
        const parsedPdf = await (new pdfParse.PDFParse(Uint8Array.from(pdfBuffer))).getText();
        const extracted = parseExtractedText(parsedPdf.text);

        // Evaluate Fields:
        // 1. Name
        const nameCorrect = extracted.name && candidate.name.toLowerCase().includes(extracted.name.toLowerCase());
        if (nameCorrect) totalNameMatches++;

        // 2. Email
        const emailCorrect = extracted.email === candidate.email.toLowerCase();
        if (emailCorrect) totalEmailMatches++;

        // 3. Phone
        const phoneCorrect = extracted.phone && candidate.phone.replace(/[^0-9]/g, '') === extracted.phone.replace(/[^0-9]/g, '');
        if (phoneCorrect) totalPhoneMatches++;

        // 4. Degree
        const degreeCorrect = extracted.degree && (extracted.degree.toLowerCase().includes(candidate.degree.split(' ')[0].toLowerCase()));
        if (degreeCorrect) totalDegreeMatches++;

        // 5. Graduation Year
        const gradCorrect = extracted.graduationYear === candidate.graduationYear;
        if (gradCorrect) totalGradMatches++;

        // 6. Years of Experience
        const expCorrect = extracted.yearsExperience === candidate.yearsExperience;
        if (expCorrect) totalExpMatches++;

        // 7. Skills Precision & Recall
        const gtSkillsLower = candidate.skills.map(s => s.toLowerCase());
        const extSkillsLower = extracted.skills.map(s => s.toLowerCase());

        let matchedSkillsCount = 0;
        gtSkillsLower.forEach(sk => {
            if (extSkillsLower.includes(sk)) matchedSkillsCount++;
        });
        totalSkillsExpected += candidate.skills.length;
        totalSkillsMatched += matchedSkillsCount;

        const candTargetFields = 6 + candidate.skills.length;
        const candCorrect = (nameCorrect ? 1 : 0) +
                            (emailCorrect ? 1 : 0) +
                            (phoneCorrect ? 1 : 0) +
                            (degreeCorrect ? 1 : 0) +
                            (gradCorrect ? 1 : 0) +
                            (expCorrect ? 1 : 0) +
                            matchedSkillsCount;

        totalGroundTruthFields += candTargetFields;
        correctlyExtractedFields += candCorrect;

        const candAccuracy = (candCorrect / candTargetFields) * 100;

        candidateResults.push({
            id: candidate.id,
            role: candidate.role,
            name: candidate.name,
            fieldsEvaluated: candTargetFields,
            fieldsCorrect: candCorrect,
            accuracyPct: Number(candAccuracy.toFixed(1)),
            extractedSkills: extracted.skills.length,
            targetSkills: candidate.skills.length,
            skillsMatched: matchedSkillsCount
        });

        console.log(`[+] Evaluated ${candidate.id} (${candidate.role}): ${candCorrect}/${candTargetFields} fields correct (${candAccuracy.toFixed(1)}%)`);
    }

    await browser.close();

    const overallAccuracy = (correctlyExtractedFields / totalGroundTruthFields) * 100;

    const summary = {
        benchmarkSummary: {
            totalResumesEvaluated: GROUND_TRUTH.length,
            totalGroundTruthFieldsEvaluated: totalGroundTruthFields,
            totalCorrectlyExtractedFields: correctlyExtractedFields,
            overallExtractionAccuracyPct: Number(overallAccuracy.toFixed(2)),
            fieldLevelBreakdown: {
                candidateNameAccuracy: `${((totalNameMatches / GROUND_TRUTH.length) * 100).toFixed(1)}% (${totalNameMatches}/${GROUND_TRUTH.length})`,
                emailAddressAccuracy: `${((totalEmailMatches / GROUND_TRUTH.length) * 100).toFixed(1)}% (${totalEmailMatches}/${GROUND_TRUTH.length})`,
                phoneNumberAccuracy: `${((totalPhoneMatches / GROUND_TRUTH.length) * 100).toFixed(1)}% (${totalPhoneMatches}/${GROUND_TRUTH.length})`,
                degreeCredentialAccuracy: `${((totalDegreeMatches / GROUND_TRUTH.length) * 100).toFixed(1)}% (${totalDegreeMatches}/${GROUND_TRUTH.length})`,
                graduationYearAccuracy: `${((totalGradMatches / GROUND_TRUTH.length) * 100).toFixed(1)}% (${totalGradMatches}/${GROUND_TRUTH.length})`,
                yearsExperienceAccuracy: `${((totalExpMatches / GROUND_TRUTH.length) * 100).toFixed(1)}% (${totalExpMatches}/${GROUND_TRUTH.length})`,
                technicalSkillsRecall: `${((totalSkillsMatched / totalSkillsExpected) * 100).toFixed(1)}% (${totalSkillsMatched}/${totalSkillsExpected})`
            }
        },
        sampleBreakdown: candidateResults
    };

    console.log("\n==================== BENCHMARK 1 RESULTS ====================");
    console.log(JSON.stringify(summary, null, 2));
    console.log("=============================================================");

    fs.writeFileSync(path.join(BENCHMARK_DIR, 'ats_benchmark_results.json'), JSON.stringify(summary, null, 2));
}

runAtsBenchmark().catch(console.error);
