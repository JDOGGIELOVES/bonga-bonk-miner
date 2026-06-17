export interface Prompt {
  text: string;
  section?: string;
  guidance?: string;
}

export const bestPrompts: Record<string, Prompt[]> = {
  general: [
    { text: "Explain [topic] like I'm a smart 15-year-old. Give 3 real-world examples and one common mistake people make.", guidance: "One of the most effective general grok prompts for breaking down complex ideas without jargon. Use it when you need clear explanations for any audience." },
    { text: "Act as an expert [profession]. Review this [thing] and tell me what's good, what's weak, and give specific improvements.", guidance: "Versatile grok prompt that gives structured feedback. Perfect for code reviews, writing critiques, business plans, or any deliverable." },
    { text: "Break down [complex problem] into the smallest possible logical steps, then solve it step by step. Show your reasoning.", guidance: "Powerful chain-of-thought grok prompt that dramatically improves accuracy on hard problems. Forces transparent thinking." },
    { text: "Compare the pros and cons of [option A] vs [option B] for someone who [specific situation]. Give a clear recommendation.", guidance: "Excellent grok prompt for decision making. Helps weigh tradeoffs and land on the best choice based on your actual constraints." },
  ],
  productivity: [
    { text: "Turn this meeting note into a clear action plan with owners, deadlines and next steps.", guidance: "Go-to grok productivity prompt after every meeting. Turns vague discussions into trackable tasks that actually get done." },
    { text: "Create a 30-day plan to achieve [goal]. Include daily/weekly habits and milestones.", guidance: "Solid grok prompt for turning big goals into realistic daily systems. Great for habit building and long-term progress tracking." },
  ],
  coding: [
    { text: "Review this code for bugs, performance issues and readability. Suggest concrete refactors.", guidance: "Core grok prompt for developers doing code reviews. Catches issues and suggests practical improvements instead of just pointing out problems." },
    { text: "Explain how [concept] works in [language/framework] with a minimal working example.", guidance: "Best grok prompt for learning or teaching new tech. Gives working code instead of abstract theory." },
  ],
};

export const imagePrompts: Prompt[] = [
  { text: "A cinematic wide shot of [subject] at golden hour, dramatic lighting, highly detailed, in the style of [director]", guidance: "Strong starting grok image prompt for cinematic or storytelling visuals. Add specific lighting, mood, or camera angles for better results." },
  { text: "Minimalist product shot of [product] on a clean background, soft shadows, studio lighting, modern aesthetic", guidance: "Reliable grok image prompt for clean product or marketing visuals. Great for e-commerce, social ads, or brand assets." },
];

// Rich category-specific prompt data
export interface CategoryContent {
  intro: string;
  useCases: string[];
  sections: { title: string; prompts: Prompt[] }[];
  faqs?: { q: string; a: string }[];
  whyTitle?: string;
  whyItems?: { title: string; desc: string }[];
  useCasesIntro?: string;
  promptsGuidance?: string;
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
          { text: "Summarize this meeting transcript into key decisions, action items and open questions.", guidance: "Use this grok prompt for business meetings to instantly extract decisions and owners so nothing falls through the cracks. Great for leaders who want clear action plans from long discussions." },
          { text: "Turn these notes into a concise leadership briefing with risks, decisions needed, and recommended next steps.", guidance: "Perfect grok business prompt for turning raw notes into executive-ready updates. Helps with stakeholder communication and fast decision making." },
          { text: "Generate 5 tough questions the board might ask about [initiative] and strong responses.", guidance: "Prepare for high-stakes meetings with this grok prompt for business strategy. Anticipate objections and build stronger cases before presenting." }
        ]
      },
      {
        title: "Strategy & Competitive Intel",
        prompts: [
          { text: "Analyze this competitor based on recent X posts and news. Give strengths, weaknesses and opportunities.", guidance: "This real-time grok prompt for competitive intelligence pulls fresh signals from X that traditional research misses. Ideal for strategy and market positioning." },
          { text: "Compare [strategy A] vs [strategy B] for [company situation]. Recommend one with clear rationale.", guidance: "Use for grok business strategy decisions when you need an objective breakdown of options with pros, cons, and a clear winner." }
        ]
      }
    ],
    faqs: [
      { q: "What are good Grok prompts for business strategy?", a: "Prompts for competitor analysis using live X data, meeting summarization, strategy option comparison, and stakeholder communication work extremely well." }
    ],
    whyTitle: "Why Teams Are Using Grok in 2026",
    whyItems: [
      { title: "Real-time market & competitor intel", desc: "Pull fresh X conversations, news, and sentiment in seconds." },
      { title: "Meeting & decision acceleration", desc: "Summarize calls, generate action plans, and prep briefs instantly." },
      { title: "Content & sales at scale", desc: "Draft emails, proposals, social posts, and research reports in minutes." }
    ],
    useCasesIntro: "These scenarios highlight where Grok delivers the biggest time savings and competitive edge — use them as inspiration for the kinds of daily tasks where real-time insights and fast drafting make a real difference.",
    promptsGuidance: "Copy these directly into Grok to handle real business work faster. They’re battle-tested for meetings, research, sales, and content — tweak the brackets with your specific details for best results."
  },
  marketing: {
    intro: "Speed up content, campaigns, research, and performance work with ready-to-use prompts built for modern marketers.",
    useCases: ["Content at Scale", "Research & Insights", "Campaign Acceleration"],
    sections: [
      {
        title: "Content & Campaigns",
        prompts: [
          { text: "Brainstorm a 30-day content calendar for [brand/niche] targeting [audience]. Include 10 post ideas with hook, format, and why it could perform well on [platform].", guidance: "This grok marketing prompt helps you plan consistent content that actually reaches your audience. Use it for campaign ideation and social media managers looking for ready-to-execute calendars." },
          { text: "Create a detailed SEO-optimized blog post brief for the keyword '[target keyword]'. Include H2/H3 structure, key points to cover, internal link opportunities, and 5 title variations.", guidance: "Perfect for grok prompts for marketing SEO and content creation. Generates briefs that rank by incorporating search intent and structure." }
        ]
      }
    ],
    whyTitle: "Why Marketers Are Using Grok",
    whyItems: [
      { title: "Content at Scale", desc: "Blog outlines, social threads, email sequences, ad copy variations." },
      { title: "Research & Insights", desc: "Competitor moves, audience sentiment, emerging trends on X." },
      { title: "Campaign Acceleration", desc: "Briefs, A/B test ideas, performance analysis, and optimization recommendations." }
    ],
    useCasesIntro: "Grok’s real-time X data + strong creative reasoning makes it especially useful for trend-jacking, social listening, content ideation, and fast iteration on campaigns.",
    promptsGuidance: "Drop these prompts straight into Grok with your details in the brackets. They’re designed for campaign ideation, copy, research, and content systems that actually convert and save time."
  },
  sales: {
    intro: "Personalize outreach, research accounts in real time, and handle objections using fresh signals from X.",
    useCases: ["Personalized outreach & proposal drafting", "Objection handling & battle cards", "Win/loss analysis from notes", "Account research & talk tracks"],
    sections: [
      {
        title: "Outreach & Research",
        prompts: [
          { text: "Research this account using recent X activity. Give me 5 personalized talking points.", guidance: "Core grok sales prompt for account research that surfaces real-time signals and warm intros from X. Saves hours compared to manual LinkedIn stalking." },
          { text: "Write a concise, warm outreach email to [Name/Role] at [Company]. Reference [specific recent trigger or insight]. Keep it under 120 words and end with one clear next step.", guidance: "Use this grok sales prompt for personalized cold outreach that feels relevant. Reference recent activity to dramatically improve reply rates." },
          { text: "Write a 4-email follow-up sequence for a prospect who showed interest in [product] but went quiet after [last interaction]. Keep tones helpful and low-pressure. Goal: re-engage and book a call.", guidance: "Proven grok prompt for sales follow-ups that re-engage without being pushy. Perfect for moving stalled deals forward." },
          { text: "Create an outline for a sales proposal for [Company] in [industry]. Include executive summary, problem statement, our solution, ROI examples, implementation timeline, and next steps. Tailor it to their recent X activity around [pain point].", guidance: "This grok sales prompt builds tailored proposals that speak directly to the prospect's current situation and pain points." }
        ]
      }
    ],
    whyTitle: "Why Sales Teams Use Grok",
    whyItems: [
      { title: "Hyper-personalized outreach", desc: "Reference real recent X activity for warm, relevant messages." },
      { title: "Faster research", desc: "Get account snapshots and battle cards in seconds instead of hours." },
      { title: "Objection handling at scale", desc: "Generate tailored responses and sequences on demand." }
    ],
    useCasesIntro: "These prompts help sales pros move faster from research to proposal while staying relevant.",
    promptsGuidance: "Paste real context (LinkedIn profile, recent X posts, previous emails) for hyper-personalized output. Tweak brackets and iterate."
  },
  engineers: {
    intro: "Accelerate code reviews, architecture decisions, debugging, and learning new stacks with precise prompts.",
    useCases: ["Code review", "System design", "Debugging", "Learning new frameworks"],
    sections: [
      {
        title: "Code & Architecture",
        prompts: [
          { text: "Review this code for bugs, performance issues, and readability. Suggest concrete refactors.", guidance: "Essential grok prompts for engineers doing code reviews. Catches issues early and improves code quality without slowing down the team." },
          { text: "Design a scalable [system] for [constraints]. Include trade-offs and recommended tech.", guidance: "Use this grok engineering prompt for system design discussions. Forces clear trade-off thinking that impresses in architecture reviews." },
          { text: "Explain how [concept] works in [language] with a minimal working example and common pitfalls.", guidance: "Great grok prompt for developers learning new tech or explaining concepts to teammates. Produces practical examples instead of abstract theory." }
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
          { text: "Evaluate this startup idea for [market]. List risks, assumptions, and 3 experiments to run this week.", guidance: "Classic grok prompt for entrepreneurs validating ideas fast. Turns vague concepts into testable hypotheses with clear next steps." },
          { text: "Create a compelling 10-slide pitch deck outline for [idea] including problem, solution, and traction hooks.", guidance: "Use this grok entrepreneur prompt when preparing to pitch investors. Structures the story around what actually matters for fundraising." }
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
          { text: "Explain [concept] with a simple analogy, then give me a practice problem and the solution explained step by step.", guidance: "Ideal grok prompts for students who want to actually understand material instead of just memorizing. Turns complex topics into memorable explanations." },
          { text: "Turn these notes into a well-structured essay outline with thesis, key arguments, and evidence.", guidance: "This grok student prompt helps organize scattered thoughts into clear, high-scoring essays. Great for research papers and exam prep." }
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
          { text: "Create a 45-minute lesson plan on [topic] for [grade] with objectives, activities, and exit ticket.", guidance: "Core grok prompts for teachers needing fast, standards-aligned lesson plans. Saves hours of prep while keeping lessons engaging." },
          { text: "Differentiate this assignment for 3 levels of learners while keeping the same core standards.", guidance: "Use this grok prompt for teachers when differentiating instruction. Produces practical modifications that actually work in mixed classrooms." }
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
          { text: "Review this dataset description. Suggest 5 high-impact questions to ask and visualizations to build.", guidance: "Strong grok prompts for data analysts who need to move from raw data to meaningful questions fast. Helps avoid analysis paralysis." },
          { text: "Turn these findings into a clear executive summary with recommended actions.", guidance: "This grok data analyst prompt translates technical findings into business language that stakeholders actually understand and act on." }
        ]
      }
    ]
  },
  healthcare: {
    intro: "Support clinical reasoning, patient education, documentation, and research with accurate, empathetic prompts.",
    useCases: ["Patient communication", "Research synthesis", "Documentation", "Wellness planning"],
    sections: [
      {
        title: "Clinical & Patient",
        prompts: [
          { text: "Explain [condition/treatment] to a patient in plain language. Include what to expect and common questions." },
          { text: "Summarize the latest research on [topic] and highlight practical takeaways for clinicians." }
        ]
      }
    ]
  },
  investors: {
    intro: "Leverage real-time X signals for market sentiment, due diligence, and thesis development.",
    useCases: ["Market scanning", "Due diligence", "Thesis writing", "Risk analysis"],
    sections: [
      {
        title: "Research & Analysis",
        prompts: [
          { text: "Analyze recent X sentiment around [ticker or sector]. Summarize bull and bear cases with sources." },
          { text: "Create a due diligence checklist and initial report for [company or asset class]." }
        ]
      }
    ]
  },
  fitness: {
    intro: "Build personalized fitness, nutrition and recovery plans backed by practical reasoning.",
    useCases: ["Program design", "Nutrition planning", "Habit formation", "Injury prevention"],
    sections: [
      {
        title: "Training & Nutrition",
        prompts: [
          { text: "Design a 4-week progressive program for [goal] for someone with [constraints]. Include progression and recovery." },
          { text: "Create a weekly meal plan for [diet type] optimized for [goal] with shopping list and macros." }
        ]
      }
    ]
  },
  productivity: {
    intro: "Build systems for focus, task management, and high-output workflows.",
    useCases: ["Daily systems", "Deep work", "Automation", "Review rituals"],
    sections: [
      {
        title: "Systems & Routines",
        prompts: [
          { text: "Design a personal operating system for someone who wants to ship more with less stress." },
          { text: "Create a weekly review template that surfaces wins, lessons, and next priorities." }
        ]
      }
    ]
  },
  "creative-writing": {
    intro: "Accelerate fiction, worldbuilding, dialogue, and editing with structured creative prompts.",
    useCases: ["Story outlining", "Character development", "Dialogue", "Revision"],
    sections: [
      {
        title: "Story & Character",
        prompts: [
          { text: "Help me brainstorm a high-concept premise for a [genre] story set in [setting]. Give 5 strong loglines." },
          { text: "Develop a complex character with contradictions, arc, and key scenes." }
        ]
      }
    ]
  },
  "language-learners": {
    intro: "Accelerate language acquisition with conversation practice, grammar drills, and cultural nuance.",
    useCases: ["Conversation practice", "Vocabulary building", "Grammar correction", "Cultural context"],
    sections: [
      {
        title: "Speaking & Listening",
        prompts: [
          { text: "Role-play a conversation in [language] about [topic]. Correct my mistakes and suggest natural alternatives." },
          { text: "Create 10 useful phrases for [situation] in [language] with pronunciation guide and context." }
        ]
      }
    ]
  },
  "travel-planners": {
    intro: "Build detailed, personalized travel experiences with real-time considerations.",
    useCases: ["Itinerary creation", "Budget optimization", "Local experiences", "Contingency planning"],
    sections: [
      {
        title: "Planning & Logistics",
        prompts: [
          { text: "Create a 7-day itinerary for [destination] for [traveler type] with daily schedule, costs, and hidden gems." },
          { text: "Compare [option A] vs [option B] for travel to [place] including time, cost, and experience." }
        ]
      }
    ]
  },
  "market-research": {
    intro: "Design studies, analyze trends, and synthesize actionable market insights.",
    useCases: ["Survey design", "Trend analysis", "Competitor teardown", "Persona development"],
    sections: [
      {
        title: "Research Design & Insights",
        prompts: [
          { text: "Design a survey to understand [target audience] attitudes toward [product/category]. Include 12 questions." },
          { text: "Analyze current trends in [industry] and predict what will matter most in the next 12 months." }
        ]
      }
    ]
  },
  "customer-support": {
    intro: "Handle inquiries with empathy, efficiency, and escalation best practices.",
    useCases: ["Ticket responses", "De-escalation", "Knowledge base", "Process improvement"],
    sections: [
      {
        title: "Communication Scripts",
        prompts: [
          { text: "Draft a helpful response to this customer complaint: [complaint]. Keep tone empathetic and solution-focused." },
          { text: "Create a decision tree for handling [common issue] including when to escalate." }
        ]
      }
    ]
  },
  "personal-finance": {
    intro: "Make smarter money decisions with budgeting, investing, and planning frameworks.",
    useCases: ["Budget creation", "Debt payoff", "Investment choices", "Financial goals"],
    sections: [
      {
        title: "Money Management",
        prompts: [
          { text: "Build a realistic monthly budget for someone earning [income] in [location] with [goals]." },
          { text: "Compare [investment option A] vs [B] for a [time horizon] goal. Include risks and expected outcomes." }
        ]
      }
    ]
  },
  "dating-relationships": {
    intro: "Improve communication, connection, and conflict resolution in personal relationships.",
    useCases: ["Conversation starters", "Conflict resolution", "Date ideas", "Relationship check-ins"],
    sections: [
      {
        title: "Communication & Connection",
        prompts: [
          { text: "Help me craft a thoughtful message to [partner] about [topic] that feels vulnerable but not overwhelming." },
          { text: "Generate 8 creative date ideas for [city] that match [budget/personality] and encourage deep conversation." }
        ]
      }
    ]
  },
  "parenting-family": {
    intro: "Navigate parenting challenges with age-appropriate strategies and family bonding ideas.",
    useCases: ["Discipline", "Activities", "Communication", "Milestone support"],
    sections: [
      {
        title: "Daily Parenting",
        prompts: [
          { text: "Suggest 5 age-appropriate ways to handle [behavior issue] for a [age] year old." },
          { text: "Create a family activity plan for the weekend that balances fun, learning, and screen-free time." }
        ]
      }
    ]
  },
  "pet-care": {
    intro: "Provide practical advice for pet health, training, and enrichment.",
    useCases: ["Training plans", "Health concerns", "Behavior issues", "Enrichment"],
    sections: [
      {
        title: "Care & Training",
        prompts: [
          { text: "Create a 4-week training plan for teaching [command/trick] to a [breed/age] [pet type]." },
          { text: "Help me troubleshoot why my [pet] is [behavior]. Suggest 3 possible causes and solutions." }
        ]
      }
    ]
  },
  "gardening-diy": {
    intro: "Plan gardens, troubleshoot plants, and tackle home improvement projects confidently.",
    useCases: ["Garden planning", "Plant care", "DIY repairs", "Tool selection"],
    sections: [
      {
        title: "Projects & Care",
        prompts: [
          { text: "Design a beginner-friendly vegetable garden for a [space size] area in [climate]. Include plant list and timeline." },
          { text: "Step-by-step guide to fix [common home issue] safely with basic tools." }
        ]
      }
    ]
  },
  sustainability: {
    intro: "Adopt sustainable practices and develop ESG strategies with measurable impact.",
    useCases: ["Sustainable living", "ESG frameworks", "Carbon reduction", "Reporting"],
    sections: [
      {
        title: "Action & Strategy",
        prompts: [
          { text: "Create a 30-day plan to reduce household waste and energy use for a family of [size]." },
          { text: "Draft an ESG report section for [company] covering [area]. Include metrics and improvement goals." }
        ]
      }
    ]
  },
  nonprofits: {
    intro: "Strengthen fundraising, operations, and impact for mission-driven work.",
    useCases: ["Grant writing", "Donor engagement", "Program design", "Impact measurement"],
    sections: [
      {
        title: "Fundraising & Operations",
        prompts: [
          { text: "Write a compelling case for support for [cause] aimed at [donor type]." },
          { text: "Design a volunteer program structure for [organization type] including roles, training, and retention strategies." }
        ]
      }
    ]
  },
  consulting: {
    intro: "Deliver high-value client work with structured frameworks and clear deliverables.",
    useCases: ["Proposals", "Workshops", "Diagnostics", "Recommendations"],
    sections: [
      {
        title: "Client Work",
        prompts: [
          { text: "Outline a proposal for a [project type] engagement for a [client industry] company. Include scope, timeline, and pricing structure." },
          { text: "Facilitate a 90-minute workshop on [topic] for [audience]. Provide agenda, exercises, and handout ideas." }
        ]
      }
    ]
  },
  "cloud-devops": {
    intro: "Design, deploy, and maintain reliable infrastructure and CI/CD pipelines.",
    useCases: ["Architecture", "Automation", "Monitoring", "Incident response"],
    sections: [
      {
        title: "Infrastructure & Automation",
        prompts: [
          { text: "Design a scalable, cost-effective architecture for [app type] on [cloud provider] with high availability." },
          { text: "Create a Terraform module for [resource] with best practices for security and tagging." }
        ]
      }
    ]
  },
  "machine-learning": {
    intro: "Build, evaluate, and ethically deploy machine learning systems.",
    useCases: ["Model development", "Data pipelines", "Evaluation", "Responsible AI"],
    sections: [
      {
        title: "ML Workflows",
        prompts: [
          { text: "Outline an end-to-end ML pipeline for [problem] including data sources, features, model choice, and monitoring." },
          { text: "Analyze potential biases in a [model type] trained on [data description] and suggest mitigation steps." }
        ]
      }
    ]
  },
  "event-planning": {
    intro: "Plan seamless events from concept to execution with detailed logistics.",
    useCases: ["Timeline creation", "Vendor management", "Run of show", "Risk mitigation"],
    sections: [
      {
        title: "Planning & Execution",
        prompts: [
          { text: "Create a complete timeline and checklist for a [event type] for [guest count] people." },
          { text: "Draft vendor negotiation talking points and contract must-haves for [service]." }
        ]
      }
    ]
  },
  "music-production": {
    intro: "Create, refine, and finish professional-sounding music projects.",
    useCases: ["Beat making", "Mixing", "Arrangement", "Sound design"],
    sections: [
      {
        title: "Production Techniques",
        prompts: [
          { text: "Help me build a [genre] beat in [DAW] starting from a simple melody. Give specific plugin and processing suggestions." },
          { text: "Analyze this mix and give me targeted improvements for clarity, punch, and space." }
        ]
      }
    ]
  },
  ecommerce: {
    intro: "Optimize online stores for conversion, retention, and growth.",
    useCases: ["Product copy", "Email flows", "Pricing", "Customer research"],
    sections: [
      {
        title: "Store & Marketing",
        prompts: [
          { text: "Write high-converting product descriptions for [product] targeting [audience] with SEO in mind." },
          { text: "Design a 5-email abandoned cart sequence that feels helpful rather than pushy." }
        ]
      }
    ]
  },
  "grant-writing": {
    intro: "Craft compelling, fundable proposals with clear narratives and data.",
    useCases: ["Needs statements", "Budgets", "Evaluation plans", "Executive summaries"],
    sections: [
      {
        title: "Proposal Development",
        prompts: [
          { text: "Draft a strong needs statement for a [program] serving [population] in [location]." },
          { text: "Create an evaluation framework with SMART objectives and data collection methods for [grant]." }
        ]
      }
    ]
  },
  "competitive-intelligence": {
    intro: "Monitor markets and competitors with structured, actionable intelligence.",
    useCases: ["SWOT analysis", "Pricing tracking", "Feature comparison", "Sentiment monitoring"],
    sections: [
      {
        title: "Intelligence Gathering",
        prompts: [
          { text: "Build a competitive profile for [company] including strengths, weaknesses, and likely next moves." },
          { text: "Monitor X and news for signals about [competitor move or trend]. Summarize implications." }
        ]
      }
    ]
  },
  "risk-management": {
    intro: "Identify, assess, and mitigate risks across operations and strategy.",
    useCases: ["Risk registers", "Scenario planning", "Compliance", "Crisis prep"],
    sections: [
      {
        title: "Risk Frameworks",
        prompts: [
          { text: "Create a risk register for [project or business area] with likelihood, impact, and mitigation actions." },
          { text: "Run a scenario analysis for [event] and recommend 3 response strategies." }
        ]
      }
    ]
  },
  "team-collaboration": {
    intro: "Improve how teams communicate, align, and execute together.",
    useCases: ["Meeting design", "Async processes", "Feedback systems", "Project handoffs"],
    sections: [
      {
        title: "Team Processes",
        prompts: [
          { text: "Design a better structure for our [recurring meeting] that actually moves work forward." },
          { text: "Create an async update template that keeps everyone informed without unnecessary meetings." }
        ]
      }
    ]
  },
  leadership: {
    intro: "Develop vision, inspire teams, and make high-stakes decisions.",
    useCases: ["Vision communication", "Team development", "Decision making", "Executive presence"],
    sections: [
      {
        title: "Leadership Practice",
        prompts: [
          { text: "Help me articulate a compelling vision for [team/organization] that connects to our values and goals." },
          { text: "Prepare talking points for a difficult conversation with [stakeholder] about [issue]." }
        ]
      }
    ]
  },
  "fashion-style": {
    intro: "Develop personal style, analyze trends, and communicate fashion concepts.",
    useCases: ["Outfit curation", "Trend forecasting", "Brand voice", "Personal shopping"],
    sections: [
      {
        title: "Style Development",
        prompts: [
          { text: "Create a capsule wardrobe for [season/lifestyle] for someone with [body type/preferences]." },
          { text: "Analyze current runway trends and translate them into wearable looks for [audience]." }
        ]
      }
    ]
  },
  "history-philosophy": {
    intro: "Explore historical events and philosophical ideas with depth and clarity.",
    useCases: ["Historical analysis", "Philosophical arguments", "Contextual comparison", "Essay support"],
    sections: [
      {
        title: "Analysis & Interpretation",
        prompts: [
          { text: "Compare how [event/idea] was understood in [era] versus today. What changed and why?" },
          { text: "Walk me through the key arguments in [philosopher]'s [work] and their modern relevance." }
        ]
      }
    ]
  },
  astronomy: {
    intro: "Understand the universe through current science, observation, and discovery.",
    useCases: ["Celestial events", "Explanations", "Observation planning", "Space news context"],
    sections: [
      {
        title: "Learning & Observing",
        prompts: [
          { text: "Explain [astronomical concept] simply, then with the key equations and latest observations." },
          { text: "Plan a beginner stargazing session for [date/location]. Include what to look for and how to find it." }
        ]
      }
    ]
  },
  "mental-health": {
    intro: "Support emotional well-being with evidence-informed strategies and self-awareness tools.",
    useCases: ["Self-care routines", "Coping skills", "Communication", "Boundary setting"],
    sections: [
      {
        title: "Wellness Tools",
        prompts: [
          { text: "Create a personalized 7-day mental health toolkit for someone experiencing [challenge]." },
          { text: "Help me script a boundary conversation with [person] about [issue] that feels kind but firm." }
        ]
      }
    ]
  },
  automotive: {
    intro: "Make informed decisions about vehicles, maintenance, and modifications.",
    useCases: ["Buying guides", "Maintenance", "Modifications", "Troubleshooting"],
    sections: [
      {
        title: "Vehicle Knowledge",
        prompts: [
          { text: "Compare [car A] and [car B] for someone who [priorities]. Include reliability, costs, and driving feel." },
          { text: "Diagnose why my [vehicle] is making [symptom] and give step-by-step checks." }
        ]
      }
    ]
  },
  sports: {
    intro: "Improve athletic performance, team strategy, and coaching effectiveness.",
    useCases: ["Training plans", "Game strategy", "Player development", "Mental preparation"],
    sections: [
      {
        title: "Coaching & Training",
        prompts: [
          { text: "Design a 6-week training block for [sport/position] focused on [goal]." },
          { text: "Break down film of [play or game] and suggest tactical adjustments." }
        ]
      }
    ]
  },
  "ar-vr": {
    intro: "Design immersive experiences and understand spatial computing.",
    useCases: ["Experience design", "Interaction patterns", "World building", "Prototyping"],
    sections: [
      {
        title: "Design & Development",
        prompts: [
          { text: "Outline an AR experience for [use case] that feels magical but practical." },
          { text: "Suggest interaction patterns for a VR training simulation for [skill]." }
        ]
      }
    ]
  },
  robotics: {
    intro: "Build, program, and deploy robotic systems with practical engineering focus.",
    useCases: ["Robot design", "Programming", "Automation", "Safety"],
    sections: [
      {
        title: "Build & Program",
        prompts: [
          { text: "Design a simple robot for [task]. Include hardware recommendations and control logic." },
          { text: "Write pseudocode for a robot to [behavior] safely in [environment]." }
        ]
      }
    ]
  },
  quantum: {
    intro: "Grasp quantum concepts and explore real-world computing applications.",
    useCases: ["Conceptual explanations", "Algorithm design", "Applications", "Limitations"],
    sections: [
      {
        title: "Concepts & Applications",
        prompts: [
          { text: "Explain [quantum concept] intuitively and then more formally with examples." },
          { text: "Describe a practical use case for quantum computing in [industry] and current limitations." }
        ]
      }
    ]
  },
  "web3-crypto": {
    intro: "Navigate blockchain, tokens, and decentralized systems with clear analysis.",
    useCases: ["Tokenomics", "Smart contracts", "Market analysis", "Project evaluation"],
    sections: [
      {
        title: "Analysis & Strategy",
        prompts: [
          { text: "Evaluate the tokenomics of [project]. What works, what are red flags?" },
          { text: "Explain how [DeFi protocol or NFT mechanic] works and its risks for users." }
        ]
      }
    ]
  }
};

export const getCategoryPrompts = (slug: string): CategoryContent => {
  if (categoryContent[slug]) return categoryContent[slug];

  const title = slug.replace(/-/g, ' ');
  return {
    intro: `Grok can help dramatically with ${title.toLowerCase()} work by combining reasoning with real-time context where available.`,
    useCases: ["Daily workflows", "Research & analysis", "Content & communication", "Decision support"],
    sections: [
      {
        title: "Core Prompts for " + title,
        prompts: [
          { text: `Act as an expert ${title}. Help me with [specific task or challenge]. Give step-by-step guidance.`, guidance: `Strong all-purpose grok prompt for ${slug.replace(/-/g, ' ')}. Replace the brackets and get targeted, actionable help fast.` },
          { text: `Analyze [situation] from a ${title} perspective. Highlight risks, opportunities, and recommended actions.`, guidance: `Use this grok ${slug} prompt when you need expert analysis from that specific viewpoint. Excellent for decision support.` },
          { text: `Create a reusable template or checklist I can use for common ${title.toLowerCase()} tasks.`, guidance: `Practical grok prompt that generates ready-to-reuse systems. Great for building repeatable processes in ${slug.replace(/-/g, ' ')}.` },
          { text: `Review this [document/plan/idea] as a ${title} professional and suggest specific improvements.`, guidance: `This grok prompt gives professional-grade feedback. Ideal for refining work in ${slug.replace(/-/g, ' ')}.` }
        ]
      }
    ]
  };
};
