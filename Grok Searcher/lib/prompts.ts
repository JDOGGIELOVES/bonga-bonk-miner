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
    { text: "Brainstorm 10 unconventional ideas for [problem or goal]. Make at least 3 of them completely wild.", guidance: "Great for breaking out of conventional thinking in brainstorming sessions." },
    { text: "Write a step-by-step guide on how to [task] that even a complete beginner can follow.", guidance: "Excellent for creating accessible tutorials or onboarding docs." },
  ],
  productivity: [
    { text: "Turn this meeting note into a clear action plan with owners, deadlines and next steps.", guidance: "Go-to grok productivity prompt after every meeting. Turns vague discussions into trackable tasks that actually get done." },
    { text: "Create a 30-day plan to achieve [goal]. Include daily/weekly habits and milestones.", guidance: "Solid grok prompt for turning big goals into realistic daily systems. Great for habit building and long-term progress tracking." },
    { text: "Prioritize this list of tasks for someone with limited time. Explain the reasoning and suggest what to delegate or delete.", guidance: "Excellent for decision paralysis and ruthless prioritization." },
  ],
  coding: [
    { text: "Review this code for bugs, performance issues and readability. Suggest concrete refactors.", guidance: "Core grok prompt for developers doing code reviews. Catches issues and suggests practical improvements instead of just pointing out problems." },
    { text: "Explain how [concept] works in [language/framework] with a minimal working example.", guidance: "Best grok prompt for learning or teaching new tech. Gives working code instead of abstract theory." },
    { text: "Debug this error: [paste error + code snippet]. Explain the root cause and give 3 possible fixes.", guidance: "Highly effective for real debugging sessions with clear reasoning." },
    { text: "Write a clean, well-commented [language] function that does [specific task]. Follow best practices.", guidance: "Great starting point for boilerplate and clean code generation." },
  ],
};

export const imagePrompts: Prompt[] = [
  { text: "A cinematic wide shot of [subject] at golden hour, dramatic lighting, highly detailed, in the style of [director]", guidance: "Strong starting grok image prompt for cinematic or storytelling visuals. Add specific lighting, mood, or camera angles for better results." },
  { text: "Minimalist product shot of [product] on a clean background, soft shadows, studio lighting, modern aesthetic", guidance: "Reliable grok image prompt for clean product or marketing visuals. Great for e-commerce, social ads, or brand assets." },
  { text: "Surreal floating islands with waterfalls, ethereal lighting, fantasy art style by [artist], ultra detailed, 8k", guidance: "Perfect for wild, imaginative scenes. Great for creative concepts and book covers." },
  { text: "Cyberpunk street at night, neon reflections on wet pavement, flying cars, moody atmosphere, blade runner style", guidance: "Excellent for sci-fi and dystopian vibes. Specify character or vehicle for more focus." },
  { text: "Elegant portrait of a [person description] in [outfit], soft window light, renaissance painting style, intricate details", guidance: "Ideal for character concepts, fashion, or editorial-style images." },
  { text: "Whimsical cartoon fox in a magical forest, vibrant colors, storybook illustration style, playful expression", guidance: "Great for kids' content, memes, or light-hearted branding." },
  { text: "Abstract geometric cityscape made of glowing crystals, vibrant colors, futuristic minimalism", guidance: "Use for modern art, tech branding, or wallpaper-style visuals." },
  { text: "Epic battle scene between [creatures], dramatic clouds, cinematic composition, in the style of [famous artist]", guidance: "Strong for fantasy and action concepts. Great for game art or thumbnails." },
  { text: "Cozy cabin in the snow at twilight, warm window lights, pine trees, peaceful winter wonderland", guidance: "Perfect for lifestyle, travel, or holiday marketing visuals." },
  { text: "Hyper-realistic close-up of [food item], steam rising, fresh ingredients, food photography style", guidance: "Excellent for recipe books, restaurant menus, or product shots." },
];

// Rich category-specific prompt data
export interface UseCase {
  title: string;
  description: string;
}

export interface CategoryContent {
  intro: string;
  useCases: UseCase[];
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
      { title: "Meeting summarization and action planning", description: "Transform rambling meeting notes or transcripts into clear action items with owners and deadlines that teams can actually execute on." },
      { title: "Competitor and market intelligence from live X data", description: "Pull fresh signals from X conversations to build real-time SWOT analyses and spot emerging threats or opportunities before competitors do." },
      { title: "Stakeholder updates and leadership briefings", description: "Turn complex project updates into concise, executive-ready summaries that highlight risks, wins, and exactly what decisions are needed." },
      { title: "Rapid strategy option comparison", description: "Quickly weigh two different approaches for a business decision by comparing pros, cons, risks, and expected outcomes using current market context." }
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
    useCasesIntro: "These scenarios highlight where Grok delivers the biggest time savings and competitive edge for business teams — use them as inspiration for daily tasks where real-time signals and fast execution matter most.",
    promptsGuidance: "Copy these directly into Grok to handle real business work faster. They’re battle-tested for meetings, research, sales, and content — tweak the brackets with your specific details for best results."
  },
  marketing: {
    intro: "Speed up content, campaigns, research, and performance work with ready-to-use prompts built for modern marketers.",
    useCases: [
      { title: "Content at Scale", description: "Rapidly produce on-brand social threads, email sequences, and ad variations that match your voice while incorporating real-time trending topics." },
      { title: "Research & Insights", description: "Monitor X for audience sentiment and competitor moves to uncover fresh angles and data points that make your campaigns stand out." },
      { title: "Campaign Acceleration", description: "Generate full campaign briefs, A/B test ideas, and performance optimization recommendations in minutes instead of days." }
    ],
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
    useCasesIntro: "Grok’s real-time X data combined with creative reasoning is ideal for marketers who need to spot trends fast and generate campaign ideas that cut through the noise.",
    promptsGuidance: "Drop these prompts straight into Grok with your details in the brackets. They’re designed for campaign ideation, copy, research, and content systems that actually convert and save time."
  },
  sales: {
    intro: "Personalize outreach, research accounts in real time, and handle objections using fresh signals from X.",
    useCases: [
      { title: "Personalized outreach & proposal drafting", description: "Reference the prospect's recent X activity or company news to write warm, relevant outreach that feels researched instead of generic." },
      { title: "Objection handling & battle cards", description: "Build ready-to-use responses for common pushbacks, informed by what competitors are actually saying publicly right now." },
      { title: "Win/loss analysis from notes", description: "Extract patterns from past deals by analyzing call notes and emails to refine your pitch and forecast more accurately." },
      { title: "Account research & talk tracks", description: "Quickly surface the latest company developments and stakeholder signals from X to create hyper-relevant conversation starters." }
    ],
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
    useCasesIntro: "These prompts are designed to help sales professionals research accounts quickly and craft outreach that feels personal and timely.",
    promptsGuidance: "Paste real context (LinkedIn profile, recent X posts, previous emails) for hyper-personalized output. Tweak brackets and iterate."
  },
  engineers: {
    intro: "Accelerate code reviews, architecture decisions, debugging, and learning new stacks with precise prompts.",
    useCases: [
      { title: "Code review", description: "Catch subtle bugs, security issues, and performance bottlenecks while suggesting idiomatic refactors specific to your tech stack." },
      { title: "System design", description: "Explore scalable architectures for complex features while weighing trade-offs around latency, cost, and maintainability." },
      { title: "Debugging", description: "Break down cryptic error logs or production incidents into root causes with step-by-step reproduction paths and fixes." },
      { title: "Learning new frameworks", description: "Get practical, working examples of modern patterns so you can ship features in unfamiliar codebases without weeks of ramp-up." }
    ],
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
    useCases: [
      { title: "Idea validation", description: "Stress-test your startup concept against real market signals and competitor activity pulled from X to find weak spots early." },
      { title: "Pitch decks", description: "Craft compelling narrative slides that connect your traction directly to investor priorities using fresh industry context." },
      { title: "Fundraising prep", description: "Anticipate tough questions from VCs and prepare data-backed answers drawn from current market movements and comparable deals." },
      { title: "Growth experiments", description: "Design low-cost tests for new channels or features and quickly analyze results against real user conversations happening right now." }
    ],
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
    useCases: [
      { title: "Essay writing", description: "Turn scattered research notes into coherent outlines with strong thesis statements and properly cited supporting arguments." },
      { title: "Exam prep", description: "Create focused study guides and practice questions that target the exact concepts your professor emphasized in lectures." },
      { title: "Research synthesis", description: "Quickly compare multiple academic sources and distill the key disagreements and consensus into clear takeaways for papers." },
      { title: "Time management", description: "Build realistic weekly study schedules that balance classes, assignments, and rest while hitting all your deadlines." }
    ],
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
    useCases: [
      { title: "Lesson planning", description: "Build complete lessons with engaging hooks, hands-on activities, and clear assessments aligned to your specific curriculum standards." },
      { title: "Differentiation", description: "Adapt the same core assignment for advanced, on-level, and struggling learners while keeping everyone working toward the same goals." },
      { title: "Assessments", description: "Create varied quizzes and projects that actually measure understanding instead of just memorization of facts." },
      { title: "Parent comms", description: "Write clear, positive updates about student progress that help families support learning without causing alarm." }
    ],
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
    useCases: [
      { title: "Data cleaning", description: "Spot anomalies and inconsistencies in messy datasets and generate reproducible cleaning scripts that preserve the original signal." },
      { title: "Visualization", description: "Choose the right chart types and design clear dashboards that reveal the story in your data to non-technical stakeholders." },
      { title: "Storytelling", description: "Translate statistical findings into compelling narratives that executives can use to make confident business decisions." },
      { title: "Dashboard design", description: "Build intuitive monitoring tools that surface the metrics that actually matter for your team's goals in real time." }
    ],
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
    useCases: [
      { title: "Patient communication", description: "Explain complex medical concepts in plain language that builds trust and helps patients make informed decisions about their care." },
      { title: "Research synthesis", description: "Quickly review the latest studies on a condition and extract practical clinical takeaways while flagging study limitations." },
      { title: "Documentation", description: "Draft accurate clinical notes and patient instructions that are thorough yet concise and reduce after-hours charting time." },
      { title: "Wellness planning", description: "Create personalized lifestyle and prevention plans that patients are actually likely to follow based on their real circumstances." }
    ],
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
    useCases: [
      { title: "Market scanning", description: "Track real-time sentiment shifts and emerging narratives around sectors or tickers directly from influential voices on X." },
      { title: "Due diligence", description: "Build comprehensive company profiles by combining public filings with the latest unfiltered commentary from customers and competitors." },
      { title: "Thesis writing", description: "Articulate clear investment theses supported by fresh data points and contrarian signals that stand out in pitch meetings." },
      { title: "Risk analysis", description: "Identify hidden tail risks and early warning signs by monitoring discussions that traditional financial models miss." }
    ],
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
    useCases: [
      { title: "Program design", description: "Build progressive training plans that match the client's current fitness level, equipment access, and specific performance goals." },
      { title: "Nutrition planning", description: "Create sustainable meal frameworks that support training demands while fitting real-life schedules and food preferences." },
      { title: "Habit formation", description: "Design small, compounding daily actions that actually stick instead of overwhelming overhauls that lead to burnout." },
      { title: "Injury prevention", description: "Identify movement patterns that increase injury risk and build in mobility and recovery work tailored to the client's sport or lifestyle." }
    ],
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
    useCases: [
      { title: "Daily systems", description: "Design morning and evening routines that protect your most important work while handling the inevitable interruptions of real life." },
      { title: "Deep work", description: "Create focused blocks and environmental triggers that let you enter flow states on cognitively demanding tasks without constant context switching." },
      { title: "Automation", description: "Build simple scripts and workflows that eliminate repetitive admin so you can spend more time on high-value creative or strategic work." },
      { title: "Review rituals", description: "Establish weekly reviews that surface what's working, what needs adjustment, and clear priorities for the week ahead." }
    ],
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
    useCases: [
      { title: "Story outlining", description: "Map out compelling three-act structures or non-linear plots with clear turning points that keep readers turning pages." },
      { title: "Character development", description: "Create multi-dimensional characters with conflicting desires, backstories, and arcs that feel real rather than archetypal." },
      { title: "Dialogue", description: "Write natural-sounding conversations that reveal character, advance plot, and avoid the stilted exposition common in first drafts." },
      { title: "Revision", description: "Diagnose weak sections in your manuscript and receive specific, actionable suggestions for strengthening pacing, tension, and voice." }
    ],
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
    useCases: [
      { title: "Conversation practice", description: "Simulate realistic dialogues in your target language with corrections and alternative phrasings that sound natural to native speakers." },
      { title: "Vocabulary building", description: "Learn words in context through example sentences and memory techniques rather than rote lists that are quickly forgotten." },
      { title: "Grammar correction", description: "Get explanations for why a sentence is wrong along with multiple corrected versions at different formality levels." },
      { title: "Cultural context", description: "Understand the unspoken social rules and idiomatic expressions that textbooks rarely teach but are essential for real communication." }
    ],
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
    useCases: [
      { title: "Itinerary creation", description: "Build day-by-day plans that balance must-see sights with hidden local gems while accounting for realistic travel times and energy levels." },
      { title: "Budget optimization", description: "Find ways to experience a destination authentically without overspending by identifying high-value activities and smart money-saving hacks." },
      { title: "Local experiences", description: "Discover authentic activities and neighborhoods that most tourists miss, often by tapping into current conversations from people who actually live there." },
      { title: "Contingency planning", description: "Prepare flexible backup plans for common disruptions like weather, strikes, or overbooked attractions so your trip doesn't fall apart." }
    ],
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
    useCases: [
      { title: "Survey design", description: "Write questions that minimize bias and actually reveal what your target customers think and do, not what they think you want to hear." },
      { title: "Trend analysis", description: "Spot emerging patterns in your industry by synthesizing conversations happening right now on social platforms with traditional data sources." },
      { title: "Competitor teardown", description: "Analyze what rivals are doing well and where they're vulnerable by examining their public messaging, customer feedback, and recent moves." },
      { title: "Persona development", description: "Create detailed, evidence-based customer profiles that go beyond demographics to include actual goals, pain points, and decision triggers." }
    ],
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
    useCases: [
      { title: "Ticket responses", description: "Write helpful, empathetic replies that resolve issues quickly while making customers feel heard instead of processed." },
      { title: "De-escalation", description: "Turn angry or frustrated customers into advocates by acknowledging their feelings and offering clear, fair next steps." },
      { title: "Knowledge base", description: "Create clear, searchable articles that actually answer the questions customers ask most often, reducing repeat tickets." },
      { title: "Process improvement", description: "Identify bottlenecks in your support workflow and design better handoffs, templates, and escalation paths." }
    ],
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
    useCases: [
      { title: "Budget creation", description: "Build realistic spending plans that account for irregular income, seasonal expenses, and the things you actually care about spending money on." },
      { title: "Debt payoff", description: "Compare strategies like avalanche versus snowball and create a motivating plan that fits your psychology and cash flow." },
      { title: "Investment choices", description: "Evaluate different investment vehicles against your time horizon, risk tolerance, and specific life goals rather than generic advice." },
      { title: "Financial goals", description: "Break down big money targets like buying a home or retiring early into monthly milestones with clear tracking and adjustment points." }
    ],
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
    useCases: [
      { title: "Conversation starters", description: "Move beyond small talk into meaningful topics that reveal values and build real connection without feeling like an interview." },
      { title: "Conflict resolution", description: "Navigate disagreements constructively by finding the underlying needs behind positions and reaching agreements both people can own." },
      { title: "Date ideas", description: "Plan experiences that match your shared interests and energy levels instead of defaulting to dinner and a movie every time." },
      { title: "Relationship check-ins", description: "Have productive conversations about how the relationship is going so small issues don't become big resentments." }
    ],
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
    useCases: [
      { title: "Discipline", description: "Set and hold boundaries with kids in ways that teach responsibility without damaging the relationship or your sanity." },
      { title: "Activities", description: "Find low-prep, high-engagement things to do together that create memories instead of just filling time with screens." },
      { title: "Communication", description: "Talk to children at their developmental level so they actually hear you and feel safe coming to you with problems." },
      { title: "Milestone support", description: "Help kids navigate big transitions like starting school or losing a pet with age-appropriate explanations and rituals." }
    ],
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
    useCases: [
      { title: "Training plans", description: "Create consistent, positive reinforcement programs for basic obedience or advanced tricks that actually work with your specific pet's personality." },
      { title: "Health concerns", description: "Understand common symptoms and when to see a vet, plus prepare good questions so appointments are more productive." },
      { title: "Behavior issues", description: "Identify the root cause behind barking, chewing, or anxiety and design targeted interventions instead of punishment." },
      { title: "Enrichment", description: "Build mental and physical stimulation into your pet's routine so they stay happy and well-behaved even when you're busy." }
    ],
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
    useCases: [
      { title: "Garden planning", description: "Design a garden that matches your climate, space, and available time instead of copying Pinterest ideas that fail in real conditions." },
      { title: "Plant care", description: "Diagnose what's wrong with struggling plants and get specific, season-appropriate care instructions instead of generic advice." },
      { title: "DIY repairs", description: "Tackle common home fixes with clear steps, tool lists, and safety reminders so projects actually get finished." },
      { title: "Tool selection", description: "Choose the right tools for the job without overspending on features you'll never use or buying cheap ones that break immediately." }
    ],
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
    useCases: [
      { title: "Sustainable living", description: "Find practical changes to your daily habits that actually reduce impact without requiring a complete lifestyle overhaul or expensive products." },
      { title: "ESG frameworks", description: "Build meaningful environmental and social governance programs that go beyond checkbox compliance and create real business value." },
      { title: "Carbon reduction", description: "Identify the highest-impact areas in your operations or personal life and create measurable reduction plans with clear milestones." },
      { title: "Reporting", description: "Turn sustainability efforts into credible reports that stakeholders trust and that highlight genuine progress instead of greenwashing." }
    ],
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
    useCases: [
      { title: "Grant writing", description: "Craft compelling proposals that clearly connect your mission to funder priorities with measurable outcomes they care about." },
      { title: "Donor engagement", description: "Build authentic relationships with supporters through personalized communication that shows impact without feeling like constant asking." },
      { title: "Program design", description: "Create effective programs that solve real community problems while staying realistic about your organization's capacity and resources." },
      { title: "Impact measurement", description: "Design simple tracking systems that prove your work makes a difference without creating overwhelming administrative burden." }
    ],
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
    useCases: [
      { title: "Proposals", description: "Write winning proposals that clearly define scope, deliverables, and value in language that resonates with the client's specific pain points." },
      { title: "Workshops", description: "Design and facilitate engaging sessions that move participants from discussion to concrete action plans they own." },
      { title: "Diagnostics", description: "Quickly assess organizational or project health and surface the root issues rather than just the visible symptoms." },
      { title: "Recommendations", description: "Deliver clear, prioritized advice that clients can actually implement given their constraints, culture, and resources." }
    ],
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
    useCases: [
      { title: "Architecture", description: "Design cloud and infrastructure setups that balance reliability, cost, and future flexibility for your actual scale and team skills." },
      { title: "Automation", description: "Build CI/CD pipelines and infrastructure as code that reduces manual toil and makes deployments boring instead of stressful." },
      { title: "Monitoring", description: "Set up observability that surfaces real problems early with actionable alerts instead of alert fatigue from too much noise." },
      { title: "Incident response", description: "Create runbooks and postmortems that turn outages into lasting improvements rather than repeated firefighting." }
    ],
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
    useCases: [
      { title: "Model development", description: "Move from prototype to production models with proper validation, versioning, and monitoring that actually improves over time." },
      { title: "Data pipelines", description: "Build reliable data flows that handle real-world messiness while keeping experiments reproducible and costs under control." },
      { title: "Evaluation", description: "Measure what actually matters for your use case instead of defaulting to accuracy metrics that hide real problems." },
      { title: "Responsible AI", description: "Identify and mitigate bias, fairness, and safety issues before models go live with concrete testing approaches." }
    ],
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
    useCases: [
      { title: "Timeline creation", description: "Build realistic project timelines that include buffer for the inevitable surprises and dependencies that kill most event plans." },
      { title: "Vendor management", description: "Negotiate clear contracts and manage relationships so vendors deliver what you agreed on without last-minute surprises." },
      { title: "Run of show", description: "Create detailed minute-by-minute plans that keep everyone on the same page during the chaos of event day." },
      { title: "Risk mitigation", description: "Anticipate what could go wrong and have concrete backup plans so problems become minor inconveniences instead of disasters." }
    ],
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
    useCases: [
      { title: "Beat making", description: "Create original beats and grooves that fit your genre while avoiding the generic loops that make tracks sound amateur." },
      { title: "Mixing", description: "Balance elements so every instrument and vocal sits in its own space with clarity and impact across different playback systems." },
      { title: "Arrangement", description: "Structure songs so they build tension and release in satisfying ways instead of staying flat or becoming repetitive." },
      { title: "Sound design", description: "Craft unique sounds and textures that give your music a signature character instead of sounding like everyone else's presets." }
    ],
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
    useCases: [
      { title: "Product copy", description: "Write descriptions that highlight the benefits customers actually care about instead of just listing features." },
      { title: "Email flows", description: "Design sequences that nurture leads or win back customers without feeling spammy or desperate." },
      { title: "Pricing", description: "Test and communicate pricing in ways that feel fair while maximizing revenue and perceived value." },
      { title: "Customer research", description: "Understand what actually drives purchase decisions by listening to real customer language instead of assumptions." }
    ],
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
    useCases: [
      { title: "Needs statements", description: "Clearly articulate the problem you're solving with evidence that makes funders care and want to be part of the solution." },
      { title: "Budgets", description: "Create transparent, justifiable budgets that show exactly how money will be used and what results it will produce." },
      { title: "Evaluation plans", description: "Design ways to measure success that satisfy funders while actually helping you improve the program in real time." },
      { title: "Executive summaries", description: "Summarize complex proposals into compelling one-pagers that busy reviewers actually read and remember." }
    ],
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
    useCases: [
      { title: "SWOT analysis", description: "Build living SWOT documents that incorporate fresh market signals instead of static documents that quickly become outdated." },
      { title: "Pricing tracking", description: "Monitor competitor pricing moves and positioning shifts in real time so you can respond strategically instead of reacting too late." },
      { title: "Feature comparison", description: "Create honest, useful comparisons that highlight real differences customers care about instead of marketing fluff." },
      { title: "Sentiment monitoring", description: "Track how customers and analysts actually feel about competitors by listening to unfiltered conversations on X and forums." }
    ],
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
    useCases: [
      { title: "Risk registers", description: "Create living documents that identify, rate, and track risks with clear owners and mitigation actions instead of shelf-ware." },
      { title: "Scenario planning", description: "Work through best, worst, and most likely cases for major decisions so you're prepared instead of surprised." },
      { title: "Compliance", description: "Translate complex regulations into practical checklists and processes your team can actually follow without constant legal babysitting." },
      { title: "Crisis prep", description: "Develop response playbooks and communication templates so your team can act decisively when something goes wrong." }
    ],
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
    useCases: [
      { title: "Meeting design", description: "Run meetings that have clear purposes, decisions, and next steps instead of being time sinks everyone dreads." },
      { title: "Async processes", description: "Build documentation and update rhythms that keep distributed teams aligned without constant meetings or missed context." },
      { title: "Feedback systems", description: "Create regular, constructive feedback loops that improve performance and psychological safety instead of awkward annual reviews." },
      { title: "Project handoffs", description: "Document and transfer work between teams so nothing gets lost and the receiving team can hit the ground running." }
    ],
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
    useCases: [
      { title: "Vision communication", description: "Translate big-picture strategy into stories and goals that inspire your team and align daily work with the bigger picture." },
      { title: "Team development", description: "Identify growth opportunities for individuals and build development plans that actually move the needle on their careers." },
      { title: "Decision making", description: "Make faster, better decisions by surfacing the right inputs and criteria while avoiding analysis paralysis or gut-feel mistakes." },
      { title: "Executive presence", description: "Communicate with clarity and confidence in high-stakes settings while still being authentic and approachable." }
    ],
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
    useCases: [
      { title: "Outfit curation", description: "Build versatile wardrobes that work for your actual life and body instead of chasing every trend on social media." },
      { title: "Trend forecasting", description: "Spot which fashion and style trends will actually matter for your audience instead of chasing every fleeting TikTok moment." },
      { title: "Brand voice", description: "Develop consistent visual and written language for fashion brands that feels authentic rather than trying too hard." },
      { title: "Personal shopping", description: "Help clients find pieces that genuinely flatter them and fit their lifestyle instead of pushing whatever is currently popular." }
    ],
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
    useCases: [
      { title: "Historical analysis", description: "Connect past events to present situations with nuance instead of oversimplified lessons or anachronistic judgments." },
      { title: "Philosophical arguments", description: "Construct clear, logical arguments on complex ethical or existential questions while acknowledging counterpoints." },
      { title: "Contextual comparison", description: "Compare ideas or events across time and cultures to reveal what is universal and what is context-dependent." },
      { title: "Essay support", description: "Strengthen academic writing with well-chosen evidence and clear argumentation tailored to the specific prompt or thesis." }
    ],
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
    useCases: [
      { title: "Celestial events", description: "Understand upcoming eclipses, meteor showers, or planetary alignments and know exactly where and when to look." },
      { title: "Explanations", description: "Get clear, accurate breakdowns of complex space science concepts without dumbing them down or losing important details." },
      { title: "Observation planning", description: "Plan successful stargazing or astrophotography sessions with the right equipment, timing, and locations for your area." },
      { title: "Space news context", description: "Make sense of the latest space missions, discoveries, or controversies with proper scientific and historical background." }
    ],
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
    useCases: [
      { title: "Self-care routines", description: "Build sustainable practices that actually recharge you instead of adding another thing to your to-do list that you feel guilty about skipping." },
      { title: "Coping skills", description: "Develop practical tools for managing anxiety, stress, or difficult emotions that you can use in the moment, not just in theory." },
      { title: "Communication", description: "Express your needs and feelings clearly in relationships without blame or shutdown so conflicts lead to connection." },
      { title: "Boundary setting", description: "Learn to say no and protect your time and energy in ways that strengthen relationships instead of creating resentment." }
    ],
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
    useCases: [
      { title: "Buying guides", description: "Compare vehicles based on your actual driving patterns, budget, and priorities instead of marketing hype or reviewer opinions." },
      { title: "Maintenance", description: "Understand what really needs to be done when and how to avoid unnecessary dealer upsells on routine service." },
      { title: "Modifications", description: "Plan upgrades that actually improve the experience you want instead of chasing looks or power you won't use." },
      { title: "Troubleshooting", description: "Diagnose common car problems with clear next steps so you can decide whether it's a DIY job or time for a professional." }
    ],
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
    useCases: [
      { title: "Training plans", description: "Design sport-specific training that builds the exact physical qualities and skills needed for your level and position." },
      { title: "Game strategy", description: "Analyze opponents and design plays or tactics that exploit their weaknesses while covering your own vulnerabilities." },
      { title: "Player development", description: "Create individualized development plans that turn raw talent into consistent performance under pressure." },
      { title: "Mental preparation", description: "Build routines and mindsets that help athletes stay focused, confident, and resilient during competition." }
    ],
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
    useCases: [
      { title: "Experience design", description: "Create immersive AR or VR experiences that feel magical but are actually usable and solve real user problems." },
      { title: "Interaction patterns", description: "Design intuitive controls and feedback that work across different hardware instead of forcing users to learn new gestures every time." },
      { title: "World building", description: "Develop rich, consistent virtual spaces with their own rules, history, and logic that feel alive to users." },
      { title: "Prototyping", description: "Quickly test core mechanics and user flows before investing in full production so you don't build the wrong thing." }
    ],
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
    useCases: [
      { title: "Robot design", description: "Choose the right mechanical platform, sensors, and actuators for the specific tasks your robot needs to perform." },
      { title: "Programming", description: "Write control code that makes robots reliable in the real world with handling for edge cases and failures." },
      { title: "Automation", description: "Integrate robots into larger workflows so they augment human work instead of creating new bottlenecks." },
      { title: "Safety", description: "Design and test systems that prevent harm to people and property while still being useful in real environments." }
    ],
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
    useCases: [
      { title: "Conceptual explanations", description: "Understand the core ideas behind quantum computing without needing a physics PhD while still getting the important nuances right." },
      { title: "Algorithm design", description: "Explore how quantum algorithms work and where they might provide real advantage over classical approaches for your problems." },
      { title: "Applications", description: "Identify which real-world problems in your field are actually good candidates for quantum approaches today or in the near future." },
      { title: "Limitations", description: "Understand current hardware constraints and error rates so you have realistic expectations about what quantum can deliver now." }
    ],
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
    useCases: [
      { title: "Tokenomics", description: "Evaluate whether a token's supply, distribution, and utility actually create sustainable value or just short-term speculation." },
      { title: "Smart contracts", description: "Understand the logic and risks in decentralized protocols so you can interact with them safely and effectively." },
      { title: "Market analysis", description: "Analyze on-chain data and community signals to separate real adoption from hype in the web3 space." },
      { title: "Project evaluation", description: "Assess the team, technology, and traction of web3 projects using criteria that actually predict long-term survival." }
    ],
    sections: [
      {
        title: "Analysis & Strategy",
        prompts: [
          { text: "Evaluate the tokenomics of [project]. What works, what are red flags?" },
          { text: "Explain how [DeFi protocol or NFT mechanic] works and its risks for users." }
        ]
      }
    ]
  },
  "zero-click-threats": {
    intro: "Zero-click threats can compromise your device with zero interaction. Use these Grok prompts to understand risks, harden your setup, detect issues early, and stay safe online.",
    useCases: [
      { title: "Understanding zero-click exploits", description: "Break down how silent attacks work in messaging apps and why they bypass traditional security." },
      { title: "Device and app hardening", description: "Apply specific updates, settings, and habits to minimize your exposure to zero-click vulnerabilities." },
      { title: "Detection and response", description: "Recognize subtle signs of compromise and follow a clear plan to contain and recover from an attack." },
      { title: "Safe communication practices", description: "Adopt low-risk habits for apps like iMessage, WhatsApp, and email to reduce zero-click attack surface." }
    ],
    sections: [
      {
        title: "Understanding & Awareness",
        prompts: [
          { text: "Explain how a zero-click exploit works in apps like iMessage or WhatsApp. Include why it's dangerous and real-world examples.", guidance: "This grok prompt for zero click threats helps you grasp the mechanics so you can take the risk seriously and prioritize defenses." },
          { text: "List the top zero-click threats in 2026 for mobile devices and how they typically spread without user action.", guidance: "Use this to stay informed on current vectors and adjust your habits accordingly for better protection." }
        ]
      },
      {
        title: "Prevention & Hardening",
        prompts: [
          { text: "Create a prioritized checklist to protect my iPhone or Android from zero-click attacks. Focus on updates, settings, and apps to avoid.", guidance: "This practical grok prompt turns abstract threats into a simple daily/weekly routine you can actually follow." },
          { text: "What settings in WhatsApp, Signal, or iMessage reduce zero-click risks the most? Explain why each one helps.", guidance: "Get targeted configuration advice to lock down your messaging apps against silent exploits." }
        ]
      },
      {
        title: "Detection & Response",
        prompts: [
          { text: "What unusual signs might indicate a zero-click compromise on my phone? How should I investigate and respond safely?", guidance: "This grok prompt to keep you safe gives you early warning signs and a calm step-by-step response plan." },
          { text: "Outline what to do in the first 30 minutes if I suspect a zero-click attack. Include preserving evidence and who to contact.", guidance: "Be prepared with this incident response prompt so you act quickly and correctly instead of panicking." }
        ]
      }
    ],
    faqs: [
      {
        "q": "Can zero-click threats affect any phone or only iPhones?",
        "a": "Both iOS and Android have had vulnerabilities. Keeping your OS and apps fully updated is the single most effective defense for either platform."
      },
      {
        "q": "Do I need special software to detect zero-click attacks?",
        "a": "Often the signs are subtle. Regular updates, avoiding suspicious messages, and monitoring for unusual behavior are more practical than paid 'anti-zero-click' tools."
      }
    ]
  },
  "ultimate-meme-machine": {
    intro: "Grok is the ultimate meme machine. Turn any situation, trend, or idea into viral, unhinged, or perfectly timed memes and captions.",
    useCases: [
      { title: "Viral meme generation", description: "Create fresh meme formats and captions that ride current trends while feeling original and shareable." },
      { title: "Caption crafting", description: "Write hilarious, relatable, or savage captions for any image or situation that hit different." },
      { title: "Format invention", description: "Invent new meme templates or twist old classics into something fresh and unexpected." },
      { title: "Humor escalation", description: "Take a basic joke or scenario and crank it up to unhinged, multi-layer meme territory." }
    ],
    sections: [
      {
        title: "Meme Creation & Captions",
        prompts: [
          { text: "Turn this situation into 5 different meme formats with perfect captions: [describe situation or paste text].", guidance: "Core grok meme prompt. Great for quickly producing multiple options with different vibes and formats." },
          { text: "Write 8 savage or wholesome captions for this image/concept that would actually perform on X.", guidance: "This prompt for ultimate meme machine helps you nail tone and timing for maximum engagement." },
          { text: "Create a brand new meme template based on [absurd premise]. Give it a name and 6 example uses.", guidance: "Use this when you want Grok to invent original formats instead of recycling old ones." },
          { text: "Generate 7 variations of this meme idea, each in a completely different format (e.g. drake, expanding brain, one does not simply).", guidance: "Rapid prototyping for meme lords who want options fast." }
        ]
      },
      {
        title: "Trend Surfing & Roasts",
        prompts: [
          { text: "Roast [person/thing/trend] using only current meme formats and references. Keep it funny not mean.", guidance: "Excellent for savage meme-style roasts that feel fresh." },
          { text: "Turn this boring fact into the most viral possible meme thread on X. Include hooks and punchlines.", guidance: "Perfect for turning dry topics into meme gold with Grok's real-time awareness." },
          { text: "Create a full 6-tweet meme thread that turns [boring topic] into the funniest thing on the timeline.", guidance: "Thread mode for maximum virality and engagement." }
        ]
      },
      {
        title: "Advanced Meme Strategies",
        prompts: [
          { text: "Analyze this meme and improve it: [paste meme or describe]. Make it 10x funnier with better structure and timing.", guidance: "Meta prompt for iterating on your own meme game." },
          { text: "Invent a meme format that combines [two unrelated things] and give 4 killer examples with captions.", guidance: "For when you want original, never-seen-before meme formats." }
        ]
      }
    ],
    faqs: [
      { q: "Can Grok actually make memes that go viral?", a: "Grok is great at capturing timing, absurdity, and cultural references. Pair the output with good visuals and post at the right moment for best results." },
      { q: "How do I make my memes less cringe?", a: "Use specific context, lean into the absurdity, and avoid over-explaining. Grok's prompts above are designed to help with that." }
    ],
    promptsGuidance: "Drop these into Grok with your specific situation, image description, or trend. The more ridiculous or timely the input, the better the output.",
    useCasesIntro: "These are the high-impact ways people use Grok as their personal meme factory for X, group chats, and content."
  },
  "savage-roasts": {
    intro: "Activate Grok's inner savage. Get perfectly timed, clever, and brutal roasts without crossing into actual cruelty.",
    useCases: [
      { title: "Comeback generation", description: "Instantly craft witty, layered roasts and clapbacks tailored to any insult or situation." },
      { title: "Friendly roasts", description: "Create hilarious but affectionate roasts for friends, coworkers, or yourself that land perfectly." },
      { title: "Public figure roasts", description: "Build clever, reference-heavy roasts of celebrities, politicians, or trends with current context." },
      { title: "Self-roast therapy", description: "Turn your own flaws or embarrassing moments into funny, self-deprecating material." }
    ],
    sections: [
      {
        title: "Classic & Savage Roasts",
        prompts: [
          { text: "Roast [person or thing] in the style of a stand-up comedian but keep it clever and not mean. Use 5 short punchy lines.", guidance: "This classic savage roast prompt gives you quick, quotable material." },
          { text: "Write a multi-layered roast for [target] that starts light and gets increasingly unhinged. End with a twist.", guidance: "Use for longer roast sessions or when you want escalating comedy." },
          { text: "Create 7 savage but affectionate roasts for my friend who [specific trait or habit].", guidance: "Great for group chats and keeping things fun among friends." }
        ]
      },
      {
        title: "Trend & Situational Roasts",
        prompts: [
          { text: "Roast this current trend or news story using only memes and pop culture references: [paste or describe].", guidance: "Leverages Grok's real-time knowledge for timely savage burns." },
          { text: "Turn my embarrassing story into a roast I can tell on myself that actually gets laughs.", guidance: "Self-roast prompt that turns vulnerability into comedy gold." }
        ]
      }
    ],
    faqs: [
      { q: "How do I keep roasts funny instead of just mean?", a: "Focus on exaggeration, wordplay, and shared references rather than attacking real insecurities. Grok's prompts are tuned for clever over cruel." },
      { q: "Can I use these for work or should they stay personal?", a: "Light friendly roasts can work in the right office culture. Always read the room and avoid anything that could be HR material." }
    ]
  },
  "story-mode-activated": {
    intro: "Flip the switch. Grok becomes your personal storyteller, worldbuilder, and chaotic narrative engine.",
    useCases: [
      { title: "Interactive storytelling", description: "Create choose-your-own-adventure style stories or collaborative narratives that branch in wild directions." },
      { title: "Character & world building", description: "Develop rich, consistent characters and worlds with Grok's help that feel alive and full of surprises." },
      { title: "Genre bending", description: "Mix genres in ridiculous or brilliant ways: horror-comedy, cyberpunk romance, sci-fi western, etc." },
      { title: "Plot twisting", description: "Generate unexpected but satisfying twists, endings, and story arcs that subvert expectations." }
    ],
    sections: [
      {
        title: "Story Starters & Branching",
        prompts: [
          { text: "Start a [genre] story in [setting]. At the end of each section give me 3 choices for what happens next.", guidance: "Classic story mode prompt for interactive, replayable narratives." },
          { text: "Create a high-concept premise for a story where [wild premise]. Give me the first chapter and 4 possible directions.", guidance: "Good for kicking off longer collaborative storytelling sessions." },
          { text: "Write an opening scene for a story called '[title]'. End it on a cliffhanger that forces the reader to continue.", guidance: "Perfect for grabbing attention and starting collaborative writing." }
        ]
      },
      {
        title: "Worldbuilding & Characters",
        prompts: [
          { text: "Build a weird but consistent world where [core rule or absurdity]. Include factions, daily life, and one major conflict.", guidance: "Excellent for deep lore and setting that feels real despite being unhinged." },
          { text: "Create a morally gray protagonist with [quirk]. Show me 3 scenes that reveal different sides of them.", guidance: "Helps you develop layered characters instead of one-note heroes." },
          { text: "Rewrite this basic plot as a [different genre] version with completely different tone and stakes.", guidance: "Great remix prompt for seeing how stories change with genre shifts." },
          { text: "Design 5 unforgettable side characters for a story about [main premise]. Give each a secret and a flaw.", guidance: "Builds rich ensemble casts fast." }
        ]
      },
      {
        title: "Plot Twists & Endings",
        prompts: [
          { text: "Generate 3 shocking but fair plot twists for a story where [current plot point].", guidance: "Story mode activated for those 'no way' moments that still make sense." }
        ]
      }
    ],
    faqs: [
      { q: "Can Grok remember long stories across messages?", a: "Grok has a large context window but it's best to paste key previous details or summaries when continuing long narratives." },
      { q: "How do I steer the story without it getting too silly?", a: "Be specific in your prompts about tone, stakes, and constraints. You can always say 'keep it grounded' or 'make it darker'." }
    ],
    promptsGuidance: "The more specific and unhinged your constraints, the better Grok's story mode performs. Use 'continue in the style of...' to keep consistency."
  },
  "wild-image-ideas": {
    intro: "Let Grok off the leash for image generation. These prompts produce the weird, hilarious, and completely unfiltered visuals.",
    useCases: [
      { title: "Absurd concept generation", description: "Create prompts that combine unrelated ideas into gloriously chaotic and funny images." },
      { title: "Meme-to-image", description: "Turn existing memes, jokes, or text into visual prompts that capture the energy perfectly." },
      { title: "Surreal & unhinged art", description: "Generate prompts for bizarre, dreamlike, or nightmare-fuel images that still have artistic merit." },
      { title: "Character & scene remixing", description: "Take normal subjects and throw them into wildly inappropriate or hilarious situations and styles." }
    ],
    sections: [
      {
        title: "Chaotic & Funny Prompts",
        prompts: [
          { text: "A [normal thing] but it's [absurd twist] in the style of [artist or aesthetic]. Highly detailed, cinematic lighting.", guidance: "This wild image prompt template is reliable for creating shareable, laugh-out-loud concepts." },
          { text: "Generate 5 completely unhinged image prompts based on this idea: [your seed concept]. Make them increasingly ridiculous.", guidance: "Use when you want Grok to escalate the weirdness for you." },
          { text: "Turn this meme or joke into a detailed image prompt that would make the perfect visual: [paste meme or joke].", guidance: "Excellent bridge between text humor and actual image generation." }
        ]
      },
      {
        title: "Style & Situation Remixes",
        prompts: [
          { text: "A [profession or animal] having an existential crisis in [unexpected location], photorealistic, dramatic lighting.", guidance: "Reliable formula for funny yet high-quality wild images." },
          { text: "Create a prompt for an image that perfectly captures the feeling of [emotion or vibe] but in the most over-the-top way possible.", guidance: "Good for emotional concepts turned visually extreme." }
        ]
      }
    ],
    faqs: [
      { q: "How do I make Grok image prompts actually good?", a: "Be specific about style, lighting, composition, and mood. Reference artists or aesthetics you like. The wilder the concept, the more detailed the description should be." },
      { q: "Can these be used for commercial stuff?", a: "Check the terms of the image model you're using (Grok's image gen or others). These prompts are designed for creative/fun use." }
    ]
  }
};

export const getCategoryPrompts = (slug: string): CategoryContent => {
  if (categoryContent[slug]) return categoryContent[slug];

  const title = slug.replace(/-/g, ' ');
  return {
    intro: `Discover how Grok can transform your work in ${title.toLowerCase()} with targeted prompts that leverage real-time insights and structured thinking for better results.`,
    useCases: [
      { title: `${title} workflows`, description: `Build repeatable processes that remove friction from your regular ${title.toLowerCase()} tasks so you can focus on the work that actually matters.` },
      { title: `${title} research & analysis`, description: `Quickly gather and synthesize information from multiple sources into clear insights you can act on for ${title.toLowerCase()}.` },
      { title: `${title} content & communication`, description: `Produce clear, on-point writing and presentations that get your ideas across without wasting the reader's time in ${title.toLowerCase()}.` },
      { title: `${title} decision support`, description: `Structure complex choices with pros, cons, and relevant context so you can decide with more confidence and less regret when working in ${title.toLowerCase()}.` }
    ],
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
