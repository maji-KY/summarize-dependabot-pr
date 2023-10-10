import { Octokit } from "npm:@octokit/rest@20.0.2";
import { DiffInfo, removeCommandsSection } from "./pr.ts";
import { extractCompareInfoAll, GitHubCompareInfo } from "./compare_info.ts";
import { getCommentFromAI } from "./gpt.ts";

const pr_number = Deno.env.get("PR_NUMBER");
const token = Deno.env.get("GITHUB_TOKEN");
const [owner, repo] = (Deno.env.get("GITHUB_REPOSITORY") || "").split("/");

const octokit = new Octokit({ auth: token });

const warnMessage = "\n\n---\n\n※あくまでもChatGPTの意見です";

/** 2つのバージョン間のコミットと変更されたファイルの一覧を取得する */
async function getDiffInfo(info: GitHubCompareInfo): Promise<DiffInfo> {
  const { data: comparison } = await octokit.repos.compareCommits({
    owner: info.owner,
    repo: info.repo,
    base: info.oldVersion,
    head: info.newVersion,
  });

  const commits = comparison.commits.map((x) =>
    `${x.sha.substring(0, 8)}: ${x.commit.message}`
  );
  const changedFiles = comparison.files?.map((x) => x.filename) || [];

  return { owner: info.owner, repo: info.repo, commits, changedFiles };
}

/** プルリクエストの概要を見てコメントを付ける */
async function createAiComment(text: string): Promise<string> {
  const description = removeCommandsSection(text);
  const compareInfoList = extractCompareInfoAll(description);
  const diffList = await Promise.all(compareInfoList.map(getDiffInfo));

  return getCommentFromAI({
    description,
    diffList,
  });
}

async function processPullRequest() {
  const pull_number = parseInt(pr_number!, 10);

  const { data: pr } = await octokit.pulls.get({
    owner,
    repo,
    pull_number,
  });

  // プルリクエストのコメントを取得する
  const { data: comments } = await octokit.issues.listComments({
    owner,
    repo,
    issue_number: pr.number,
  });
  // 処理済みなら飛ばす
  if (comments.find((x) => x.body?.includes(warnMessage))) {
    return;
  }

  const aiComment = await createAiComment(pr.body!);

  // コメントをプルリクエストに追加する
  await octokit.issues.createComment({
    owner,
    repo,
    issue_number: pr.number,
    body: aiComment + warnMessage,
  });
}

// 関数を呼び出す
processPullRequest();
