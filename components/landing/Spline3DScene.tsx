"use client";

import { useEffect } from "react";

interface Spline3DSceneProps {
  sceneUrl: string;
  className?: string;
}

export default function Spline3DScene({ sceneUrl, className = "" }: Spline3DSceneProps) {
  useEffect(() => {
    // Dynamically load Spline script if not already loaded
    if (!(window as any).Spline) {
      const script = document.createElement("script");
      script.src = "https://unpkg.com/@splinetool/runtime@1.0.35/build/runtime.js";
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  return (
    <div className={`w-full h-full ${className}`}>
      <canvas
        data-spline={sceneUrl}
        style={{ width: "100%", height: "100%", display: "block" }}
      />
    </div>
  );
}
