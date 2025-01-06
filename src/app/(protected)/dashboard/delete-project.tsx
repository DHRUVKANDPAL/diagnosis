"uce client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import useProject from "@/hooks/use-project";
import useRefetch from "@/hooks/use-refetch";
import { api } from "@/trpc/react";
import { Trash2Icon } from "lucide-react";
import React from "react";
import { toast } from "sonner";

const DeleteProject = () => {
  const { project } = useProject();
  const [open, setOpen] = React.useState(false);
  const refetch = useRefetch();
  const deleteProject = api.project.deleteProject.useMutation();
  return (
    <div className="w-full">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Are you sure you want to delete this project?
            </DialogTitle>
            <DialogDescription>This action cannot be undone.</DialogDescription>
          </DialogHeader>

          <div className="flex w-full flex-col-reverse items-center justify-center gap-x-2 gap-y-2 md:flex-row md:gap-y-0">
            <Button
              className="w-full"
              variant={"outline"}
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="w-full"
              variant={"destructive"}
              disabled={deleteProject.isPending}
              onClick={() => {
                if (project) {
                  deleteProject.mutate(
                    { projectId: project.id },
                    {
                      onSuccess: () => {
                        setOpen(false);
                        toast.success("Project deleted successfully!!!");
                        refetch();
                      },
                      onError: () => {
                        toast.error("Failed to delete project");
                      },
                    },
                  );
                }
              }}
            >
              <Trash2Icon className="mr-0.5 h-4 w-4" />
              Delete
            </Button>
          </div>

          {deleteProject.isError && deleteProject.error.message && (
            <div className="w-full whitespace-pre-wrap break-all">
              <p className="w-full text-sm text-red-600">
                {deleteProject.error.message}
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
      <Button
      className="w-full"
        variant="destructive"
        disabled={!project || deleteProject.isPending}
        onClick={() => setOpen(true)}
      >
        Delete Project
      </Button>
    </div>
  );
};

export default DeleteProject;
