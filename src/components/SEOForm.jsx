import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loading } from "./Loading";
import AlertBox from "./AlertBox";

export const SEOForm = () => {
  const [keyword, setKeyword] = useState("");
  const [urls, setUrls] = useState("");
  const [hasFeature, setHasFeature] = useState(false);
  const [featureText, setFeatureText] = useState("");
  const [loading, setLoading] = useState(false);
  const [alertType, setAlertType] = useState(null); // 'success' or 'error'
  const [alertMessage, setAlertMessage] = useState(null);
  const navigate = useNavigate();

  const handleGenerate = async () => {
    if (!keyword.trim()) {
      setAlertType("error");
      setAlertMessage("Focus keyword is required.");
      return;
    }

    setLoading(true);

    // Build optional feature section
    const featureSection =
      hasFeature && featureText.trim()
        ? `\nFeature: **${featureText.trim()}**\n`
        : "";

    const prompt = `I want you to generate SEO-optimized content for a FiveM MLO digital product.

Use the following inputs:

Focus Keyword: **${keyword}**
Reference URLs: ${urls}${featureSection}

Make sure:
- The **title** is clear and includes the keyword.
- The **meta description** is attractive and under 160 characters.
- The **description** is detailed (300–600 words), describing the MLO features and benefits.
- The **tags** are comma-separated keywords relevant to FiveM and the product.
- Use a realistic **price** based on the URLs in the $4–$40 range.
- The **category** is appropriate for the product type (e.g., Police Station, Hospital, Club).

Return only the JavaScript object as plain text. No explanation, no code block formatting.`;

    try {
      const isDev = import.meta.env.DEV;
      const apiUrl = isDev ? "http://localhost:3000/api/generate" : "/api/generate";

      console.log("Making API request to:", apiUrl);
      console.log("Request payload:", { prompt, keyword, urls, featureText });

      const sessionId = localStorage.getItem("sessionId");

      const res = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionId}`,
        },
        body: JSON.stringify({ prompt, keyword, urls, feature: hasFeature ? featureText : "" }),
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      console.log("API response:", data);

      const raw =
        data?.candidates?.[0]?.content?.parts?.[0]?.text || "No result found";

      const cleaned = raw
        .replace(/^```(?:javascript|json)?\s*\n?/, "")
        .replace(/```\s*$/, "")
        .trim();

      const parsedResult = JSON.parse(cleaned);

      localStorage.setItem("seo_result", JSON.stringify(parsedResult));

      navigate("/result", { state: { result: parsedResult } });
    } catch (err) {
      console.error(err);
      setAlertType("error");
      setAlertMessage("Failed to fetch or parse result.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setKeyword("");
    setUrls("");
    setHasFeature(false);
    setFeatureText("");
  };

  return (
    <>
      {alertMessage && (
        <AlertBox
          type={alertType}
          message={alertMessage}
          onClose={() => setAlertMessage(null)}
        />
      )}

      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl bg-white p-8 rounded-xl shadow-md space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block font-medium text-gray-700 mb-1">
                Focus Keyword:
              </label>
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="e.g., gang mlo fivem"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            <div>
              <label className="block font-medium text-gray-700 mb-1">
                Reference URLs:
              </label>
              <textarea
                rows="3"
                value={urls}
                onChange={(e) => setUrls(e.target.value)}
                placeholder="Paste URLs here"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              ></textarea>
            </div>

            <div className="flex items-center space-x-3">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={hasFeature}
                  onChange={(e) => {
                    setHasFeature(e.target.checked);
                    if (!e.target.checked) setFeatureText("");
                  }}
                  className="h-4 w-4"
                />
                <span className="font-medium">Add Feature</span>
              </label>
            </div>

            {hasFeature && (
              <div>
                <label className="block font-medium text-gray-700 mb-1">
                  Feature Description:
                </label>
                <input
                  type="text"
                  value={featureText}
                  onChange={(e) => setFeatureText(e.target.value)}
                  placeholder="e.g., Interactive police briefing room"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              <button
                className="px-6 py-2 bg-yellow-400 text-black font-semibold rounded hover:bg-yellow-500 transition"
                onClick={handleGenerate}
              >
                🚀 Generate SEO Content
              </button>
              <button
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
                onClick={handleReset}
              >
                🔄 Reset
              </button>
            </div>
          </div>
        </div>
      </div>
      {loading && <Loading />}
    </>
  );
};
