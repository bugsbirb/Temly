"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardTitle,
  CardDescription,
  CardHeader,
  CardContent,
} from "@/components/ui/card";
import * as Sentry from "@sentry/nextjs";
import { useEffect, useState } from "react";

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  const [eventId, setEventId] = useState<string | null>(null);

  useEffect(() => {
    const id = Sentry.captureException(error);
    setEventId(id);
  }, [error]);

  return (
    <div className="bg-gradient-to-br from-neutral-900 h-screen dark">
      <section className="flex justify-center items-center h-screen">
        <Card className="border-red-400/80 min-w-[24rem] max-w-2xl bg-card">
          <CardHeader>
            <CardTitle>An error has occurred</CardTitle>
            <CardDescription>
              Please report this issue to the developers on GitHub or Discord.
            </CardDescription>
          </CardHeader>
          <hr />
          <CardContent className="flex flex-col gap-4">
            <div>
              <Card>
                <CardContent>
                  <code>{eventId ? eventId : "Generating..."}</code>
                </CardContent>
              </Card>
            </div>
            <div>
              <hr />
            </div>
            <div className="w-full flex flex-col gap-2">
              <Button variant="outline">Make a GitHub Issue</Button>
              <Button variant="blue">Contact Discord Support</Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
