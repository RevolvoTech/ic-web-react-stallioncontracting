export interface TicketType {
  Id: number;
  ticketTitle: string;
  ticketDescription: string;
  Status: string;
  Label: string;
  thumb: string;
  AgentName: string;
  teamId?: string | null;
  teamName?: string | null;
  Date: Date;
  projectId?: string | null;
  projectName?: string | null;
  deleted: boolean;
}
