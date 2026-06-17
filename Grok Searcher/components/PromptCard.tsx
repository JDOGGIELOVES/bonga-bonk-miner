import CopyButton from './CopyButton';

interface PromptCardProps {
  text: string;
  title?: string;
}

export default function PromptCard({ text, title }: PromptCardProps) {
  return (
    <div className="bg-white p-5 rounded-2xl border prompt-card">
      {title && <div className="text-xs uppercase tracking-wide text-gray-500 mb-2">{title}</div>}
      <p className="font-mono text-sm mb-4 text-gray-800 leading-relaxed">{text}</p>
      <CopyButton text={text} />
    </div>
  );
}
