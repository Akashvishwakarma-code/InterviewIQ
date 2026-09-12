import fs from "fs"
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs"
import { askAi } from "../services/openRouter.services.js";

export const analyzeResume = async (req, res) => {
    let filepath = null;
    try {
        if (!req.file) {
            return res.status(400).json({ message: "Resume required" });
        }
        filepath = req.file.path;

        const fileBuffer = await fs.promises.readFile(filepath);
        const uint8Array = new Uint8Array(fileBuffer);
        const pdf = await pdfjsLib.getDocument({ data: uint8Array }).promise;

        let resumeText = "";
        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
            const page = await pdf.getPage(pageNum);
            const content = await page.getTextContent();
            const pageText = content.items.map(item => item.str).join(" ");
            resumeText += pageText + "\n";
        }

        resumeText = resumeText.replace(/\s+/g, " ").trim();

        if (!resumeText) {
            return res.status(400).json({ message: "Could not extract text from the resume. Please upload a text-based PDF." });
        }

        const messages = [
            {
                role: "system",
                content:
                `Extract structured data from resume.
                Return strictly JSON:
                {
                "role":"string",
                "experience":"string",
                "projects":["project1","project2"],
                "skills":["skill1","skill2"]
                }`
            },
            {
                role: "user",
                content: resumeText
            }
        ];

        const aiResponse = await askAi(messages);

        let cleanJson = aiResponse ? aiResponse.trim() : "";
        const jsonMatch = cleanJson.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            cleanJson = jsonMatch[0];
        }

        const parsed = JSON.parse(cleanJson);

        return res.json({
            role: parsed.role || "",
            experience: parsed.experience || "",
            projects: Array.isArray(parsed.projects) ? parsed.projects : [],
            skills: Array.isArray(parsed.skills) ? parsed.skills : [],
            resumeText
        });

    } catch (error) {
        console.error("Resume analysis error:", error);
        return res.status(500).json({ message: error.message || "Failed to analyze resume" });
    } finally {
        if (filepath && fs.existsSync(filepath)) {
            try {
                fs.unlinkSync(filepath);
            } catch (_) {}
        }
    }
}


export const generateQuestion = async ( req, res) => {
    try{
        const { role, experience, mode, resumeText, projects, skills} = req.body
        
        role=role?.trim();
        experience =experience?.trim();
        mode = mode?.trim();

        if(!role || experience || !mode){
            return res.status(400).json({message:"Role, Experience and Mode are required."})
        }
        const user = await User.findById(req.userId)

        if(!user){
            return res.status(404).json({
                message:"User not found."
            })
        }

        if(user.credits < 50){
            return res.status(400).json({
                message:"Not enough credits.Minimum 50 required."
            })
        }
        
        const projectText = Array.isArray(projects) && skills.length ? skils.join(", "):"None";
        const safeResume =resumeText?.trim() || "None";

        const userPrompt = `
        Role:${role}
        Experience:${experience}
        InterviewMode:${mode}
        Projects:${projectText}
        Skills:{skillsText}
        Resume:${safeResume}`;

        if (!userPrompt.trim()) {
            return res.status(400).json({message:"Prompt content is empty."});
        }
        const messages=[
            {
                role:"system",
                content:` 
                You are a real human interviewer conducting a professional interview.

                Speak in simple, natural English as if you are directly talking to the candidate.

                Generate exactly 5 interview questions.

                Strict Rules:
                - Each question must contain between 15 and 25 words.
                - Each question must be a single complete sentence.
                - Do Not number them.
                - Do Not add explanatinos.
                - Do Not add extra text before or after.
                - One question per line only.
                - Keep language simple and conversational.
                - Questions must feel practical and realistic.

                Difficulty progression:
                Question 1 -> easy
                Question 2 -> easy
                Question 3 -> medium 
                Question 4 -> medium
                Question 5 -> hard

                Make questions based on the candidate's role, experience, projects, InterviewMode, skills, and resume details.
                `
            },
            {
                role:"user",
                content:userPrompt
            }
        ]

    }catch(error){

    }
}