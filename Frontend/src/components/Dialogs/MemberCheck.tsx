import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@/components/ui/table";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Spinner } from "../ui/spinner";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Frown, Smile } from "lucide-react";
import { DialogDescription } from "@radix-ui/react-dialog";

export default function MemberCheck({
  open,
  onOpenChange,
  server,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  server: any;
}) {
  const [inServer, SetInServer] = useState<any>();
  const [NinServer, setNInServer] = useState<any>();
  const [loading, setLoading] = useState<boolean>(true);
  useEffect(() => {
    const MemberCheck = async () => {
      const memberCheck = await fetch(
        `${process.env.NEXT_PUBLIC_BackendURL}/Erlc/server/${server.id}/membercheck`,
        { credentials: "include" }
      );

      if (!memberCheck.ok) {
        const text = await memberCheck.text();
        toast.error(text);
        onOpenChange(false);
        return [];
      }
      const response = await memberCheck.json();
      return response;
    };
    MemberCheck().then((response) => {
      setLoading(false);
      if (Array.isArray(response)) {
        const inServer = response.filter(
          (member: any) => member.inServer === true
        );
        const notInServer = response.filter(
          (member: any) => member.inServer === false
        );
        SetInServer(inServer);
        setNInServer(notInServer);
      } else {
        SetInServer([]);
        setNInServer([]);
      }
    });
  }, [open, server]);

  return (
    <div>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle />
          </DialogHeader>
          {loading && (
            <div className="flex justify-center items-center">
              <Spinner />
            </div>
          )}
          {!loading && (
            <>
              <Card className="bg-zinc-800/50 ">
                <CardHeader>
                  <CardTitle>Not In Discord</CardTitle>
                </CardHeader>
                <hr />
                <CardContent>
                  <Card className="p-0 ">
                    <div
                      className="overflow-auto"
                      style={{ maxHeight: "210px" }}
                    >
                      <Table>
                        <thead>
                          <TableRow>
                            <TableHead>User</TableHead>
                          </TableRow>
                        </thead>
                        <tbody>
                          {NinServer && NinServer.length > 0 ? (
                            NinServer.map((member: any, idx: number) => (
                              <TableRow key={idx}>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <img
                                      src={member.avatar}
                                      alt={member.player}
                                      className="w-8 h-8 rounded-full"
                                    />
                                    <span>{member.player.split(":")[0]}</span>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell>
                                <div className="text-neutral-400 flex justify-center items-center py-4">
                                  <div className="flex flex-col items-center text-center gap-3">
                                    <Smile width={48} height={48} />
                                    No users found.
                                  </div>
                                </div>
                              </TableCell>
                            </TableRow>
                          )}
                        </tbody>
                      </Table>
                    </div>
                  </Card>
                </CardContent>
              </Card>
              <Card className="bg-zinc-800/50 ">
                <CardHeader>
                  <CardTitle>In Discord</CardTitle>
                </CardHeader>
                <hr />
                <CardContent>
                  <Card className="p-0 ">
                    <div
                      className="overflow-auto"
                      style={{ maxHeight: "210px" }}
                    >
                      <Table>
                        <thead>
                          <TableRow>
                            <TableHead>User</TableHead>
                          </TableRow>
                        </thead>
                        <tbody>
                          {NinServer && NinServer.length > 0 ? (
                            NinServer.map((member: any, idx: number) => (
                              <TableRow key={idx}>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <img
                                      src={member.avatar}
                                      alt={member.player}
                                      className="w-8 h-8 rounded-full"
                                    />
                                    <span>{member.player.split(":")[0]}</span>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell>
                                <div className="text-neutral-400 flex justify-center items-center py-4">
                                  <div className="flex flex-col items-center text-center gap-3">
                                    <Frown width={48} height={48} />
                                    No users found.
                                  </div>
                                </div>
                              </TableCell>
                            </TableRow>
                          )}
                        </tbody>
                      </Table>
                    </div>
                  </Card>
                </CardContent>
              </Card>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
