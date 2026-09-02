export interface PromptSection {
  name: string;
  content: string;
  enabled?: boolean;
}

export interface PromptBuilderOptions {
  sections: PromptSection[];
  separator?: string;
}