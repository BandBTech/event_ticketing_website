
"use client";
import { useEffect } from "react";

export function PageTitle({ title }: { title: string }) {
  useEffect(() => {
    document.title = `${title} | Timro-Ticket`;
  }, [title]);

  return null; 
}