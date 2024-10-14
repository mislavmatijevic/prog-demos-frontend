export interface Identifiable {
  id: number;
  name: string;
}

export type Topic = Identifiable & {
  subtopics: Array<Subtopic>;
};

export type Subtopic = Identifiable & {
  videos: Array<Video>;
  tasks: Array<BasicTask>;
};

export type Video = Identifiable & {
  identifier: string;
};

export interface TaskScore {
  tokens: number;
  complexity: number;
  totalScore: number;
}

export type BasicTask = Identifiable & {
  complexity: string;
  isBossBattle: boolean;
  bestSuccessfulSubmission: TaskScore | undefined;
};

export type HelpStep = {
  step: number;
  helperCode: string;
  helperText: string;
};

export type FullTask = BasicTask & {
  input: string;
  output: string;
  inputOutputExample: string;
  subtopic: Identifiable;
  helpSteps: Array<HelpStep>;
  allTimeBestScore: TaskScore;
  averageScore: TaskScore;
};
