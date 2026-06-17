export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  date: string;
  content: React.ReactNode;
}

export const blogPosts: BlogPost[] = [
  {
    slug: 'prompt-engineering-masterclass',
    title: 'Grok Prompt Engineering Masterclass',
    description: 'Advanced patterns including chain-of-thought, few-shot, meta-prompting, and evaluation loops.',
    date: 'October 2025',
    content: (
      <>
        <p>Mastering Grok requires going beyond basic instructions. Here are the techniques that consistently deliver dramatically better outputs.</p>
        
        <h2 className="text-2xl font-semibold mt-8 mb-3">Chain-of-Thought Variants</h2>
        <p>Ask the model to show its reasoning in structured steps. This dramatically reduces hallucinations on complex problems.</p>
        
        <h2 className="text-2xl font-semibold mt-8 mb-3">Meta-Prompting</h2>
        <p>Have Grok critique and improve your own prompt before answering. Example: “First, improve this prompt for clarity and specificity. Then answer the improved version.”</p>
        
        <h2 className="text-2xl font-semibold mt-8 mb-3">Self-Evaluation</h2>
        <p>After generating, ask: “Rate the quality of your previous answer on a scale of 1-10 and explain how to improve it.” Then iterate.</p>
      </>
    )
  },
  {
    slug: 'real-time-research',
    title: 'How Grok Changes Real-Time Research',
    description: 'Leverage Grok’s X integration for fresher insights than Google or other AIs can provide.',
    date: 'October 2025',
    content: (
      <>
        <p>Traditional search engines lag. Grok gives you direct access to what people are saying right now on X.</p>
        
        <h2 className="text-2xl font-semibold mt-8 mb-3">Key Techniques</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>Search for rising sentiment around a topic</li>
          <li>Find early signals from niche communities</li>
          <li>Track competitor mentions in real time</li>
        </ul>
        
        <p className="mt-6">Combine this with the search guide prompts for maximum effect.</p>
      </>
    )
  },
  {
    slug: 'grok-for-business-workflows',
    title: 'Grok for Business: 2026 Workflows That Actually Work',
    description: 'Practical systems teams are using to get more done with Grok every week.',
    date: 'October 2025',
    content: (
      <>
        <p>Don’t just use Grok for one-off questions. Build repeatable workflows.</p>
        
        <h2 className="text-2xl font-semibold mt-8 mb-3">Weekly Intelligence Routine</h2>
        <ol className="list-decimal pl-6 space-y-2">
          <li>Monday: Pull top X conversations in your industry</li>
          <li>Wednesday: Competitor and trend deep-dive</li>
          <li>Friday: Summarize wins/losses and generate next week plan</li>
        </ol>
        
        <p className="mt-6">The business category page has dozens of ready-made prompts for these workflows.</p>
      </>
    )
  }
];
