import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "../ui/button";
import Link from "next/link";
import { redirect, useRouter } from "next/navigation";

export default function MainPage({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-blue-500">
        <div>
          <DialogTitle className="text-2xl">Welcome</DialogTitle>
          <DialogDescription className="text-md">
            🚧 This site is in development, and is only a showcase atm.🚧 <br />{" "}
            <br />
            It is currently <span className="font-bold">
              70% completed
            </span>{" "}
            with a working moderation/shift panel{" "}
            <span className="text-sm">(ERLC is incomplete)</span> and a
            dashboard{" "}
            <span className="text-sm">(Member Management incomplete.)</span>
          </DialogDescription>
        </div>
        <Button
          className="mt-6"
          onClick={() => {
            localStorage.setItem("hasSeenDialog", "true");
            onOpenChange(false);
          }}
        >
          I understand, don't show again.
        </Button>
        <Button
          onClick={() => router.push("https://github.com/bugsbirb/Temly")}
          variant={"purple"}
        >
          Star Project
        </Button>
      </DialogContent>
    </Dialog>
  );
}
