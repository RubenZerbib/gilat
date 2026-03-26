"use client";

import React, { useRef, useCallback } from "react";
import ReactSignatureCanvas from "react-signature-canvas";

interface SignatureCanvasProps {
  onSignatureChange: (dataUrl: string) => void;
  value?: string;
}

function trimCanvas(canvas: HTMLCanvasElement): HTMLCanvasElement {
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;

  const { width, height } = canvas;
  const imageData = ctx.getImageData(0, 0, width, height).data;

  let top = height, bottom = 0, left = width, right = 0;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const alpha = imageData[(y * width + x) * 4 + 3];
      if (alpha > 0) {
        if (y < top) top = y;
        if (y > bottom) bottom = y;
        if (x < left) left = x;
        if (x > right) right = x;
      }
    }
  }

  if (bottom === 0 && top === height) return canvas;

  const pad = 10;
  top = Math.max(0, top - pad);
  left = Math.max(0, left - pad);
  bottom = Math.min(height - 1, bottom + pad);
  right = Math.min(width - 1, right + pad);

  const trimmed = document.createElement("canvas");
  trimmed.width = right - left + 1;
  trimmed.height = bottom - top + 1;
  trimmed.getContext("2d")!.drawImage(
    canvas,
    left, top, trimmed.width, trimmed.height,
    0, 0, trimmed.width, trimmed.height
  );
  return trimmed;
}

export default function SignatureCanvas({
  onSignatureChange,
  value,
}: SignatureCanvasProps) {
  const sigRef = useRef<ReactSignatureCanvas>(null);

  const handleEnd = useCallback(() => {
    if (sigRef.current && !sigRef.current.isEmpty()) {
      const canvas = sigRef.current.getCanvas();
      const dataUrl = trimCanvas(canvas).toDataURL("image/png");
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
