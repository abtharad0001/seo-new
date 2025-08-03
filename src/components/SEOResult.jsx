import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { CopyableField } from "./CopyableField";
import { CopyableHTMLBlock } from "./CopyableHTMLBlock";

export const SEOResult = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // ✅ Make sure result is defined before using it
  const result =
    location.state?.result ||
    JSON.parse(localStorage.getItem("seo_result") || "null");

  if (!result) {
    return (
      <div className="p-6 text-center">
        <p>No result received.</p>
        <button
          onClick={() => navigate("/")}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
        >
          🔄 Go Back
        </button>
      </div>
    );
  }

  // ✅ Use result safely after it's declared
  const tagsArray =
    typeof result.tags === "string"
      ? result.tags.split(",").map((tag) => tag.trim())
      : Array.isArray(result.tags)
      ? result.tags
      : [];

  return (
    <div className="h-screen w-full bg-black text-white overflow-hidden pt-12 pb-4">
      <div className="h-full w-full overflow-y-auto max-w-3xl mx-auto space-y-4 px-4">
        <h2 className="text-2xl font-semibold text-white">
          🚀 SEO Content Result
        </h2>

        <CopyableField label="🔖 Title" value={result.title} />
        <CopyableField
          label="📝 Meta Description"
          value={result.meta_description}
        />
        <CopyableHTMLBlock
          label="📄 Description"
          markdown={result.description}
        />

        <CopyableField label="💰 Price" value={`$${result.price}`} />
        <CopyableField label="🏷️ Tags" value={tagsArray.join(", ")} />
        <CopyableField label="📂 Category" value={result.category || "N/A"} />

        <button
          onClick={() => navigate("/")}
          className="mt-6 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          🔄 Generate Again
        </button>
      </div>
    </div>
  );
};
