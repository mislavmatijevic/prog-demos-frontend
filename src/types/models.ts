export interface Topic {
  id: number;
  name: string;
  subtopics: Array<Subtopic>;
}

export interface Subtopic {
  id: number;
  name: string;
  videos: Array<Video>;
}

export interface Video {
  id: number;
  name: string;
  identifier: string;
}
