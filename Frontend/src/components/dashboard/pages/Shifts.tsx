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
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
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
import { Edit, Plus, Trash2 } from "lucide-react";
import ShiftDialog from "@/components/Dialogs/ShiftsTypes";
type FormValues = {
  Discord: {
    Channel: string;
  };
  Types: any[];
};

export default function Shifts({
  server,
  servers,
  session,
}: {
  server: any;
  servers: any;
  session: User;
}) {
  const [Type, SetType] = useState(null);
  const [open, SetOpen] = useState(false);

  const defaultValues = {
    Types: server?.config?.shifts?.types ?? [],
  };

  const form = useForm<FormValues>({
    defaultValues,
  });

  useEffect(() => {
    form.reset(defaultValues);
  }, [server]);
  const types = form.watch("Types") || [];

  const onSubmit = async (values: FormValues) => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BackendURL}/Servers/${server.id}/config/shifts`,
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
    form.reset(values);
  };

  const handleDiscard = () => {
    form.reset(defaultValues);
  };

  return (
    <div>
      <Sidebar data={server} servers={servers} session={session}>
        <Form {...form}>
          <ShiftDialog
            onOpenChange={SetOpen}
            open={open}
            form={form}
            type={Type}
            setType={SetType}
            server={server}
          />
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <Card className="bg-zinc-800/40">
              <CardHeader>
                <CardTitle className="text-2xl">Shifts</CardTitle>
                <CardDescription className="text-md">
                  Configure the shifts module
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Card className="">
                  <CardHeader>
                    <CardTitle>Shift Types</CardTitle>
                    <CardDescription>
                      Add, edit, or remove the types of shifts. These types will
                      be used to categorize and manage shifts more effectively.
                    </CardDescription>
                  </CardHeader>
                  <hr />
                  <CardContent>
                    <Button
                      variant="outline"
                      className="mb-3"
                      type="button"
                      onClick={() => {
                        SetOpen(true);
                        SetType(null);
                      }}
                    >
                      <span className="flex flex-row gap-2 text-center">
                        <Plus />
                        Create Type
                      </span>
                    </Button>
                    <span className="text-sm ml-3 font-light text-neutral-300">
                      {types.length ?? 0}/20 types
                    </span>
                    <div className="flex flex-col gap-2">
                      {types?.map((type: any, idx: number) => (
                        <Item key={idx} variant={"outline"} className="bg-card">
                          <ItemContent>
                            <div
                              key={idx}
                              className="flex items-center  w-full"
                            >
                              <ItemTitle>{type.name}</ItemTitle>
                            </div>
                          </ItemContent>
                          <ItemActions>
                            <Button
                              variant="outline"
                              size="icon"
                              type="button"
                              onClick={() => {
                                SetType(type);
                                SetOpen(true);
                              }}
                            >
                              <Edit />
                            </Button>
                            <Button
                              variant="destructive"
                              size="icon"
                              type="button"
                              onClick={() => {
                                form.setValue(
                                  "Types",
                                  types.filter(
                                    (_: any, i: number) => i !== idx
                                  ),
                                  { shouldDirty: true }
                                );
                              }}
                            >
                              <Trash2 />
                            </Button>
                          </ItemActions>
                        </Item>
                      ))}
                    </div>
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
