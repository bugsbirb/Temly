"use client";

import { User } from "@/models/user";
import Sidebar from "../sidebar";
import {
  Card,
  CardTitle,
  CardContent,
  CardHeader,
  CardDescription,
} from "@/components/ui/card";
import { Form, FormField, FormItem, FormControl } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { SortableItemHandle } from "@/components/ui/sortable";
import { GripVertical, PenBox, Plus, Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";
import SaveBar from "../savebar";
import { useState } from "react";
import RoleDialog from "@/components/Dialogs/RoleEditing";
import dynamic from "next/dynamic";

const Sortable = dynamic(
  () => import("@/components/ui/sortable").then((m) => m.Sortable),
  { ssr: false }
);
const SortableItem = dynamic(
  () => import("@/components/ui/sortable").then((m) => m.SortableItem),
  { ssr: false }
);
export default function Roles({
  server,
  servers,
  session,
}: {
  server: any;
  servers: any;
  session: User;
}) {
  const [open, setOpen] = useState(false);
  const [CreationState, setState] = useState("");
  const [selectedRole, setSelected] = useState<any | null>(undefined);
  const form = useForm({
    defaultValues: {
      roles: server.roles ?? [],
    },
  });
  const onSubmit = async (data: any) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BackendURL}/Servers/${server.id}/role/edit`,
        {
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data.roles),
        }
      );

      if (!res.ok) throw new Error("Failed to update roles");

      const updatedRoles = await res.json();
      const currentRoles = form.getValues("roles");
      const mergedRoles = currentRoles.map((existingRole: any) => {
        const roleUpdate = updatedRoles.find(
          (r: any) => r.id === existingRole.id
        );
        if (roleUpdate) {
          return {
            ...existingRole,
            ...roleUpdate,
          };
        }
        return existingRole;
      });

      form.reset({ roles: mergedRoles });
    } catch (err) {
      console.error("Internal Server Error, contact support.", err);
    }
  };

  return (
    <div>
      <Sidebar data={server} servers={servers} session={session}>
        <RoleDialog
          open={open}
          onOpenChange={setOpen}
          form={form}
          role={selectedRole}
        />

        <Card className=" bg-zinc-800/40">
          <CardHeader>
            <CardTitle>Roles</CardTitle>
            <CardDescription>Manage roles and permissions</CardDescription>
          </CardHeader>
          <hr />
          <CardContent>
            <Button
              variant="outline"
              className="mb-3"
              type="button"
              onClick={() => {
                setOpen(true);
                setSelected(null);
              }}
            >
              <span className="flex flex-row gap-2 text-center">
                <Plus />
                Create Role
              </span>
            </Button>
            <span className="text-sm ml-3 font-light text-neutral-300">
              10/20 roles
            </span>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="roles"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Sortable
                          value={field.value}
                          getItemValue={(item: any) => item.id}
                          onValueChange={(newOrder: any[]) => {
                            const Roles = newOrder.map((role, index) => ({
                              ...role,
                              position: newOrder.length - index - 1,
                            }));
                            console.log("Roles :)", Roles);
                            field.onChange(Roles);
                          }}
                          className="flex flex-col gap-2"
                        >
                          {field.value.map((role: any) => (
                            <SortableItem key={role.id} value={role.id}>
                              <Card key={role.id} className="transition-all ease-in-out">
                                <CardHeader className="flex flex-row gap-4 items-center">
                                  <SortableItemHandle className="text-muted-foreground hover:text-foreground">
                                    <GripVertical className="h-4 w-4" />
                                  </SortableItemHandle>
                                  <CardTitle>{role.name}</CardTitle>
                                  <span className="flex justify-center ml-auto gap-2">
                                    <Button
                                      type="button"
                                      size="icon"
                                      variant="outline"
                                      onClick={() => {
                                        setOpen(true);
                                        setState("edit");
                                        setSelected(role);
                                      }}
                                    >
                                      <span>
                                        <PenBox />
                                      </span>
                                    </Button>
                                    <Button
                                      type="button"
                                      size="icon"
                                      variant="destructive"
                                      onClick={() => {
                                        const neww = field.value.filter(
                                          (r: any) => r.id !== role.id
                                        );
                                        field.onChange(neww);
                                      }}
                                    >
                                      <Trash2 />
                                    </Button>
                                  </span>
                                </CardHeader>
                              </Card>
                            </SortableItem>
                          ))}
                        </Sortable>
                      </FormControl>
                    </FormItem>
                  )}
                />
              </form>
            </Form>
          </CardContent>
        </Card>

        <SaveBar
          onSave={form.handleSubmit(onSubmit)}
          onDiscard={() => form.reset()}
          disabled={!form.formState.isDirty}
          visible={form.formState.isDirty}
        />
      </Sidebar>
    </div>
  );
}
