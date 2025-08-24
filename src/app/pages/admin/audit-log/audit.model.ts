export interface AuditLog {
  id: number;
  user: string;
  action: string;
  model_name: string;
  object_id: number;
  timestamp: string;
  changes: any;
}
