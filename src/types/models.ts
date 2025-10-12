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
  order: number;
};

export type Video = Identifiable & {
  identifier: string;
};

export interface TaskScore {
  tokens: number;
  complexity: number;
  totalScore: number;
}

export type UserBestScore = {
  score: TaskScore;
  submittedCode: string;
};

export type BasicTask = Identifiable & {
  identifier: number;
  complexity: string;
  isBossBattle: boolean;
  bestSuccessfulSubmission: UserBestScore | undefined;
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
  allTimeBestScore: TaskScore;
  averageScore: TaskScore;
};

export type News = {
  title: string;
  text: string;
  time: string;
};
