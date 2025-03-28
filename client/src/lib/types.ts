import { Show, Call, Group } from "@shared/schema";

export interface ShowWithDetails extends Show {
  timeRemaining?: string;
  formattedDate?: string;
  formattedTime?: string;
}

export interface CallWithDetails extends Call {
  number?: number;
  groupName?: string;
  timerString?: string;
}

export interface GroupWithDetails extends Group {
  icon?: string;
}

export type ShowCardProps = {
  show: ShowWithDetails;
  calls: CallWithDetails[];
  groups: GroupWithDetails[];
  expanded: boolean;
  onToggleExpand: (id: number) => void;
  onAddCall: (showId: number) => void;
};

export type CallItemProps = {
  call: CallWithDetails;
  number: number;
};

export type TabOption = "home" | "shows" | "groups" | "profile";
