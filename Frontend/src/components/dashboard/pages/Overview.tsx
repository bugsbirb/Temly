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
type FormValues = {
  serverName: string;
  defaultRoles: string[];
};

export default function Overview({
  server,
  servers,
  session,
}: {
  server: any;
  servers: any;
  session: User;
}) {
  const defaultValues = {
    serverName: server?.name || "",
    defaultRoles: server?.config?.defaultRoles ?? [],
  };

  const form = useForm<FormValues>({
    defaultValues,
  });

  useEffect(() => {
    form.reset(defaultValues);
  }, [server]);

  const onSubmit = async (values: FormValues) => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BackendURL}/Servers/${server.id}/config/overview`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
        credentials: "include",
      }
    );
    const text = await response.text();
    if (!response.ok) {
      toast.error(text);
      return;
    }
    toast.success("Config successfully updated.");
    server.name = values.serverName;

    form.reset(values);
  };

  const handleDiscard = () => {
    form.reset(defaultValues);
  };

  return (
    <div>
      <Sidebar data={server} servers={servers} session={session}>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <Card className=" bg-zinc-800/40">
              <CardHeader>
                <CardTitle className="text-2xl">Overview</CardTitle>
                <CardDescription className="text-md">
                  Configure your preferences and settings.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Server Name</CardTitle>
                    <CardDescription>general stuff</CardDescription>
                  </CardHeader>
                  <hr />

                  <CardContent>
                    <FormField
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
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Default Roles</CardTitle>
                    <CardDescription>general stuff</CardDescription>
                  </CardHeader>
                  <hr />

                  <CardContent>
                    <FormField
                      control={form.control}
                      name="defaultRoles"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Roles</FormLabel>
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
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Server Code</CardTitle>
                    <CardDescription>general stuff</CardDescription>
                  </CardHeader>
                  <hr />

                  <CardContent className="flex flex-col gap-4">
                    <div className="border border-dashed rounded-lg px-6 py-4 text-lg font-mono bg-muted flex justify-between items-center">
                      <span className="text-4xl font-mono font-bold text-foreground tracking-wider">
                        {server?.serverCode}
                      </span>
                    </div>
                    <div className="flex gap-3">
                      <Button variant="outline">Copy</Button>
                      <Button variant="success">Regenerate</Button>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Data Management</CardTitle>
                    <CardDescription>
                      Transfer & Export your servers data, into other services
                      or servers.
                    </CardDescription>
                  </CardHeader>
                  <hr />
                  <CardContent className="grid lg:grid-cols-3 w-full gap-2">
                    <Card>
                      <CardHeader>
                        <CardTitle>Export Data</CardTitle>
                        <CardDescription>
                          Export the servers data, including shifts,
                          moderations, leaves and more.
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Button>Export</Button>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle>Import Data</CardTitle>
                        <CardDescription>
                          Import the servers data, including shifts,
                          moderations, leaves and more.
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Button variant={"outline"}>Import</Button>
                      </CardContent>
                    </Card>
                  </CardContent>
                </Card>

                {server.OwnerId == session.nameidentifier}
                <Card className="border-red-400/80">
                  <CardHeader>
                    <CardTitle>Dangerous Actions</CardTitle>
                    <CardDescription>general stuff</CardDescription>
                  </CardHeader>
                  <CardContent className="grid lg:grid-cols-3 w-full gap-2">
                    <Card className="border-red-400/60">
                      <CardHeader>
                        <CardTitle>Delete Server</CardTitle>
                        <CardDescription>
                          This action is{" "}
                          <span className="font-bold">IRREVERSIBLE</span> and
                          can not be undone.
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Button variant={"destructive"}>Delete</Button>
                      </CardContent>
                    </Card>
                    <Card className="border-red-400/60">
                      <CardHeader>
                        <CardTitle>Delete Configuration</CardTitle>
                        <CardDescription>
                          This action is{" "}
                          <span className="font-bold">IRREVERSIBLE</span> and
                          can not be undone.
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Button variant={"destructive"}>Delete</Button>
                      </CardContent>
                    </Card>
                    <Card className="border-red-400/60">
                      <CardHeader>
                        <CardTitle>Delete Shifts</CardTitle>
                        <CardDescription>
                          This action is{" "}
                          <span className="font-bold">IRREVERSIBLE</span> and
                          can not be undone.
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Button variant={"destructive"}>Delete</Button>
                      </CardContent>
                    </Card>
                    <Card className="border-red-400/60">
                      <CardHeader>
                        <CardTitle>Delete Moderations</CardTitle>
                        <CardDescription>
                          This action is{" "}
                          <span className="font-bold">IRREVERSIBLE</span> and
                          can not be undone.
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Button variant={"destructive"}>Delete</Button>
                      </CardContent>
                    </Card>
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
