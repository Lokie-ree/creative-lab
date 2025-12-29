import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Mail, Phone } from "lucide-react"

interface ResumeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const EDUCATION = [
  {
    degree: "M.Ed. Educational Leadership",
    institution: "American College of Education",
    year: "2016",
  },
  {
    degree: "M.S. Mathematics",
    institution: "Nicholls State University",
    year: "2013",
  },
  {
    degree: "B.S. Mathematics",
    institution: "Nicholls State University",
    year: "2010",
  },
]

const EXPERIENCE = [
  {
    position: "Math Teacher & Technology Facilitator",
    organization: "Iberville Virtual Learning Academy",
    years: "2024–Present",
    bullets: [
      "Designed and delivered virtual mathematics instruction for grades 6-12",
      "Implemented technology solutions to enhance remote learning engagement",
      "Developed interactive digital curriculum aligned with state standards",
    ],
  },
  {
    position: "504 Coordinator & STEM Teacher",
    organization: "Crescent Elementary School",
    years: "2023–2024",
    bullets: [
      "Managed 504 accommodations for students with diverse learning needs",
      "Created hands-on STEM activities integrating math concepts",
      "Collaborated with faculty on inclusive teaching strategies",
    ],
  },
  {
    position: "Mentor Teacher",
    organization: "White Castle High School",
    years: "2019–2023",
    bullets: [
      "Mentored new teachers in classroom management and curriculum design",
      "Led professional development workshops on math instruction",
      "Coordinated vertical alignment of mathematics curriculum",
    ],
  },
  {
    position: "Mathematics Teacher",
    organization: "Vandebilt Catholic High School",
    years: "2010–2019",
    bullets: [
      "Taught Algebra I/II, Geometry, Pre-Calculus, and AP Calculus",
      "Developed technology-enhanced lessons using interactive tools",
      "Coached math competition teams to regional success",
    ],
  },
]

const TECH_SKILLS = [
  "TypeScript",
  "React",
  "Next.js",
  "React Three Fiber",
  "Three.js",
  "GSAP",
  "Tailwind CSS",
  "Node.js",
  "Convex",
  "Vercel",
  "GitHub",
]

const PROJECTS = [
  {
    name: "Pelican AI",
    description: "AI coaching platform for Louisiana educators",
  },
  {
    name: "Sine/Cosine Module",
    description: "Interactive discovery-based learning",
  },
]

export function ResumeDialog({ open, onOpenChange }: ResumeDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto bg-zinc-900 border-zinc-800 text-zinc-100">
        <DialogHeader className="text-center pb-4 border-b border-zinc-800">
          <DialogTitle className="text-2xl font-semibold text-white">
            Randall LaPoint, Jr.
          </DialogTitle>
          <p className="text-zinc-400 mt-1">
            Math Educator • Full-Stack Developer • Learning Designer
          </p>
          <div className="flex items-center justify-center gap-4 mt-3 text-sm text-zinc-500">
            <a
              href="mailto:rplapointjr@gmail.com"
              className="flex items-center gap-1 hover:text-cyan-400 transition-colors"
            >
              <Mail className="w-4 h-4" />
              rplapointjr@gmail.com
            </a>
            <span className="flex items-center gap-1">
              <Phone className="w-4 h-4" />
              (985) 518-9129
            </span>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Education */}
          <section>
            <h3 className="text-sm font-semibold text-cyan-400 uppercase tracking-wide mb-3">
              Education
            </h3>
            <div className="space-y-3">
              {EDUCATION.map((edu, i) => (
                <div key={i} className="flex justify-between items-start">
                  <div>
                    <p className="text-white font-medium">{edu.degree}</p>
                    <p className="text-sm text-zinc-500">{edu.institution}</p>
                  </div>
                  <span className="text-sm text-zinc-500">{edu.year}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Experience */}
          <section>
            <h3 className="text-sm font-semibold text-cyan-400 uppercase tracking-wide mb-3">
              Experience
            </h3>
            <div className="space-y-5">
              {EXPERIENCE.map((exp, i) => (
                <div key={i}>
                  <div className="flex justify-between items-start mb-1">
                    <div>
                      <p className="text-white font-medium">{exp.position}</p>
                      <p className="text-sm text-zinc-500">{exp.organization}</p>
                    </div>
                    <span className="text-sm text-zinc-500 shrink-0 ml-4">
                      {exp.years}
                    </span>
                  </div>
                  <ul className="mt-2 space-y-1">
                    {exp.bullets.map((bullet, j) => (
                      <li key={j} className="text-sm text-zinc-400 pl-4 relative">
                        <span className="absolute left-0">•</span>
                        {bullet}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          {/* Technical Skills */}
          <section>
            <h3 className="text-sm font-semibold text-cyan-400 uppercase tracking-wide mb-3">
              Technical Skills
            </h3>
            <div className="flex flex-wrap gap-2">
              {TECH_SKILLS.map((skill) => (
                <Badge
                  key={skill}
                  variant="secondary"
                  className="bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                >
                  {skill}
                </Badge>
              ))}
            </div>
          </section>

          {/* Projects */}
          <section>
            <h3 className="text-sm font-semibold text-cyan-400 uppercase tracking-wide mb-3">
              Projects
            </h3>
            <div className="space-y-2">
              {PROJECTS.map((project) => (
                <div key={project.name} className="flex items-baseline gap-2">
                  <span className="text-white font-medium">{project.name}</span>
                  <span className="text-zinc-500">—</span>
                  <span className="text-sm text-zinc-400">{project.description}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  )
}
