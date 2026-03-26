export interface KanbanTaskImageFile {
  fileName: string;
  mimeType: string;
  contentBase64: string;
}

export interface TodoTask {
  id: number | any;
  task: string;
  taskImage: string | null | any;
  taskText: string;
  date: string;
  projectId?: string | null;
  projectName?: string | null;
  projectTypeName?: string | null;
  projectTypeColor?: string | null;
  taskImageFile?: KanbanTaskImageFile | null;
  removeTaskImage?: boolean;
  category?: string | any;
}

export interface TodoCategory {
  id: string | any;
  name: string;
  child: TodoTask[];
}
