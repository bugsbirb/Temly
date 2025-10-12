"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useIsMobile } from "@/hooks/use-mobile";
import { createServer, RequestServer } from "@/services/server";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Label } from "../ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { useErlcComplete } from "@/hooks/use-erlc-complete";
import Image from "next/image";

export default function CreateServer({
  open,
  onOpenChange,
  servers,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  servers: any[];
}) {
  const isMobile = useIsMobile();

  const form = useForm<CreateServerDTO>({
    defaultValues: {
      name: "",
      apiKey: "",
      discordServer: "",
    },
  });

  const key = form.watch("apiKey");
  const name = form.watch("name");
  const [erlcserver] = useErlcComplete(key);

  const JoinServer = useForm<ServerCodeDTO>({
    defaultValues: {
      serverCode: "",
    },
  });

  async function onSubmit(values: CreateServerDTO) {
    const data = await createServer(values);
    toast.success("Server Created");
    window.location.href = `/dashboard/${data.Id}`;
    onOpenChange(false);
  }

  async function onJoin(values: ServerCodeDTO) {
    try {
      const response = await RequestServer(values);
      if (response) {
        toast.success("Requested Access");
        onOpenChange(false);
      } else {
        if (response == "You are already in the server.") {
          toast.error("You are already in that server.");
          return;
        }
        if (response == "You already have a pending request for this server.")
          return;
        toast.error("You already have a pending request for this server.");
      }
    } catch {
      toast.error("An error occurred while requesting access");
    }
  }

  return (
    <Form {...form}>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogTitle />
        <DialogContent
          className={`max-w-full sm:max-w-[800px] ${isMobile ? "px-8" : ""}`}
        >
          <Tabs defaultValue="createServer" className="w-full">
            <TabsList className="w-full my-4">
              <TabsTrigger value="createServer">Create Server</TabsTrigger>
              <TabsTrigger value="joinServer">Join Server</TabsTrigger>
            </TabsList>

            <TabsContent value="createServer">
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <DialogTitle className="text-lg font-semibold mb-2" />
                <div
                  className={`flex ${
                    isMobile ? "flex-col" : "flex-row"
                  } gap-4 w-full`}
                >
                  {!isMobile && (
                    <Card className="flex w-64 h-auto bg-radial-[at_50%_50%] from-blue-800 to-blue-600" />
                  )}
                  <div className="flex-1 flex flex-col gap-4">
                    <FormField
                      control={form.control}
                      name="name"
                      rules={{
                        required: "Server Name is required",
                        minLength: {
                          value: 3,
                          message: "Server Name must be at least 3 characters",
                        },
                        maxLength: {
                          value: 20,
                          message: "Server Name must be at most 20 characters",
                        },
                      }}
                      render={({ field }) => (
                        <FormItem className="w-full">
                          <FormLabel>
                            Server Name
                            <span className="text-red-700">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Server Name"
                              {...field}
                              className="w-full"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
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
                              disabled={!servers || servers.length === 0}
                            >
                              <SelectTrigger className="w-full">
                                {field.value
                                  ? servers?.find(
                                      (s: any) => s.id === field.value
                                    )?.name || field.value
                                  : "Discord Servers"}
                              </SelectTrigger>
                              <SelectContent>
                                <SelectGroup>
                                  {servers && servers.length > 0 ? (
                                    servers.map(
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
                                      No servers available
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
                    <Card>
                      <CardContent>
                        {erlcserver ? (
                          <Card>
                            <CardContent>
                              <div className="flex flex-row gap-2">
                                <Image
                                  className="rounded-full"
                                  src={"/unknown.webp"}
                                  width={52}
                                  height={52}
                                  alt="/unknown.webp"
                                />
                                <div className="flex flex-col">
                                  <span className="font-bold text-xl">
                                    {erlcserver?.name}
                                  </span>
                                  <span className="font-light text-sm">
                                    {erlcserver?.currentPlayers}/
                                    {erlcserver?.maxPlayers}
                                  </span>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ) : (

                          <Card className="">
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
                        <FormField
                          control={form.control}
                          name="apiKey"
                          render={({ field }) => (
                            <FormItem className="pt-4">
                              <FormLabel>Key</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="API Key"
                                  type="password"
                                  {...field}
                                  onChange={(e) => {
                                    field.onChange(e);
                                  }}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </CardContent>
                    </Card>
                    <Button
                      className="w-full"
                      variant={"blue"}
                      type="submit"
                      disabled={!name}
                    >
                      Create
                    </Button>
                  </div>
                </div>
              </form>
            </TabsContent>

            <TabsContent value="joinServer">
              <Form {...JoinServer}>
                <form onSubmit={JoinServer.handleSubmit(onJoin)}>
                  <div className="flex flex-col">
                    <Label className="mb-2">Server Code</Label>
                    <FormField
                      control={JoinServer.control}
                      name="serverCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input placeholder="Server Code" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <span className="text-light text-xs text-neutral-300 mt-2">
                      Enter an invite link or code from a friend
                    </span>
                    <Button className="my-4 w-full" variant={"blue"}>
                      Request Join
                    </Button>
                  </div>
                </form>
              </Form>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </Form>
  );
}
