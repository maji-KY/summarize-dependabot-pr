import { OpenAI } from "npm:openai@4.11.1";
import { DiffInfo, PullRequestInfo } from "./pr.ts";

const apiKey = Deno.env.get("OPENAI_API_KEY")!;
const openai = new OpenAI({ apiKey });

const goal = `
あなたは優秀なソフトウェアエンジニアです。
これから入力されるGitHubのプルリクエストの概要の日本語で要約してください。変更内容が理解できるような説明をしてください。
そして、このプルリクエストは問題なくマージできそうかどうかの判断と、レビューの勘所も解説してください。
問題なくというのはマージすることによってこのアプリの動作が変わったりしないことです。また、そう判断した理由についても述べてください。

出力内容はプルリクエストのコメントに投稿されるので、読みやすいように改行や装飾などのフォーマットを整えてください。
`;

function buildDiffText(diff: DiffInfo): string {
  return `
# diff of ${diff.owner}/${diff.repo}
## commits
${diff.commits.reverse().join("\n")}
## changed files
${diff.changedFiles.join("\n")}`;
}

export async function getCommentFromAI(
  info: PullRequestInfo,
  model = "gpt-3.5-turbo-16k",
): Promise<string> {
  const content = `
# PullRequest Description
${info.description}

${info.diffList.map(buildDiffText)}`;
  const response = await openai.chat.completions.create({
    model: model,
    messages: [
      { role: "system", content: goal },
      { role: "user", content: content },
    ],
  });
  return response.choices[0].message?.content!;
}
