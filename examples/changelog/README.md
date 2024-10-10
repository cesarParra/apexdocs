# Changelog Example

This project contains an example on how to generate a changelog using ApexDocs.'

It has 2 directories: `previous`, which contains the previous version of the project, and `current`, which contains the current version of the project.

By running the following command, you can generate a changelog between the two versions:

```bash
apexdocs changelog --previousVersionDir previous --currentVersionDir current
```

---

## Generating PR Comments with Changelog Information

One example of how to use the changelog feature is to generate a changelog for a pull request.

You can achieve this through Github Actions by using a workflow that looks as follows:

```yaml
on:
  pull_request:
    branches: [ main ]
    types: [ opened, reopened, synchronize, closed ]

jobs:
  comment-pr:
    runs-on: ubuntu-latest
    name: Comment PR
    permissions:
      pull-requests: write
    steps:
      - name: Checkout
        uses: actions/checkout@v3

      - name: Checkout previous version
        uses: actions/checkout@v3
        with:
          ref: ${{ github.event.pull_request.base.ref }}
          path: previous

      - uses: actions/setup-node@v2
        with:
          node-version: "20"

      - name: Install dependencies
        run: npm install

      - name: Install ApexDocs globally
        run: npm install @cparra/apexdocs --global

      - name: Generate changelog
        # Change the previousVersionDir and currentVersionDir to match your project structure
        run: apexdocs changelog --currentVersionDir force-app --previousVersionDir './previous/force-app' --targetDir './changelog'

      - name: Comment PR
        uses: thollander/actions-comment-pull-request@v2
        with:
          # Providing a comment_tag will update the comment if it already exists
          comment_tag: 'changelog'
          filePath: './changelog/changelog.md'
```
