"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Image from "next/image";
import Markdown from "react-markdown";
import remarkBreaks from "remark-breaks";
import { useSession } from "@/hooks/use-session";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import NavigationMenu from "@/components/Main/NavMenu";


// TODO: Move to API

const updates = [
  {
    date: new Date(),
    title: "ERLC isn't finished",
    description: "So some features are missing",
    button: { text: "Subscribe", link: "" },
  },
  {
    date: new Date(),
    title: "Release [temp]",
    description:
      "We are proud to say that we have released!\n You can now become a #1 erlc nerd and grind shifts.\n While neglecting any sun light.",
    version: "v0.1",
    button: { text: "Subscribe", link: "" },
  },
];

export default function Page() {
  const session = useSession()
  return (
    <div className="bg-gradient-to-br from-neutral-900 min-h-screen">
      <NavigationMenu session={session} />
      <div className="flex justify-center items-center flex-col">
        <Card className=" w-[95%] md:w-[60%] mt-2 py-0">
          <Card className="bg-gradient-to-tr from-blue-500 to-blue-600 rounded-b-none">
            <CardContent className="flex justify-center items-center font-extrabold text-4xl">
              What's new?
            </CardContent>
          </Card>
          <CardContent className="pb-6">
            <CardHeader>
              <CardTitle>News & Updates</CardTitle>
              <CardDescription>
                Here you can get news and updates from the service.
              </CardDescription>
            </CardHeader>
          </CardContent>
        </Card>
        <ScrollArea className="w-[95%] md:w-[60%] h-[full mt-4">
          <div className="flex flex-col items-start w-full">
            {updates.map((update, idx) => (
              <Card key={idx} className="w-full mb-4">
                <CardHeader>
                  <span className="flex flex-row gap-2 items-center">
                    {update.version && (
                      <Badge variant={"outline"}>{update.version}</Badge>
                    )}
                    <CardTitle>{update.title}</CardTitle>
                  </span>

                  <CardDescription>
                    {update.date.toDateString()}
                  </CardDescription>
                </CardHeader>
                <hr />
                <CardContent>
                  <Markdown remarkPlugins={[remarkBreaks]}>
                    {update.description}
                  </Markdown>
                  <div className="pt-6">
                    {update.version && (
                      <Button size={"ssm"} variant={"link"}>
                        View Release on Github
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <ScrollBar orientation="vertical" />
        </ScrollArea>
      </div>
    </div>
  );
}
