import { useForm, FormProvider } from "react-hook-form";
import { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FormControl, FormField } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Select,
  SelectItem,
  SelectContent,
  SelectTrigger,
} from "@/components/ui/select";
import { SelectValue } from "@radix-ui/react-select";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { EditModeration } from "@/services/moderations";

export default function EditModerationDialog({
  open,
  onOpenChange,
  selectedModeration,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedModeration: any | null;
}) {
  const form = useForm<ModerationDTO>({
    defaultValues: {
      Username: "",
      Reason: "",
      Action: "",
    },
  });

  useEffect(() => {
    // if (selectedModeration) {
    form.reset({
      Username: selectedModeration.username ?? "",
      Reason: selectedModeration.reason ?? "",
      Action: selectedModeration.action ?? "",
    });
    // }
  }, [selectedModeration, form]);

  const onSubmit = async (data: ModerationDTO) => {
    console.log(selectedModeration);
    // if (!selectedModeration) return;
    try {
      await EditModeration(selectedModeration.serverId, selectedModeration.id, {
        Username: data.Username,
        Reason: data.Reason,
        Action: data.Action,
      });
      toast.success("Moderation updated successfully.");
      onOpenChange(false);
    } catch {
      toast.error("Failed to update moderation.");
    }
  };

  // if (!selectedModeration) return null;

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Dialog open={open} onOpenChange={onOpenChange}>
          <DialogContent>
            <DialogHeader>
              <div className="flex flex-col items-center justify-center w-full">
                <Image
                  src={selectedModeration.avatarUrl ?? "/default-avatar.png"}
                  className="rounded-full"
                  alt="User Avatar"
                  width={40}
                  height={40}
                />
                <DialogTitle className="my-2">
                  {selectedModeration.username ?? "Unknown User"}
                </DialogTitle>
              </div>
              <hr />
            </DialogHeader>

            <Label>Action</Label>
            <FormField
              control={form.control}
              name="Action"
              render={({ field }) => (
                <FormControl>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Action" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Warning">Warning</SelectItem>
                      <SelectItem value="Kick">Kick</SelectItem>
                      <SelectItem value="Ban">Ban</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
              )}
            />

            <Label>Reason</Label>
            <FormField
              control={form.control}
              name="Reason"
              render={({ field }) => (
                <FormControl>
                  <Input
                    value={field.value ?? ""}
                    onChange={field.onChange}
                    placeholder="Enter reason..."
                  />
                </FormControl>
              )}
            />

            <Button
              className="mt-2"
              variant="blue"
              disabled={!selectedModeration}
              onClick={form.handleSubmit(onSubmit)}
            >
              Save
            </Button>
          </DialogContent>
        </Dialog>
      </form>
    </FormProvider>
  );
}
