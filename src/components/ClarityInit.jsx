"use client";
import { useEffect } from "react";
import Clarity from "@microsoft/clarity";

export default function ClarityInit() {
  useEffect(() => {
    if (typeof window !== "undefined" && process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID) {
      Clarity.init(process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID);
      console.log("✅ Microsoft Clarity initialized");
    }
  }, []);

  return null;
}