export type GitHubCompareInfo = {
  owner: string;
  repo: string;
  oldVersion: string;
  newVersion: string;
};

function extractCompareUrls(text: string): string[] {
  const urlRegex =
    /https:\/\/github\.com\/[^\/]+\/[^\/]+\/compare\/[\.0-9a-zA-Z]+/g;
  const urls = text.match(urlRegex);
  return Array.from(new Set(urls));
}

function extractCompareInfo(url: string): GitHubCompareInfo | null {
  const regex =
    /https:\/\/github\.com\/([^\/]+)\/([^\/]+)\/compare\/([\.0-9a-zA-Z]+)\.\.\.([\.0-9a-zA-Z]+)/;
  const match = url.match(regex);

  if (match) {
    const owner = match[1];
    const repo = match[2];
    const oldVersion = match[3];
    const newVersion = match[4];
    return { owner, repo, oldVersion, newVersion };
  } else {
    return null;
  }
}

export function extractCompareInfoAll(text: string): GitHubCompareInfo[] {
  const urls = extractCompareUrls(text);
  return urls.map((url) => extractCompareInfo(url)).filter((
    info,
  ): info is NonNullable<typeof info> => info !== null);
}
