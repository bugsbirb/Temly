import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import Image from "next/image";

export default function ExpandModeration({
  open,
  onOpenChange,
  selectedModeration,
  setModeration,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedModeration: any;
  setModeration: any;
}) {
  if (!selectedModeration) return null;

  const avatarUrl = selectedModeration?.avatarUrl ?? "/unknown.webp";
  const username = selectedModeration?.username ?? "Unknown User";
  const authorAvatar = selectedModeration?.author?.avatarUrl ?? "/unknown.webp";
  const authorName = selectedModeration?.author?.username ?? "Unknown Staff";
  const reason = selectedModeration?.reason ?? "No reason provided";
  const action = selectedModeration?.action ?? "No action specified";

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="flex flex-col w-full">
        <div className="flex flex-col items-center justify-center w-full">
          <Image
            src={avatarUrl}
            className="rounded-full"
            alt={username}
            width={40}
            height={40}
          />
          <DialogTitle className="my-2">{username}</DialogTitle>
        </div>
        <hr />
        <div className="flex flex-col gap-6">
          <div>
            <Label className="mb-2 block">Staff</Label>
            <div className="flex flex-row items-center gap-2">
              <Image
                src={authorAvatar}
                className="rounded-full"
                alt={authorName}
                width={32}
                height={32}
              />
              <span className="font-semibold text-md">{authorName}</span>
            </div>
          </div>

          <div className="flex flex-col w-full">
            <Label className="mb-1 block">Reason</Label>
            <div className="w-full">
              <p className="text-base text-muted-foreground whitespace-pre-wrap break-words">
                {reason}
              </p>
            </div>
          </div>

          <div>
            <Label className="mb-1 block">Action</Label>
            <p className="text-base text-muted-foreground break-words">
              {action}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
