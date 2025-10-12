"use client";

import Sidebar from "@/components/dashboard/sidebar";
import { useForm } from "react-hook-form";
import { useEffect } from "react";
import {
  Card,
  CardTitle,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MultiSelect } from "@/components/ui/multi-select";
import SaveBar from "@/components/dashboard/savebar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { User } from "@/models/user";
import { toast } from "sonner";
import {
  Select,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectContent,
} from "@/components/ui/select";
type FormValues = {
  discordServer: string;
};

export default function Discord({
  server,
  servers,
  session,
  discordServers,
}: {
  server: any;
  servers: any;
  discordServers: any;
  session: User;
}) {

  
  const defaultValues = {
    discordServer:
      discordServers?.find((s: any) => s.id === server.config.discord.serverId)
        ?.id || "",
  };

  const form = useForm<FormValues>({
    defaultValues,
  });

  useEffect(() => {
    form.reset(defaultValues);
  }, [server]);

  const onSubmit = async (values: FormValues) => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BackendURL}/Servers/${server.id}/discord/${values.discordServer}/link`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      }
    );
    const text = await response.text();
    if (!response.ok) {
      toast.error(text);
      return;
    }
    toast.success("Server successfully updated.");

    form.reset(values);
  };

  const handleDiscard = () => {
    form.reset(defaultValues);
  };

  return (
    <div>
      <Sidebar data={server} servers={servers} session={session}>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <Card className=" bg-zinc-800/40">
              <CardHeader>
                <CardTitle className="text-2xl">Discord</CardTitle>
                <CardDescription className="text-md">
                  Link your discord
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Discord Server</CardTitle>
                    <CardDescription>general stuff</CardDescription>
                  </CardHeader>
                  <hr />

                  <CardContent>
                    <FormField
                      control={form.control}
                      name="discordServer"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Discord Server</FormLabel>
                          <FormControl>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                              disabled={
                                !discordServers || discordServers.length === 0
                              }
                            >
                              <SelectTrigger className="w-full">
                                {field.value
                                  ? discordServers?.find(
                                      (s: any) => s.id === field.value
                                    )?.name || field.value
                                  : "Discord Servers"}
                              </SelectTrigger>
                              <SelectContent>
                                <SelectGroup>
                                  {discordServers &&
                                  discordServers.length > 0 ? (
                                    discordServers.map(
                                      (server: any, index: number) => (
                                        <SelectItem
                                          key={server.id || index}
                                          value={server.id}
                                        >
                                          {server.name}
                                        </SelectItem>
                                      )
                                    )
                                  ) : (
                                    <SelectItem value="no-servers" disabled>
                                      You won't see this prolly
                                    </SelectItem>
                                  )}
                                </SelectGroup>
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          </form>
        </Form>
        <SaveBar
          onSave={form.handleSubmit(onSubmit)}
          onDiscard={handleDiscard}
          disabled={!form.formState.isDirty}
          visible={form.formState.isDirty}
        />
      </Sidebar>
    </div>
  );
}
