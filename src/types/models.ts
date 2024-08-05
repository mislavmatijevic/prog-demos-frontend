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
  order_num: number;
}

export interface FullTask {
  id: number;
  subtopic_id: number;
  order_num: number;
  input: string;
  output: string;
  input_output_example: string;
  is_final_boss: boolean;
  starter_code: string;
  step1_code: string;
  step2_code: string;
  step3_code: string;
  helper1_text: string;
  helper2_text: string;
  helper3_text: string;
  solution_code: string;
}
