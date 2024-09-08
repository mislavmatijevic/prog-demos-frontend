export interface Topic {
  id: number;
  name: string;
  subtopics: Array<Subtopic>;
}

export interface Subtopic {
  id: number;
  name: string;
  videos: Array<Video>;
  tasks: Array<BasicTask>;
}

export interface Video {
  id: number;
  name: string;
  identifier: string;
}

export interface BasicTask {
  id: number;
  complexity: string;
  name: string;
}

export type HelpStep = {
  step: number;
  helperCode: string;
  helperText: string;
};

export interface FullTask {
  id: number;
  idSubtopic: number;
  name: string;
  complexity: string;
  input: string;
  output: string;
  inputOutputExample: string;
  isBossBattle: boolean;
  solutionCode: string;
  helpSteps: Array<HelpStep>;
}
