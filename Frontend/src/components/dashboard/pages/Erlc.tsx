"use client";

import Sidebar from "@/components/dashboard/sidebar";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
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
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import ErlcLink from "@/components/Dialogs/ErlcLink";
type FormValues = {
  erlcKey: string;
};

export default function ERLC({
  server,
  servers,
  session,
  erlcServer: initialErlcServer,
}: {
  server: any;
  servers: any;
  session: User;
  erlcServer: any;
}) {
  const [open, setOpen] = useState(false);
  const [erlcServer, setErlcServer] = useState(initialErlcServer);
  const defaultValues = {
    erlcKey: "",
  };

  const form = useForm<FormValues>({
    defaultValues,
  });

  useEffect(() => {
    form.reset(defaultValues);
  }, [server]);

  const onSubmit = async (values: FormValues) => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BackendURL}/Erlc/${server.id}/setkey`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values.erlcKey),
        credentials: "include",
      }
    );
    const json = await response.json();
    if (!response.ok) {
      toast.error(json?.message || "An error occurred.");
      return;
    }

    setErlcServer({ data: json });
    toast.success("Key successfully updated.");
    form.reset(defaultValues);
  };

  const handleDiscard = () => {
    form.reset(defaultValues);
  };

  return (
    <div>
      <Sidebar data={server} servers={servers} session={session}>
        <Form {...form}>
          <ErlcLink
            onOpenChange={setOpen}
            open={open}
            server={server}
            form={form}
          />
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <Card className=" bg-zinc-800/40">
              <CardHeader>
                <CardTitle className="text-2xl">ERLC Integration</CardTitle>
                <CardDescription className="text-md">
                  Configure your preferences and settings.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>ERLC Link</CardTitle>
                    <CardDescription>general stuff</CardDescription>
                  </CardHeader>
                  <hr />

                  <CardContent>
                    <div className="flex flex-col gap-4">
                      {erlcServer?.data ? (
                        <Card>
                          <CardContent>
                            <div className="flex flex-row gap-2">
                              <Image
                                className="rounded-full"
                                src={server.guild.serverIcon}
                                width={52}
                                height={52}
                                alt="/unknown.webp"
                              />
                              <div className="flex flex-col">
                                <span className="font-bold text-xl">
                                  {erlcServer?.data?.name}
                                </span>
                                <span className="font-light text-sm">
                                  {erlcServer?.data?.currentPlayers}/
                                  {erlcServer?.data?.maxPlayers}
                                </span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ) : (
                        <Card>
                          <CardContent>
                            <div className="flex items-center space-x-4 mb-2">
                              <Skeleton className="h-12 w-12 rounded-full" />
                              <div className="space-y-2">
                                <Skeleton className="h-4 w-[250px]" />
                                <Skeleton className="h-4 w-[200px]" />
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      <div>
                        <Button
                          onClick={() => {
                            setOpen(true);
                          }}
                          type="button"
                        >
                          Link Server
                        </Button>
                      </div>
                    </div>

                    {/* <FormField
                      control={form.control}
                      name="serverName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Server Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Server Name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    /> */}
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
