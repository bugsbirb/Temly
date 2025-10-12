import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
  FormLabel
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useEffect } from "react";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Input } from "../ui/input";
import { MultiSelect } from "../ui/multi-select";

export default function PunishmentsDialog({
  open,
  onOpenChange,
  form,
  type,
  setType,
  server,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: any;
  type: any;
  setType: (Type: any) => void;
  server: any;
}) {
  console.log(type);
  useEffect(() => {
    if (open && !type) {
      const newR = {
        name: "",
        allowedRoles: [],
        discord: {
          channel: "",
        },
      };
      const types = form.getValues("Types");
      types.push(newR);
      setType(newR);
    }
  }, [open, type, form, setType]);
  if (open == false) {
    return null;
  }
  const types = form.getValues("Types");
  const typeIndex = types.findIndex((t: any) => t === type);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogTitle>Moderation Type</DialogTitle>
        <FormField
          control={form.control}
          name={`Types.${typeIndex}.name`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Type Name" />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name={`Types.${typeIndex}.allowedRoles`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Allowed Roles</FormLabel>
              <FormControl>
                <MultiSelect
                  placeholder="Select roles"
                  options={server?.roles.map((role: any) => ({
                    label: role.name,
                    value: role.id,
                  }))}
                  value={field.value || []}
                  onValueChange={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Card>
          {server?.config?.discord?.serverId ? (
            <>
              <CardHeader>
                <CardTitle>Discord Integration</CardTitle>
                <CardDescription>
                  Configure Discord channel, shift role, break role, and
                  nickname prefix for this shift type.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4 max-h-32 overflow-auto lg:max-h-full">
                <FormField
                  control={form.control}
                  name={`Types.${typeIndex}.discord.channel`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Channel</FormLabel>
                      <FormControl>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                          disabled={
                            !server?.guild?.channels ||
                            server.guild.channels.length === 0
                          }
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select channel" />
                          </SelectTrigger>
                          <SelectContent>
                            {server?.guild?.channels?.map((channel: any) => (
                              <SelectItem
                                key={channel.channelId ?? channel.id}
                                value={channel.channelId ?? channel.id}
                              >
                                {channel.channelName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </>
          ) : (
            <>
              <CardHeader>
                <CardTitle>No Discord Integration</CardTitle>
                <CardDescription>
                  Discord integration is not enabled for this server.
                </CardDescription>
              </CardHeader>
            </>
          )}
        </Card>
        <Button
          onClick={() => {
            onOpenChange(false);
          }}
        >
          Save
        </Button>
      </DialogContent>
    </Dialog>
  );
}
