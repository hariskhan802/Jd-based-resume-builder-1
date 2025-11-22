'use client'
import { useState } from "react";
import axios from "axios";
const demoDesc= `Full job description
We are hiring a Principal Full Stack Architect (Java + React) with 7+ years of experience to design, develop, and maintain scalable software solutions for Supply Chain and warehouse management. The ideal candidate will have strong expertise in Java, Spring Boot, and React, along with cloud technologies, and the flexibility to work from 2 PM to 11 PM PKT to collaborate with global teams.

Responsibilities:

Develop full-stack software systems to support Supply Chain services and warehouse management.

Design, architect, and implement frontend (React) and backend (Java/Spring Boot) solutions for complex business problems.

Ensure the delivery of high-quality, scalable, and maintainable code with proper testing.

Document system designs and technical specifications.

Provide on-call support for production systems owned by the team.

Requirements:

5+ years of professional experience in full-stack development (Java + React).

Strong proficiency in Backend: Java, Spring Boot, Microservices, REST APIs and Frontend: React.js, JavaScript/TypeScript, modern UI frameworks

Experience with distributed systems and large-scale applications.

Expertise in incident management, debugging, and root cause analysis.

Hands-on experience with messaging systems (Kafka) and databases (SQL/NoSQL).

Proficiency in cloud platforms (AWS, Kubernetes); GCP is a plus.

Familiarity with CI/CD pipelines (GitLab, Terraform), logging (New Relic, Splunk), and observability tools.

Ability to design and articulate scalable system architectures.

Flexibility to work from 2 PM to 11 PM PKT for team collaboration.

Prior experience in Supply Chain is a plus.

We have an amazing team of 700+ individuals working on highly innovative enterprise projects & products. Our customer base includes Fortune 100 retail and CPG companies, leading store chains, fast-growth fintech, and multiple Silicon Valley startups.

What makes Confiz stand out is our focus on processes and culture. Confiz is ISO 9001:2015 (QMS), ISO 27001:2022 (ISMS), ISO 20000-1:2018 (ITSM), ISO 14001:2015 (EMS), ISO 45001:2018 (OHSMS) Certified. We have a vibrant culture of learning via collaboration and making workplace fun.

People who work with us work with cutting-edge technologies while contributing success to the company as well as to themselves.

To know more about Confiz Limited, visit: https://www.linkedin.com/company/confiz-pakistan/`
export default function ResumeForm({setResumeData = ()=>{} }) {
  const [jobDesc, setJobDesc] = useState(demoDesc);
  const [resume, setResume] = useState("");
  const [loading, setLoading] = useState(false);

  const generateResume = async () => {
    setLoading(true);
    // setResumeData("")
    try {
      const res = await axios.post("/api/generate-resume", { jobDescription: jobDesc });
      setResumeData(res.data.resume);
    } catch (err) {
      setResume("Error generating resume.");
    } finally {
      setLoading(false);
    }
  };

  const downloadResume = () => {
    const blob = new Blob([resume], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "resume.txt";
    link.click();
  };

  return (
    <div style={{ padding: 40, maxWidth: 800, margin: "auto" }}>
      <h1>OpenAI Resume Generator</h1>
      <textarea
        placeholder="Paste job description here..."
        value={jobDesc}
        onChange={(e) => setJobDesc(e.target.value)}
        style={{ width: "100%", height: 200, marginBottom: 20 }}
      />
      <button onClick={generateResume} disabled={loading}>
        {loading ? "Generating..." : "Generate Resume"}
      </button>

      {resume && (
        <>
          <button onClick={downloadResume} style={{ marginLeft: 10 }}>
            Download Resume
          </button>
          <pre style={{ whiteSpace: "pre-wrap", background: "#f4f4f4", padding: 20, marginTop: 20 }}>
            {resume}
          </pre>
        </>
      )}
    </div>
  );
}
