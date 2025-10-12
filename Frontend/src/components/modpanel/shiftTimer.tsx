"use client";
import { useState, useEffect } from "react";

type Break = {
  startTime: string;
  endTime?: string;
};

export default function ShiftTimer({
  startTime,
  breaks = [],
}: {
  startTime: string;
  breaks?: Break[];
}) {
  const [secondsElapsed, setSecondsElapsed] = useState(0);

  function isOnBreak(breaks: Break[]) {
    return breaks.some((b) => b.startTime && !b.endTime);
  }

  function BreakSeconds(breaks: Break[]) {
    return breaks.reduce((total, b) => {
      if (!b.startTime) return total;
      const start = new Date(b.startTime).getTime();
      const end = b.endTime
        ? new Date(b.endTime).getTime()
        : new Date().getTime();
      const diff = (end - start) / 1000;
      return total + Math.max(0, diff);
    }, 0);
  }

  useEffect(() => {
    if (!startTime) return;

    const start = new Date(startTime).getTime();
    const now = new Date().getTime();
    const initialElapsed =
      Math.floor((now - start) / 1000) - BreakSeconds(breaks);
    setSecondsElapsed(Math.max(0, initialElapsed));

    const interval = setInterval(() => {
      if (!isOnBreak(breaks)) {
        const now = new Date().getTime();
        const breakSeconds = BreakSeconds(breaks);
        const elapsed = Math.floor((now - start) / 1000) - breakSeconds;
        setSecondsElapsed(Math.max(0, elapsed));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime, breaks]);

  if (!startTime) return <div>0s</div>;

  const hours = Math.round(Math.floor(secondsElapsed / 3600));
  const minutes = Math.round(Math.floor((secondsElapsed % 3600) / 60));
  const seconds = Math.round(secondsElapsed % 60);

  let formattedTime = "";
  if (hours > 0) formattedTime += `${hours}h `;
  if (minutes > 0) formattedTime += `${minutes}m `;
  formattedTime += `${seconds}s`;

  return <div>{formattedTime}</div>;
}
