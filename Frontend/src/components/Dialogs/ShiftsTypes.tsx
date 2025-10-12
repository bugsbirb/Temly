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

export default function ShiftDialog({
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
          shiftRole: "",
          breakRole: "",
          channel: "",
          prefixNickname: "",
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
        <DialogTitle>Shift Type</DialogTitle>
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

              <CardContent className="space-y-4 max-h-32 lg:max-h-full overflow-auto">
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
                <FormField
                  control={form.control}
                  name={`Types.${typeIndex}.discord.prefixNickname`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prefix Nickname</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Name" />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`Types.${typeIndex}.discord.shiftRole`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Shift Role</FormLabel>
                      <FormControl>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                          disabled={
                            !server?.guild?.roles ||
                            server.guild.roles.length === 0
                          }
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                          <SelectContent>
                            {server?.guild?.roles?.map((role: any) => (
                              <SelectItem
                                key={role.roleId ?? role.id}
                                value={role.roleId ?? role.id}
                              >
                                {role.roleName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`Types.${typeIndex}.discord.breakRole`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Break Role</FormLabel>
                      <FormControl>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                          disabled={
                            !server?.guild?.roles ||
                            server.guild.roles.length === 0
                          }
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                          <SelectContent>
                            {server?.guild?.roles?.map((role: any) => (
                              <SelectItem
                                key={role.roleId ?? role.id}
                                value={role.roleId ?? role.id}
                              >
                                {role.roleName}
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
