import { useState } from "react";

export const CopyableField = ({ label, value, isTextarea }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div>
      <label className="text-gray-300 text-sm">{label}</label>
      <div className="relative mt-1">
        {isTextarea ? (
          <textarea
            className="w-full bg-gray-800 text-white border border-gray-600 rounded px-3 py-2 pr-14 resize-none"
            value={value}
            readOnly
            rows={4}
          />
        ) : (
          <input
            type="text"
            className="w-full bg-gray-800 text-white border border-gray-600 rounded px-3 py-2 pr-14"
            value={value}
            readOnly
          />
        )}

        <button
          onClick={handleCopy}
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-gray-700 hover:bg-gray-600 text-white text-xs px-2 py-1 rounded"
        >
          {copied ? "✅ Copied" : "📋 Copy"}
        </button>
      </div>
    </div>
  );
};
