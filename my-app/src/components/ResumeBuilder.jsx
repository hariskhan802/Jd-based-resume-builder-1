'use client'
import ResumeForm from "@/components/ResumeForm";
import ResumeViewer from "@/components/ResumeViewer";
import { useState } from "react";

export default function ResumeBuilder() {
    const [resumeData, setResumeData] = useState({})
  return (
    <div >
        <ResumeForm setResumeData={setResumeData} />
        {
            Object.keys(resumeData).length >0 &&
            <ResumeViewer resumeData={resumeData} />
        }
    </div>
  );
}