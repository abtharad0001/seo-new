import { useState, useEffect } from "react";
import { marked } from "marked";

export const CopyableHTMLBlock = ({ label, markdown }) => {
  const [copied, setCopied] = useState(false);
  const [html, setHtml] = useState("");

  useEffect(() => {
    const converted = marked.parse(markdown || "");
    setHtml(converted);
  }, [markdown]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(html);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div>
      <label className="text-gray-300 text-sm">{label}</label>
      <div className="relative mt-1 bg-gray-900 p-4 rounded border border-gray-700">
        <div
          className="text-white prose prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: html }}
        />
        <button
          onClick={handleCopy}
          className="absolute top-2 right-2 bg-gray-700 hover:bg-gray-600 text-xs px-2 py-1 rounded text-white"
        >
          {copied ? "✅ Copied" : "📋 Copy HTML"}
        </button>
      </div>
    </div>
  );
};
