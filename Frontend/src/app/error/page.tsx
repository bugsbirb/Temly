import { Button } from "@/components/ui/button";
import {
  Card,
  CardTitle,
  CardDescription,
  CardHeader,
  CardContent,
} from "@/components/ui/card";

export default function Page() {
  const e = "g.map() not a function";
  return (
    <div className="bg-gradient-to-br from-neutral-900 h-screen">
      <section className="flex justify-center items-center h-screen">
        <Card className="border-red-400/80 min-w-[24rem] max-w-2xl">
          <CardHeader>
            <CardTitle>An error has occured</CardTitle>
            <CardDescription>
              Please report this issue, to an developer through github or
              discord.
            </CardDescription>
          </CardHeader>
          <hr />

          <CardContent className="flex flex-col gap-4">
            <div>
              <Card>
                <CardContent>
                  <code>{e}</code>
                </CardContent>
              </Card>
            </div>
            <div>
              <hr />
            </div>
            <div className="w-full flex flex-col gap-2">
              <Button variant={"outline"}>Make a Github Issue</Button>
              <Button variant={"blue"}>Contact Discord Support</Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
