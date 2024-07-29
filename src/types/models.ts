export interface Topic {
  id: number;
  name: string;
}

export interface Video {
  id: number;
  name: string;
  link: string;
  topic: Topic;
}
