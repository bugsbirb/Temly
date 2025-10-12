"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { IceCream } from "lucide-react";
import { toast } from "sonner";

export default function UI() {
  return (
    <div className="h-screen space-x-2 ">
      <div className="flex p-2 space-x-2">
        <Card>
          <CardHeader>
            <CardTitle>Sonner</CardTitle>
            <CardDescription>AAAAAAAAAAAAAAAAAAAAAAAAA</CardDescription>
          </CardHeader>
          <hr />
          <CardContent className="space-x-2">
            <Button
              onClick={() =>
                toast.success("This is a toast", {
                  description: "This is a toast",
                })
              }
            >
              Success Toast
            </Button>
            <Button
              onClick={() =>
                toast.error("This is a toast", {
                  description: "This is a toast",
                })
              }
            >
              Destructive Toast
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Buttons</CardTitle>
            <CardDescription>AAAAAAAAAA</CardDescription>
          </CardHeader>
          <hr />
          <CardContent className=" grid grid-cols-3 gap-2">
            <Button variant={"success"}>Success</Button>
            <Button variant={"destructive"}>Destructive</Button>
            <Button variant={"default"}>Regular</Button>
            <Button variant={"purple"}>Purple</Button>
            <Button variant={"amber"}>amber</Button>
            <Button variant={"link"}>linkk</Button>
            <Button variant={"ghost"}>ghostin</Button>
            <Button variant={"teal"}>teal</Button>
            <Button variant={"blue"}>Blue/Main</Button>
            <Button variant={"pink"}>pink</Button>
            <Button variant={"outline"}>Outline</Button>
            <Button variant={"outline"} size={"icon"}><IceCream /></Button>
            
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
