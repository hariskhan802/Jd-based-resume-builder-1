'use client'

import React, { useMemo, useState } from 'react';

// Single-file React component for the editable resume
// Requirements: TailwindCSS in your React app (create-react-app or Vite)

// const initialData = {
//   name: 'Muhammad Haris',
//   jobTitle: 'Senior Full Stack Engineer',
//   contact: {
//     email: 'm.haris4561@gmail.com',
//     phone: '+92 344 0259952',
//     address: 'H#206 Zamanabad Karachi Pakistan',
//     linkedin: 'https://www.linkedin.com/in/muhammadharis802',
//     github: 'https://github.com/hariskhan802',
//     portfolio: 'https://haris-portfolio-five.vercel.app/'
//   },
//   summary:
//     'Senior Full-Stack Engineer with 9+ years building scalable SaaS products. Strong expertise in TypeScript, Node.js (NestJS), GraphQL, React.js, PostgreSQL, Redis, RabbitMQ, and AWS. Proven experience designing high-throughput transaction ingestion pipelines, configurable rule engines, real-time alerting dashboards, and case-management workflows for compliance teams.',
//   work_experience: [
//     {
//       role: 'Principal Full Stack Engineer',
//       company: 'GX Technologies',
//       start_date: 'Mar 2025',
//       end_date: 'Present',
//       responsibilities: [
//         'Architected and developed full-stack SaaS platforms using React, Node.js, Laravel, and AWS.',
//         'Designed scalable system architecture for high-volume data ingestion and user growth.',
//         'Built CI/CD pipelines using Docker and Kubernetes.',
//         'Designed backend APIs with authentication, rate-limiting, and caching.',
//         'Migrated applications to AWS Cloud using ECS, S3, CloudFront, and RDS.',
//         'Integrated Stripe, Twilio, OAuth, and other third-party services.',
//         'Led a distributed engineering team with Agile practices.',
//         'Mentored junior developers.',
//         'Collaborated on product roadmaps.',
//         'Ensured security, scalability, and maintainability through reviews and audits.'
//       ]
//     },
//     {
//       role: 'Principal Full Stack Engineer',
//       company: 'Codesy',
//       start_date: 'Feb 2024',
//       end_date: 'Feb 2025',
//       responsibilities: [
//         'Led end-to-end development of enterprise web platforms using Node.js, React, and AWS.',
//         'Designed modular microservices architecture.',
//         'Set up automated pipelines with GitHub Actions and Docker.',
//         'Enhanced system reliability with caching and load balancing.',
//         'Introduced best engineering practices.',
//         'Collaborated with product and business teams.',
//         'Improved developer onboarding through documentation and standards.'
//       ]
//     },
//     {
//       role: 'Lead Full Stack Engineer',
//       company: 'Lime Software',
//       start_date: 'Sep 2022',
//       end_date: 'Jan 2024',
//       responsibilities: [
//         'Rebuilt SaaS platform using React, Node.js, and AWS.',
//         'Designed REST and GraphQL APIs.',
//         'Developed React Native mobile app integrated with microservices.',
//         'Improved frontend performance through optimizations.',
//         'Migrated on-premise systems to AWS.',
//         'Worked with designers for responsive UI.',
//         'Built reusable components and shared service layers.',
//         'Implemented RBAC and audit logging.',
//         'Guided developers in Agile, code reviews, and DevOps.'
//       ]
//     },
//     {
//       role: 'Lead Full Stack Engineer',
//       company: 'Right Solutions',
//       start_date: 'May 2019',
//       end_date: 'Aug 2022',
//       responsibilities: [
//         'Modernized legacy e-commerce and business platforms.',
//         'Designed backend APIs with validation, caching, and monitoring.',
//         'Created analytics dashboards using React and Chart.js.',
//         'Developed mobile applications with React Native.',
//         'Enhanced security using OAuth, JWT, and SSL/TLS.',
//         'Automated deployments using AWS CodePipeline and Docker.',
//         'Implemented IaC using Terraform.',
//         'Collaborated with designers and QA teams.',
//         'Optimized SQL and Redis caching.',
//         'Mentored developers and established Git strategies.'
//       ]
//     },
//     {
//       role: 'Senior Software Engineer',
//       company: 'Kingdom Vision',
//       start_date: 'Mar 2017',
//       end_date: 'Apr 2019',
//       responsibilities: [
//         'Improved B2B applications with real-time analytics.',
//         'Developed React Native mobile apps.',
//         'Integrated Twilio APIs.',
//         'Provided scalable architecture consulting.',
//         'Enhanced deployments using Jenkins and Docker.'
//       ]
//     },
//     {
//       role: 'Full Stack Developer',
//       company: 'Poly Web Tech',
//       start_date: 'Apr 2016',
//       end_date: 'Feb 2017',
//       responsibilities: [
//         'Built CMS and e-commerce applications with PHP, JavaScript, and MySQL.',
//         'Integrated payment, shipping, and notification APIs.',
//         'Optimized server-side performance.',
//         'Provided maintenance and technical support.'
//       ]
//     }
//   ],
//   skills: {
//     programming_languages: ['JavaScript', 'TypeScript', 'PHP', 'SQL'],
//     frontend: ['React', 'Angular', 'Vue.js', 'Next.js', 'Nuxt.js', 'JQuery', 'AJAX', 'HTML5', 'CSS3', 'Bootstrap', 'Tailwind', 'Redux', 'Webpack', 'Vite'],
//     backend: ['Node.js', 'Express.js', 'NestJS', 'Laravel', 'Codeigniter', 'GraphQL', 'RESTful APIs', 'gRPC', 'SOAP', 'OAuth', 'WebSockets'],
//     databases: ['MySQL', 'PostgreSQL', 'SQL Server', 'MongoDB', 'Redis', 'DynamoDB', 'Firebase', 'Elasticsearch'],
//     cloud_devops: ['AWS', 'Azure', 'Google Cloud Platform', 'Docker', 'Kubernetes', 'GitHub Actions', 'CI/CD Pipelines', 'Serverless Architectures', 'Microservices', 'Distributed Systems', 'Cloud Migrations'],
//     ai: ['OpenAI API', 'Generative AI Integration'],
//     payment_and_communication: ['Stripe', 'Twilio', 'PayPal', 'Authorize.net', 'Square', 'Firebase Cloud Messaging'],
//     cms: ['WordPress']
//   },
//   languages: ['English']
// };

export default function ResumeEditable({resumeData={}}) {
//   const [data, setData] = useState(initialData);
  const [editable, setEditable] = useState(true);
  
//   const resumeIntialData = useMemo(() => {
//     const cleaned = safeResumeParse(resumeData)
    
//     return cleaned
//   }, [resumeData])

  function safeResumeParse(raw) {
  if (!raw || typeof raw !== 'string') return {};

  // 1. Remove code block markers (``` or ```json)
  let s = raw.replace(/```(?:json)?/gi, '').trim();

  // 2. If payload is wrapped like { "resume": "...." } and already JSON, try to parse it:
  try {
    return JSON.parse(s);
  } catch (e) {
    // fallthrough to cleaning heuristics
  }

  // 3. Remove stray trailing commas like: ["a", ] or { "a": 1, }
  s = s.replace(/,\s*([\]\}])/g, '$1');

  // 4. Specific fix: if an array was accidentally closed with "}," instead of "],"
  //    e.g.  "    }\n  },\n  \"skills\""  ->  "    }\n  ],\n  \"skills\""
  s = s.replace(/\}\s*,\s*\n\s*"([a-zA-Z0-9_]+)"\s*:/, ']\n  "$1":');

  // 5. Trim again and final parse attempt
  s = s.trim();
  try {
    return JSON.parse(s);
  } catch (err) {
    // helpful debug info so you can inspect the broken JSON and error position
    console.error('safeResumeParse: JSON.parse failed:', err.message);
    console.log('Preview of cleaned string (first 2000 chars):\n', s.slice(0, 2000));
    return {}; // return empty object instead of throwing in UI
  }
}


  function handleFieldChange(path, value) {
    setData(prev => {
      const copy = JSON.parse(JSON.stringify(prev));
      const parts = path.split('.');
      let cur = copy;
      for (let i = 0; i < parts.length - 1; i++) {
        cur = cur[parts[i]];
      }
      cur[parts[parts.length - 1]] = value;
      return copy;
    });
  }

  function handleExperienceChange(idx, field, value) {
    setData(prev => {
      const copy = JSON.parse(JSON.stringify(prev));
      copy.work_experience[idx][field] = value;
      return copy;
    });
  }

  function handleResponsibilityChange(expIdx, resIdx, value) {
    setData(prev => {
      const copy = JSON.parse(JSON.stringify(prev));
      copy.work_experience[expIdx].responsibilities[resIdx] = value;
      return copy;
    });
  }

  function addResponsibility(expIdx) {
    setData(prev => {
      const copy = JSON.parse(JSON.stringify(prev));
      copy.work_experience[expIdx].responsibilities.push('New responsibility');
      return copy;
    });
  }

  function addExperience() {
    setData(prev => {
      const copy = JSON.parse(JSON.stringify(prev));
      copy.work_experience.push({ role: 'New Role', company: 'Company', start_date: '', end_date: '', responsibilities: ['Responsibility 1'] });
      return copy;
    });
  }

  function removeExperience(idx) {
    setData(prev => {
      const copy = JSON.parse(JSON.stringify(prev));
      copy.work_experience.splice(idx, 1);
      return copy;
    });
  }

  function downloadJSON() {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = (resumeData.name || 'resume') + '.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  function reset() {
    if (!confirm('Reset to original data?')) return;
    setData(initialData);
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto bg-white shadow-xl rounded-2xl overflow-hidden">
        <div className="flex gap-6 p-8">
          <div className="flex-1">
            <h1
              className="text-3xl font-bold"
              contentEditable={editable}
              suppressContentEditableWarning
              onInput={e => handleFieldChange('name', e.currentTarget.textContent || '')}
            >
              {resumeData.name}
            </h1>
            <p
              className="text-gray-600 mt-1"
              contentEditable={editable}
              suppressContentEditableWarning
              onInput={e => handleFieldChange('jobTitle', e.currentTarget.textContent || '')}
            >
              {resumeData.jobTitle}
            </p>

            <div className="mt-4 flex flex-wrap gap-3 text-sm text-gray-700">
              <a href={`mailto:${resumeData.contact.email}`} className="chip px-3 py-1 rounded-full bg-gray-100">{resumeData.contact.email}</a>
              <span className="chip px-3 py-1 rounded-full bg-gray-100">{resumeData.contact.phone}</span>
              <a href={resumeData.contact.linkedin} target="_blank" rel="noreferrer" className="chip px-3 py-1 rounded-full bg-gray-100">Linkedin</a>
              <a href={resumeData.contact.github} target="_blank" rel="noreferrer" className="chip px-3 py-1 rounded-full bg-gray-100">Github</a>
              <a href={resumeData.contact.portfolio} target="_blank" rel="noreferrer" className="chip px-3 py-1 rounded-full bg-gray-100">Portfolio</a>
            </div>

            <div className="mt-6">
              <h2 className="font-semibold text-gray-800">Summary</h2>
              <p
                className="mt-2 text-gray-700"
                contentEditable={editable}
                suppressContentEditableWarning
                onInput={e => handleFieldChange('summary', e.currentTarget.textContent || '')}
              >
                {resumeData.summary}
              </p>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-800">Skills</h3>
                <div className="mt-3 text-sm text-gray-700">
                  <div><strong>Languages:</strong> {resumeData.skills.programming_languages.join(', ')}</div>
                  <div className="mt-1"><strong>Frontend:</strong> {resumeData.skills.frontend.join(', ')}</div>
                  <div className="mt-1"><strong>Backend:</strong> {resumeData.skills.backend.join(', ')}</div>
                  <div className="mt-1"><strong>DBs:</strong> {resumeData.skills.databases.join(', ')}</div>
                  <div className="mt-1"><strong>Cloud / DevOps:</strong> {resumeData.skills.cloud_devops.join(', ')}</div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-800">Languages</h3>
                <div className="mt-3 text-sm text-gray-700">{resumeData.languages.join(', ')}</div>

                <h3 className="font-semibold text-gray-800 mt-4">Contact</h3>
                <div className="mt-3 text-sm text-gray-700" contentEditable={editable} suppressContentEditableWarning onInput={e => handleFieldChange('contact.address', e.currentTarget.textContent || '')}>{resumeData.contact.address}</div>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="font-semibold text-gray-800">Experience</h3>
              <div className="mt-3 space-y-4 text-gray-700 text-sm">
                {resumeData.work_experience.map((exp, idx) => (
                  <div key={idx} className="p-3 bg-white rounded border">
                    <div className="flex justify-between items-start">
                      <div>
                        <div
                          className="text-sm font-semibold"
                          contentEditable={editable}
                          suppressContentEditableWarning
                          onInput={e => {
                            const text = e.currentTarget.textContent || '';
                            const parts = text.split('—').map(s => s.trim());
                            handleExperienceChange(idx, 'role', parts[0] || '');
                            if (parts[1]) handleExperienceChange(idx, 'company', parts[1]);
                          }}
                        >
                          {exp.role} — {exp.company}
                        </div>
                        <div
                          className="text-xs text-gray-500 mt-1"
                          contentEditable={editable}
                          suppressContentEditableWarning
                          onInput={e => {
                            const text = e.currentTarget.textContent || '';
                            const parts = text.split('—').map(s => s.trim());
                            handleExperienceChange(idx, 'start_date', parts[0] || '');
                            if (parts[1]) handleExperienceChange(idx, 'end_date', parts[1]);
                          }}
                        >
                          {exp.start_date} — {exp.end_date}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button className="text-xs px-2 py-1 border rounded" onClick={() => addResponsibility(idx)}>Add responsibility</button>
                        <button className="text-xs px-2 py-1 border rounded" onClick={() => removeExperience(idx)}>Remove</button>
                      </div>
                    </div>

                    <ul className="mt-2 text-sm space-y-1">
                      {exp.responsibilities.map((r, rIdx) => (
                        <li
                          key={rIdx}
                          contentEditable={editable}
                          suppressContentEditableWarning
                          onInput={e => handleResponsibilityChange(idx, rIdx, e.currentTarget.textContent?.replace(/^•\s*/, '') || '')}
                        >
                          • {r}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}

                <div className="mt-2">
                  <button className="px-3 py-2 rounded bg-indigo-600 text-white text-sm" onClick={addExperience}>Add Experience</button>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="font-semibold text-gray-800">Education</h3>
              <div className="mt-2 text-gray-700 text-sm">(Add your education here)</div>
            </div>

          </div>

          <aside className="w-56 p-4 bg-gray-50 hidden">
            <div className="sticky top-8">
              <h4 className="text-gray-600 font-medium">Quick Actions</h4>
              <div className="mt-3 flex flex-col gap-2">
                <button onClick={downloadJSON} className="px-3 py-2 rounded bg-indigo-600 text-white text-sm">Export JSON</button>
                <button onClick={() => window.print()} className="px-3 py-2 rounded border border-gray-300 text-sm">Download PDF / Print</button>
                <button onClick={reset} className="px-3 py-2 rounded border border-red-300 text-sm">Reset</button>
                <button onClick={() => setEditable(v => !v)} className="px-3 py-2 rounded border border-gray-300 text-sm">{editable ? 'Lock Editing' : 'Enable Editing'}</button>
              </div>

              <div className="mt-6">
                <h5 className="text-gray-600 text-sm font-medium">Tips</h5>
                <ul className="text-xs text-gray-600 mt-2 space-y-1">
                  <li>- Click any text to edit (when editing is enabled).</li>
                  <li>- Export JSON to save and re-import later.</li>
                  <li>- Use browser print to create a PDF.</li>
                </ul>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
