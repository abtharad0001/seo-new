// components/AlertBox.jsx
import React, { useEffect, useState } from "react";
import { X, AlertTriangle, CheckCircle, Info } from "lucide-react";
import clsx from "clsx";

const ICONS = {
  error: <AlertTriangle className="h-5 w-5 text-red-500" />,
  success: <CheckCircle className="h-5 w-5 text-green-500" />,
  warning: <AlertTriangle className="h-5 w-5 text-yellow-500" />,
  info: <Info className="h-5 w-5 text-blue-500" />,
};

const AlertBox = ({ type = "info", message, onClose }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 300); // Delay to allow fade out
    }, 3000);
    return () => clearTimeout(timeout);
  }, [onClose]);

  return (
    <div
      className={clsx(
        "fixed top-12 left-1/2 z-50 w-fit max-w-[90vw] -translate-x-1/2 transform overflow-hidden rounded-xl border px-6 py-3 shadow-xl transition-all duration-300 ease-in-out",
        visible ? "opacity-100 scale-100" : "opacity-0 scale-95",
        {
          "border-red-300 bg-white text-red-600": type === "error",
          "border-green-300 bg-white text-green-600": type === "success",
          "border-yellow-300 bg-white text-yellow-700": type === "warning",
          "border-blue-300 bg-white text-blue-600": type === "info",
        }
      )}
    >
      <div className="flex items-center gap-3">
        {ICONS[type] || ICONS.info}
        <span className="text-sm font-medium">{message}</span>
        <button onClick={() => setVisible(false)} className="ml-auto hover:opacity-80">
          <X size={18} />
        </button>
      </div>
    </div>
  );
};

export default AlertBox;
