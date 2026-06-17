export interface Prompt {
  text: string;
  section?: string;
}

export const bestPrompts: Record<string, Prompt[]> = {
  general: [
    { text: "Explain [topic] like I'm a smart 15-year-old. Give 3 real-world examples and one common mistake people make." },
    { text: "Act as an expert [profession]. Review this [thing] and tell me what's good, what's weak, and give specific improvements." },
    { text: "Break down [complex problem] into the smallest possible logical steps, then solve it step by step. Show your reasoning." },
    { text: "Compare the pros and cons of [option A] vs [option B] for someone who [specific situation]. Give a clear recommendation." },
  ],
  productivity: [
    { text: "Turn this meeting note into a clear action plan with owners, deadlines and next steps." },
    { text: "Create a 30-day plan to achieve [goal]. Include daily/weekly habits and milestones." },
  ],
  coding: [
    { text: "Review this code for bugs, performance issues and readability. Suggest concrete refactors." },
    { text: "Explain how [concept] works in [language/framework] with a minimal working example." },
  ],
};

export const imagePrompts: Prompt[] = [
  { text: "A cinematic wide shot of [subject] at golden hour, dramatic lighting, highly detailed, in the style of [director]" },
  { text: "Minimalist product shot of [product] on a clean background, soft shadows, studio lighting, modern aesthetic" },
];

// Rich category-specific prompt data
export interface CategoryContent {
  intro: string;
  useCases: string[];
  sections: { title: string; prompts: Prompt[] }[];
  faqs?: { q: string; a: string }[];
}

export const categoryContent: Record<string, CategoryContent> = {
  business: {
    intro: "Grok excels at pulling real-time market signals from X while helping you move fast on strategy, meetings, and execution.",
    useCases: [
      "Meeting summarization and action planning",
      "Competitor and market intelligence from live X data",
      "Stakeholder updates and leadership briefings",
      "Rapid strategy option comparison"
    ],
    sections: [
      {
        title: "Meetings & Leadership",
        prompts: [
          { text: "Summarize this meeting transcript into key decisions, action items and open questions." },
          { text: "Turn these notes into a concise leadership briefing with risks, decisions needed, and recommended next steps." },
          { text: "Generate 5 tough questions the board might ask about [initiative] and strong responses." }
        ]
      },
      {
        title: "Strategy & Competitive Intel",
        prompts: [
          { text: "Analyze this competitor based on recent X posts and news. Give strengths, weaknesses and opportunities." },
          { text: "Compare [strategy A] vs [strategy B] for [company situation]. Recommend one with clear rationale." }
        ]
      }
    ],
    faqs: [
      { q: "What are good Grok prompts for business strategy?", a: "Prompts for competitor analysis using live X data, meeting summarization, strategy option comparison, and stakeholder communication work extremely well." }
    ]
  },
  marketing: {
    intro: "Use Grok to generate campaign ideas, social copy, and real-time trend analysis faster than traditional tools.",
    useCases: ["Campaign ideation", "Social content calendars", "SEO keyword clusters from X", "Competitor creative teardown"],
    sections: [
      {
        title: "Content & Campaigns",
        prompts: [
          { text: "Generate 8 viral hook ideas for [product] aimed at [audience] based on current X conversations." },
          { text: "Create a 30-day content calendar for [brand] in [niche] with hooks, formats, and CTAs." },
          { text: "Rewrite this email for higher open rates and clearer CTA while keeping brand voice." }
        ]
      }
    ]
  },
  sales: {
    intro: "Personalize outreach, research accounts in real time, and handle objections using fresh signals from X.",
    useCases: ["Account research", "Cold email sequences", "Objection handling", "Proposal drafting"],
    sections: [
      {
        title: "Outreach & Research",
        prompts: [
          { text: "Research this account using recent X activity. Give me 5 personalized talking points." },
          { text: "Write a short, high-converting cold email for [persona] at [company type] about [value prop]." }
        ]
      }
    ]
  },
  engineers: {
    intro: "Accelerate code reviews, architecture decisions, debugging, and learning new stacks with precise prompts.",
    useCases: ["Code review", "System design", "Debugging", "Learning new frameworks"],
    sections: [
      {
        title: "Code & Architecture",
        prompts: [
          { text: "Review this code for bugs, performance issues, and readability. Suggest concrete refactors." },
          { text: "Design a scalable [system] for [constraints]. Include trade-offs and recommended tech." },
          { text: "Explain how [concept] works in [language] with a minimal working example and common pitfalls." }
        ]
      }
    ]
  },
  entrepreneurs: {
    intro: "Validate ideas quickly, build pitch materials, and run growth experiments with live market feedback.",
    useCases: ["Idea validation", "Pitch decks", "Fundraising prep", "Growth experiments"],
    sections: [
      {
        title: "Validation & Pitching",
        prompts: [
          { text: "Evaluate this startup idea for [market]. List risks, assumptions, and 3 experiments to run this week." },
          { text: "Create a compelling 10-slide pitch deck outline for [idea] including problem, solution, and traction hooks." }
        ]
      }
    ]
  },
  students: {
    intro: "Study smarter with structured explanations, essay frameworks, and exam prep that actually sticks.",
    useCases: ["Essay writing", "Exam prep", "Research synthesis", "Time management"],
    sections: [
      {
        title: "Learning & Writing",
        prompts: [
          { text: "Explain [concept] with a simple analogy, then give me a practice problem and the solution explained step by step." },
          { text: "Turn these notes into a well-structured essay outline with thesis, key arguments, and evidence." }
        ]
      }
    ]
  },
  teachers: {
    intro: "Save hours creating differentiated lessons, assessments, and parent communications.",
    useCases: ["Lesson planning", "Differentiation", "Assessments", "Parent comms"],
    sections: [
      {
        title: "Classroom Materials",
        prompts: [
          { text: "Create a 45-minute lesson plan on [topic] for [grade] with objectives, activities, and exit ticket." },
          { text: "Differentiate this assignment for 3 levels of learners while keeping the same core standards." }
        ]
      }
    ]
  },
  "data-analysts": {
    intro: "Clean data, build stories, and communicate insights with prompts tailored to analysis workflows.",
    useCases: ["Data cleaning", "Visualization", "Storytelling", "Dashboard design"],
    sections: [
      {
        title: "Analysis & Communication",
        prompts: [
          { text: "Review this dataset description. Suggest 5 high-impact questions to ask and visualizations to build." },
          { text: "Turn these findings into a clear executive summary with recommended actions." }
        ]
      }
    ]
  }
};

export const getCategoryPrompts = (slug: string): CategoryContent => {
  return categoryContent[slug] || {
    intro: "Specialized prompts for this role coming soon.",
    useCases: ["Everyday tasks", "Research", "Content creation"],
    sections: [
      {
        title: "Starter Prompts",
        prompts: [
          { text: `Act as an expert ${slug.replace(/-/g, ' ')}. Help me with [specific task].` },
          { text: `Give me 5 advanced ways to use Grok for ${slug.replace(/-/g, ' ')} work.` }
        ]
      }
    ]
  };
};
