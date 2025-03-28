import { Show, Call } from "@shared/schema";

export interface ShowWithDetails extends Show {
  timeRemaining?: string;
  formattedDate?: string;
  formattedTime?: string;
}

export interface CallWithDetails extends Call {
  number?: number;
  timerString?: string;
}

export type ShowCardProps = {
  show: ShowWithDetails;
  calls: CallWithDetails[];
  expanded: boolean;
  onToggleExpand: (id: number) => void;
  onAddCall: (showId: number) => void;
};

export type CallItemProps = {
  call: CallWithDetails;
  number: number;
};

export type TabOption = "home" | "shows" | "profile";
