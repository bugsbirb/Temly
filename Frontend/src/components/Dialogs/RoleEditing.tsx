import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel
} from "@/components/ui/form";
import { ObjectId } from "bson";

import {
  Dialog,
  DialogContent, DialogTitle
} from "@/components/ui/dialog";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";

const Permissions = [
  {
    name: "ShiftManage",
    display: "Shift Manage",
    value: 1 << 0,
    description: "Ability to manage your shift.",
  },
  {
    name: "ShiftAdmin",
    display: "Shift Admin",
    value: 1 << 1,
    description: "Admin privileges for shift management.",
  },
  {
    name: "Moderation",
    display: "Moderation",
    value: 1 << 2,
    description: "Access moderation tools and features.",
  },
  {
    name: "EditModeration",
    display: "Edit Moderation",
    value: 1 << 3,
    description: "Edit moderations.",
  },
  {
    name: "EditOwnModeration",
    display: "Edit Own Moderation",
    value: 1 << 4,
    description: "Edit your own moderation.",
  },
  {
    name: "ERLCManage",
    display: "ERLC Manage",
    value: 1 << 7,
    description: "Manage ERLC users & actions & view ERLC Information.",
  },
    {
    name: "ERLCView",
    display: "ERLC View",
    value: 1 << 8,
    description: "View ERLC information.",
  },
  {
    name: "Dashboard",
    display: "Dashboard",
    value: 1 << 5,
    description: "Access dashboard and analytics.",
  },
  {
    name: "Administrator",
    display: "Administrator",
    value: 1 << 6,
    description: "Full administrative access.",
  },
];

export default function RoleDialog({
  open,
  onOpenChange,
  form,
  role,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: any;
  role: any;
}) {
  const [currentRoleId, setCurrentRoleId] = useState<ObjectId | null>(null);
  useEffect(() => {
    if (open && !role && currentRoleId === null) {
      const Id = new ObjectId();

      const newRole = { id: Id, name: "", permissions: 0 };
      const roles = form.getValues("roles") || [];
      const updatedRoles = roles.map((r: any) => ({
        ...r,
        position: (r.position ?? 0) + 1,
      }));
      updatedRoles.push(newRole);
      form.setValue("roles", updatedRoles);
      setCurrentRoleId(Id);
    }
  }, [open, role, currentRoleId, form]);

  const roles = form.getValues("roles") || [];
  const roleIndex = role
    ? roles.findIndex((r: any) => r.id === role.id)
    : roles.findIndex((r: any) => r.id === currentRoleId);

  if (roleIndex === -1) return null;
  if (open == false) {
    return null;
  }
  return (
    <Form {...form}>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <div className="space-y-4">
            <DialogTitle>{role ? "Edit Role" : "Create Role"}</DialogTitle>

            <FormField
              control={form.control}
              name={`roles.${roleIndex}.name`}
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input {...field} placeholder="Role Name" />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name={`roles.${roleIndex}.permissions`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Permissions</FormLabel>
                  <div className="grid grid-cols-2 gap-2 max-h-64 lg:max-h-full overflow-auto">
                    {Permissions.map((p) => {
                      const isChecked = (field.value & p.value) === p.value;
                      return (
                        <Card
                          key={p.value}
                          onClick={() => {
                            let newValue = field.value;
                            if (isChecked) newValue &= ~p.value;
                            else newValue |= p.value;
                            field.onChange(newValue);
                          }}
                          className={`cursor-pointer border-2 ${
                            isChecked ? "border-blue-600" : ""
                          }`}
                        >
                          <CardHeader>
                            <CardTitle>{p.display}</CardTitle>
                            <CardDescription>{p.description}</CardDescription>
                          </CardHeader>
                        </Card>
                      );
                    })}
                  </div>
                </FormItem>
              )}
            />
          </div>
          <Button
            variant="blue"
            type="submit"
            onClick={form.handleSubmit(() => {
              onOpenChange(false);
              setCurrentRoleId(null);
            })}
          >
            Save
          </Button>
        </DialogContent>
      </Dialog>
    </Form>
  );
}
