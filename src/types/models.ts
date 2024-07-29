export interface Topic {
  id: number;
  name: string;
}

export interface Video {
  id: number;
  name: string;
  subtitle: string;
  identifier: string;
  topic: Topic;
}
