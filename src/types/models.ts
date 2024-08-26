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
  complexity: number;
  name: string;
}

export interface FullTask {
  id: number;
  idSubtopic: number;
  name: string;
  complexity: number;
  input: string;
  output: string;
  inputOutputExample: string;
  isFinalBoss: boolean;
  starterCode: string;
  step1Code: string;
  step2Code: string;
  step3Code: string;
  helper1Text: string;
  helper2Text: string;
  helper3Text: string;
  solutionCode: string;
}
