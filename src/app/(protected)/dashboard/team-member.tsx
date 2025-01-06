import React from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import useProject from "@/hooks/use-project";
import { api } from "@/trpc/react";

const AvatarGroup = ({
  members,
  limit = 5,
  size = 40,
}: {
  members: any;
  limit?: number;
  size?: number;
}) => {
   
  const displayMembers = members?.slice(0, limit);
  const remaining = members ? Math.max(0, members.length - limit) : 0;

  const getDisplayName = (member: (typeof members)[0]) => {
    if (member.user.firstName && member.user.lastName) {
      return `${member.user.firstName} ${member.user.lastName}`;
    }
    return member.user.emailAddress;
  };

  const getAvatarFallback = (member: (typeof members)[0]) => {
    if (member.user.firstName) {
      return member.user.firstName[0].toUpperCase();
    }
    return member.user.emailAddress[0].toUpperCase();
  };

  return (
    <TooltipProvider>
      <div className="flex items-center">
        {displayMembers?.map((member: any, index: any) => (
          <Tooltip key={index} delayDuration={100}>
            <TooltipTrigger>
              <div
                className="group relative overflow-hidden rounded-full border-2 border-border transition-all duration-300 ease-in-out hover:z-10 hover:scale-110"
                style={{
                  width: size,
                  height: size,
                  marginLeft: index === 0 ? 0 : `-${size / 4}px`,
                  zIndex: displayMembers.length - index,
                }}
              >
                {member.user.imageUrl ? (
                  <img
                    src={member.user.imageUrl}
                    alt={getDisplayName(member)}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-muted font-medium text-muted-foreground">
                    {getAvatarFallback(member)}
                  </div>
                )}
                <div className="absolute inset-0 bg-foreground/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              </div>
            </TooltipTrigger>
            <TooltipContent className="border-l-4 border-gray-400 bg-popover">
              <p className="text-sm font-medium text-popover-foreground">
                {getDisplayName(member)}
              </p>
              <p className="text-sm font-medium text-popover-foreground">
                {member.user.emailAddress}
              </p>
            </TooltipContent>
          </Tooltip>
        ))}

        {remaining > 0 && (
          <Tooltip delayDuration={200}>
            <TooltipTrigger>
              <div
                className="group relative flex items-center justify-center rounded-full border-2 border-border bg-muted text-sm font-medium text-muted-foreground transition-all duration-300 ease-in-out hover:z-10 hover:scale-110"
                style={{
                  width: size,
                  height: size,
                  marginLeft: `-${size / 4}px`,
                  zIndex: 0,
                }}
              >
                +{remaining}
                <div className="absolute inset-0 rounded-full bg-foreground/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              </div>
            </TooltipTrigger>
            <TooltipContent className="border-l-4 border-gray-400 bg-popover">
              <p className="text-sm text-popover-foreground">
                {remaining} more {remaining === 1 ? "member" : "members"}
              </p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  );
};

const TeamMembers = () => {
  const { project } = useProject();
  const { data: members } = api.project.getTeamMembers.useQuery(
    { projectId: project?.id! },
    { enabled: !!project?.id },
  );

  if (!members || members.length === 0) {
    return null;
  }

  return (
    <div className="p-4">
      <AvatarGroup members={members} limit={4} size={40} />
    </div>
  );
};

export default TeamMembers;
