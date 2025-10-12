"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@/components/ui/table";
import { DeleteModeration, loadMore } from "@/services/moderations";
import { Ellipsis, Loader2 } from "lucide-react";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  Autocomplete,
  AutocompleteCollection,
  AutocompleteControl,
  AutocompleteEmpty,
  AutocompleteInput,
  AutocompleteItem,
  AutocompleteList,
  AutocompletePopup,
  AutocompletePositioner,
  AutocompleteTrigger,
} from "../ui/base-autocomplete";
import { User } from "@/models/user";
import { useLoadScroll } from "@/hooks/use-LoadScroll";
import { useUserAutocomplete } from "@/hooks/use-autocomplete";
import { useModerationSearch } from "@/hooks/use-moderation-search";
import EditModerationDialog from "./Dialogs/EditModeration";
import ExpandModeration from "./Dialogs/Expand";

export default function Content({
  className,
  Moderations,
  setModerations,
  Server,
  session,
  selectedUser,
  setSelectedUser,
}: {
  className?: string;
  Moderations: any;
  setModerations: React.Dispatch<React.SetStateAction<any[]>>;
  Server: any;
  session: User;
  selectedUser: any | null;
  setSelectedUser: React.Dispatch<React.SetStateAction<any | null>>;
}) {
  const [loading, setLoading] = useState(false);
  const [userQuery, setUserQuery] = useState("");
  const [users, setUsers] = useUserAutocomplete(userQuery);

  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore] = useState(false);

  const [open, setOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedModeration, selectModeration] = useState<any>();

  const scrollContainerRef = useRef<HTMLDivElement>(
    null!
  ) as React.RefObject<HTMLDivElement>;

  const { results: searchResults, loading: searching } = useModerationSearch(
    Server.id,
    searchQuery
  );
  useLoadScroll(
    scrollContainerRef,
    () => loadMore(setModerations, setPage, setHasMore, Server, page),
    hasMore,
    loadingMore
  );
  const form = useForm({
    defaultValues: {
      user: "",
      action: "",
      reason: "",
    },
  });

  async function onSubmit(values: any) {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BackendURL}/Moderations/punish`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          serverId: Server.id,
          userId: selectedUser?.contentId ?? 0,
          username: selectedUser?.username ?? values.user,
          reason: values.reason,
          action: values.action,
          by: session.nameidentifier,
        }),
      });
      const text = await response.text()
      if (!response.ok){

        return toast.error(text)

      }
      toast.success("Succesfully moderated.");
      form.reset();
      setUserQuery("");
      setSelectedUser(null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const TableModerations = Array.isArray(
    searchQuery ? searchResults.data : Moderations
  )
    ? searchQuery
      ? searchResults.data!
      : Moderations
    : [];

  return (
    <div>
      {selectedModeration && (
        <EditModerationDialog
          selectedModeration={selectedModeration}
          open={open}
          onOpenChange={setOpen}
        />
      )}
      <section className={`mt-2 flex flex-col gap-2 ${className ?? ""}`}>
        {selectedModeration && (
          <ExpandModeration
            selectedModeration={selectedModeration}
            setModeration={selectModeration}
            open={sheetOpen}
            onOpenChange={setSheetOpen}
          />
        )}
        <Card className="bg-zinc-800/50">
          <CardHeader>
            <CardTitle>Moderation</CardTitle>
            <CardDescription>Create a new moderation log.</CardDescription>
          </CardHeader>
          <hr />
          <CardContent className="px-6">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <FormField
                  control={form.control}
                  name="user"
                  rules={{ required: "User is required" }}
                  render={({ field }) => (
                    <FormItem className="mb-4">
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Autocomplete
                          items={Array.isArray(users) ? users : []}
                          itemToStringValue={(item: any) => item.username}
                        >
                          <AutocompleteControl>
                            <AutocompleteInput
                              value={userQuery}
                              onChange={(e) => {
                                setUserQuery(e.target.value);
                                setSelectedUser(null);
                                setSearchQuery(e.target.value);
                              }}
                              placeholder="Username..."
                              variant="lg"
                            />
                          </AutocompleteControl>
                          <AutocompleteTrigger />
                          <AutocompletePositioner>
                            <AutocompletePopup>
                              <AutocompleteList>
                                <AutocompleteCollection>
                                  {(item: any) => (
                                    <AutocompleteItem
                                      key={item.username}
                                      value={item.username}
                                      onClick={() => {
                                        form.setValue("user", item.username);
                                        setUserQuery(item.username);
                                        setSelectedUser(item);
                                        setUsers([]);
                                        field.onChange(item.username);
                                      }}
                                    >
                                      {item.username} ({item.displayName})
                                    </AutocompleteItem>
                                  )}
                                </AutocompleteCollection>
                                <AutocompleteEmpty>
                                  No users found
                                </AutocompleteEmpty>
                              </AutocompleteList>
                            </AutocompletePopup>
                          </AutocompletePositioner>
                        </Autocomplete>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="action"
                  rules={{ required: "Action is required" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Action</FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <SelectTrigger className="w-full ">
                            <SelectValue placeholder="Action" />
                          </SelectTrigger>
                          <SelectContent>
                            {Server?.config?.punishments?.types.map(
                              (item: any) => (
                                <SelectItem key={item.name} value={item.name}>
                                  {item.name}
                                </SelectItem>
                              )
                            )}
                           
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="reason"
                  rules={{ required: "Reason is required" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reason</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter reason..." />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full mt-2"
                  variant={"blue"}
                  onClick={() => {
                    setSearchQuery("");
                  }}
                  disabled={loading}
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Moderation
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card className="bg-zinc-800/50">
          <CardHeader>
            <CardTitle>Moderation Cases</CardTitle>
            <CardDescription>View existing moderations.</CardDescription>
          </CardHeader>
          <hr />
          <CardContent>
            <div className="flex m-1 w-[50%]  gap-2 ">
              <Input
                placeholder="Search moderations..."
                className="min-w-46"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />{" "}
              <Button
                variant={"blue"}
                onClick={() => {
                  setSearchQuery("");
                }}
              >
                Refresh
              </Button>
            </div>
            <Card className="p-0 mt-2">
              <div
                className="overflow-auto"
                style={{ maxHeight: "210px" }}
                ref={scrollContainerRef}
              >
                <Table>
                  <thead>
                    <TableRow>
                      <TableHead style={{ paddingLeft: "1rem" }}>
                        User
                      </TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead style={{ paddingLeft: "1rem" }}>
                        Staff
                      </TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </thead>
                  <TableBody>
                    {TableModerations.length === 0 && !searching && (
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          className="text-center py-4 text-neutral-400"
                        >
                          No moderation cases found.
                        </TableCell>
                      </TableRow>
                    )}
                    {TableModerations.map((moderation: any) => (
                      <TableRow key={moderation.id ?? Math.random()}>
                        <TableCell className="font-semibold p-4 flex items-center gap-2 mr-4">
                          <img
                            src={moderation?.avatarUrl ?? "/placeholder.png"}
                            width={32}
                            alt={moderation?.username ?? "Unknown"}
                            className="rounded-lg"
                          />
                          <span className="text-lg text-neutral-200">
                            {moderation?.username ?? "N/A"}
                          </span>
                        </TableCell>

                        <TableCell>{moderation?.action ?? "N/A"}</TableCell>

                        <TableCell>
                          {moderation?.reason ? (
                            moderation.reason.length > 20 ? (
                              <>
                                {`${moderation.reason.slice(0, 20)}... `}
                                <Button
                                  variant="ghost"
                                  size="ssm"
                                  className="px-2 py-0 text-xs"
                                  onClick={() => {
                                    setSheetOpen(true);
                                    selectModeration(moderation);
                                  }}
                                  type="button"
                                >
                                  Expand
                                </Button>
                              </>
                            ) : (
                              moderation.reason
                            )
                          ) : (
                            "No reason provided"
                          )}
                        </TableCell>

                        <TableCell className="font-semibold p-4 flex items-center gap-2 mr-4">
                          <img
                            src={
                              moderation?.author?.avatarUrl ?? "/unknown.webp"
                            }
                            width={32}
                            alt={moderation?.author?.username ?? "Unknown"}
                            className="rounded-lg"
                          />
                          <span className="text-lg text-neutral-200">
                            {moderation?.author?.username ?? "N/A"}
                          </span>
                        </TableCell>

                        <TableCell>
                          {moderation?.occured
                            ? new Date(moderation.occured)
                                .toISOString()
                                .slice(0, 10)
                            : "Unknown date"}
                        </TableCell>

                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button className="border-1 bg-white/0 border-neutral-800 hover:bg-neutral-800">
                                <Ellipsis className="text-white" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuGroup>
                                <DropdownMenuItem
                                  onClick={() => {
                                    selectModeration(moderation);
                                    setOpen(true);
                                  }}
                                >
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() =>
                                    DeleteModeration(Server.id, moderation.id)
                                  }
                                >
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuGroup>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                    {loadingMore && (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          className="text-center py-2 text-sm text-neutral-400"
                        >
                          Loading more...
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
