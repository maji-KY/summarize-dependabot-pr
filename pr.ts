export function removeCommandsSection(text: string): string {
  const sectionStart = text.indexOf(
    "---\n\n<details>\n<summary>Dependabot commands and options</summary>",
  );
  if (sectionStart !== -1) {
    return text.slice(0, sectionStart);
  } else {
    return text;
  }
}

export type PullRequestInfo = {
  description: string;
  diffList: DiffInfo[];
};

export type DiffInfo = {
  owner: string;
  repo: string;
  commits: string[];
  changedFiles: string[];
};
