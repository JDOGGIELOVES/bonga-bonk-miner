import CopyButton from './CopyButton';

interface PromptCardProps {
  text: string;
  title?: string;
  guidance?: string;
}

export default function PromptCard({ text, title, guidance }: PromptCardProps) {
  return (
    <div className="bg-white p-5 rounded-2xl border prompt-card">
      {title && <div className="text-xs uppercase tracking-wide text-gray-500 mb-2">{title}</div>}
      <p className="font-mono text-sm mb-3 text-gray-800 leading-relaxed">{text}</p>
      {guidance && <p className="text-xs text-gray-600 mb-3 leading-snug">{guidance}</p>}
      <CopyButton text={text} />
    </div>
  );
}
