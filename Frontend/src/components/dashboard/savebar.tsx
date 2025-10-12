import { Button } from "@/components/ui/button";
import clsx from "clsx";
type SaveBarProps = {
  onSave: () => void;
  onDiscard: () => void;
  disabled?: boolean;
  visible?: boolean;
};

export default function SaveBar({
  onSave,
  onDiscard,
  disabled,
  visible = false,
}: SaveBarProps) {
  return (
    <div
      className={clsx(
        "bottom-0 fixed bg-neutral-950 w-full border-t h-16 -ml-[8px] grid grid-cols-2 gap-4 items-center px-4 transition-all duration-300 ease-in-out",
        visible
          ? "translate-y-0 opacity-100"
          : "translate-y-full opacity-0 pointer-events-none"
      )}
    >
      <div className="pr-2 flex gap-2">
        <Button
          onClick={onSave}
          className="justify-center bg-blue-600 text-white hover:bg-blue-500"
          disabled={disabled}
        >
          Save Progress
        </Button>
        <Button
          variant={"outline"}
          onClick={onDiscard}
          className="justify-center text-white hover:bg-red-500"
        >
          Discard Progress
        </Button>
      </div>
    </div>
  );
}
