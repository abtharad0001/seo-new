import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AlertBox from "./AlertBox";
import { Loading } from "./Loading";

export const SEOContentList = () => {
  const [contentList, setContentList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alertMessage, setAlertMessage] = useState(null);
  const [alertType, setAlertType] = useState("error");
  const navigate = useNavigate();

  const fetchSEOContent = async () => {
    setLoading(true);
    try {
      const getApiBase = () => {
        if (import.meta.env.DEV) {
          return `http://${window.location.hostname}:3000`;
        }
        return "";
      };
      const apiUrl = `${getApiBase()}/api/seo-content`;
      console.log("Posting login to:", apiUrl);
      const sessionId = localStorage.getItem("sessionId");

      const response = await fetch(apiUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${sessionId}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setContentList(data.data);
      } else {
        setAlertType("error");
        setAlertMessage(data.error || "Failed to fetch content");
      }
    } catch (error) {
      console.error("Error fetching SEO content:", error);
      setAlertType("error");
      setAlertMessage("Failed to connect to server or fetch content");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSEOContent();
  }, []);

  const handleView = (content) => {
    try {
      const parsedResult = JSON.parse(content.generatedContent);
      localStorage.setItem("seo_result", JSON.stringify(parsedResult));
      navigate("/result", { state: { result: parsedResult } });
    } catch (e) {
      setAlertType("error");
      setAlertMessage("Failed to parse content. It might be malformed.");
      console.error("Parsing error:", e);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this content?")) {
      return;
    }

    setLoading(true);
    try {
      const isDev = import.meta.env.DEV;
      const apiUrl = isDev ? `http://localhost:3000/api/seo-content/${id}` : `/api/seo-content/${id}`;
      const sessionId = localStorage.getItem("sessionId");

      const response = await fetch(apiUrl, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${sessionId}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setAlertType("success");
        setAlertMessage("Content deleted successfully!");
        fetchSEOContent(); // Refresh the list
      } else {
        setAlertType("error");
        setAlertMessage(data.error || "Failed to delete content");
      }
    } catch (error) {
      console.error("Error deleting SEO content:", error);
      setAlertType("error");
      setAlertMessage("Failed to connect to server or delete content");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <>
      {alertMessage && (
        <AlertBox
          type={alertType}
          message={alertMessage}
          onClose={() => setAlertMessage(null)}
        />
      )}

      <div className="min-h-screen bg-gray-100 p-4">
        <div className="w-full max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-md space-y-6">
          <h1 className="text-2xl font-bold text-gray-800 text-center">Saved SEO Content</h1>

          {contentList.length === 0 ? (
            <p className="text-center text-gray-600">No saved content yet. Generate some SEO content!</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-sm">
                <thead>
                  <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
                    <th className="py-3 px-6 text-left">Keyword</th>
                    <th className="py-3 px-6 text-left">URLs</th>
                    <th className="py-3 px-6 text-center">Generated On</th>
                    <th className="py-3 px-6 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-gray-600 text-sm font-light">
                  {contentList.map((content) => (
                    <tr key={content._id} className="border-b border-gray-200 hover:bg-gray-100">
                      <td className="py-3 px-6 text-left whitespace-nowrap">{content.keyword}</td>
                      <td className="py-3 px-6 text-left">{content.urls || "N/A"}</td>
                      <td className="py-3 px-6 text-center">{new Date(content.createdAt).toLocaleDateString()}</td>
                      <td className="py-3 px-6 text-center">
                        <div className="flex item-center justify-center space-x-2">
                          <button
                            onClick={() => handleView(content)}
                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition text-xs"
                          >
                            View
                          </button>
                          <button
                            onClick={() => handleDelete(content._id)}
                            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition text-xs"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}; 