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
import { Skeleton } from "@/components/ui/skeleton";
import { useErlcComplete } from "@/hooks/use-erlc-complete";
import { useState } from "react";
import Image from "next/image";

export default function ErlcLink({
  open,
  onOpenChange,
  server,
  form,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  server: any;
  form: any;
}) {
  const [key, setKey] = useState<string>("");
  const [erlcserver] = useErlcComplete(key);
  return (
    <Form {...form}>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogTitle>Link Server</DialogTitle>
          {erlcserver ? (
            <Card>
              <CardContent>
                <div className="flex flex-row gap-2">
                  <Image
                    className="rounded-full"
                    src={server?.guild?.serverIcon || "/unknown.webp"}
                    width={52}
                    height={52}
                    alt="/unknown.webp"
                  />
                  <div className="flex flex-col">
                    <span className="font-bold text-xl">
                      {erlcserver?.name}
                    </span>
                    <span className="font-light text-sm">
                      {erlcserver?.currentPlayers}/{erlcserver?.maxPlayers}
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
          <FormField
            control={form.control}
            name="erlcKey"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Key</FormLabel>
                <FormControl>
                  <Input
                    placeholder="API Key"
                    type="password"
                    {...field}
                    onChange={(e) => {
                      field.onChange(e);
                      setKey(e.target.value);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button onClick={() => {onOpenChange(false)}} disabled={!erlcserver}>Apply</Button>
        </DialogContent>
      </Dialog>
    </Form>
  );
}
