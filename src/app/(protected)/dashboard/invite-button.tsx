"use client";

import useProject from "@/hooks/use-project";
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Copy } from "lucide-react";
import { Button } from "@/components/ui/button";

const InviteButton = () => {
  const { projectId } = useProject();
  const [open, setOpen] = React.useState(false);
  const [inviteLink, setInviteLink] = React.useState("");

  // Update the invite link only when running in the browser
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      setInviteLink(window.location.origin + `/join/${projectId}`);
    }
  }, [projectId]);

  const handleCopy = () => {
    if (typeof navigator !== "undefined") {
      navigator.clipboard.writeText(inviteLink);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite Team Members</DialogTitle>
            <DialogDescription>
              Invite your team members to collaborate on this project by copying
              the invite link below.
            </DialogDescription>
            <div className="relative mt-4">
              <Input
                className="w-full cursor-pointer pr-10" // Add padding to the right for the icon
                readOnly
                onClick={handleCopy}
                value={inviteLink}
              />
              <button
                className="absolute right-0 top-1/2 -translate-y-1/2 transform rounded bg-gray-200/70 p-2 hover:bg-gray-200"
                onClick={handleCopy}
                aria-label="Copy invite link"
              >
                <Copy className="h-5 w-5 text-gray-600" />
              </button>
            </div>
          </DialogHeader>
        </DialogContent>
      </Dialog>
      <Button variant="default" onClick={() => setOpen(true)}>
        Invite Members
      </Button>
    </>
  );
};

export default InviteButton;
