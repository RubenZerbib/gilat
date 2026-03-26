"use client";

import React, { useRef, useCallback } from "react";
import ReactSignatureCanvas from "react-signature-canvas";

interface SignatureCanvasProps {
  onSignatureChange: (dataUrl: string) => void;
  value?: string;
}

export default function SignatureCanvas({
  onSignatureChange,
  value,
}: SignatureCanvasProps) {
  const sigRef = useRef<ReactSignatureCanvas>(null);

  const handleEnd = useCallback(() => {
    if (sigRef.current && !sigRef.current.isEmpty()) {
      const dataUrl = sigRef.current.getCanvas().toDataURL("image/png");
      onSignatureChange(dataUrl);
    }
  }, [onSignatureChange]);

  const handleClear = useCallback(() => {
    sigRef.current?.clear();
    onSignatureChange("");
  }, [onSignatureChange]);

  return (
    <div className="space-y-3">
      <label className="block text-lg font-semibold text-gray-700">
        חתימה
      </label>
      <div className="border-2 border-dashed border-gray-300 rounded-xl bg-white overflow-hidden">
        <ReactSignatureCanvas
          ref={sigRef}
          canvasProps={{
            className: "w-full",
            style: { width: "100%", height: "200px" },
          }}
          penColor="black"
          minWidth={1.5}
          maxWidth={3}
          onEnd={handleEnd}
        />
      </div>
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={handleClear}
          className="px-6 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
        >
          נקה חתימה
        </button>
        {value && (
          <span className="text-sm text-green-600 font-medium">
            ✓ חתימה נשמרה
          </span>
        )}
      </div>
    </div>
  );
}
