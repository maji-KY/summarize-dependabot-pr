# summarize-dependabot-pr

Dependabotのプルリクの要約コメント作成

## Usage

Dependabotのプルリクがopenされたときにactionが実行されるように設定する。

基本

```yaml
- uses: maji-KY/summarize-dependabot-pr@v1
  with:
    openai_api_key: xxxxxxxxxxxxx
```

プライベートリポジトリのトークンを渡す場合

```yaml
- uses: maji-KY/summarize-dependabot-pr@v1
  with:
    openai_api_key: xxxxxxxxxxxxx
    github_token: xxxxxxxxxxxxx
```
