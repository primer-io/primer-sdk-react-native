import { danger, warn, fail, message } from "danger";
import { execSync } from "child_process";

const pr = danger.github.pr;

// #region PR Length
const bigPrThreshold = 600;
const additions = pr.additions || 0;
const deletions = pr.deletions || 0;

if (additions + deletions > bigPrThreshold) {
    warn("Pull Request size seems relatively large. If this Pull Request contains multiple changes, please split each into separate PRs for a faster, easier review.");
}
// #endregion

// #region WIP PR
if (pr.draft || pr.title.toLowerCase().includes("wip")) {
    warn("PR is classed as Work in Progress");
}
// #endregion

// #region PR Assignee
if (pr.assignees.length === 0) {
    warn("Please assign someone aside from CODEOWNERS (@checkout-pci-reviewers) to review this PR.");
}
// #endregion

// #region Conventional Commit Title
const validPrefixes = ["fix", "feat", "chore", "ci", "refactor", "docs", "perf", "test", "build", "revert", "style", "BREAKING CHANGE"];
const isConventionalCommitTitle = validPrefixes.some((prefix) => pr.title.startsWith(prefix));

if (!isConventionalCommitTitle) {
    fail("Please use a conventional commit title for this PR. See [Conventional Commits and SemVer](https://www.notion.so/primerio/Automating-Version-Bumping-and-Changelog-Creation-c13e32fea11447069dea76f966f4b0fb?pvs=4#c55764aa2f2748eb988d581a456e61e7)");
}
// #endregion

// #region ESLint
eslint()
// #endregion

function eslint() {
    try {
        const eslintOutput = execSync("npx eslint --config eslint.config.mjs --format json", { encoding: "utf-8" });
        const errors = JSON.parse(eslintOutput);
    
        errors.forEach(file => {
            file.messages.forEach(msg => {
                fail(`[ESLint] ${file.filePath} (${msg.line}:${msg.column}) - ${msg.message} (${msg.ruleId})`);
            });
        });
    
        if (errors.length === 0) {
            message("✅ No ESLint issues found.");
        } else {
            fail(
                "🙁 Found **${errors.length}** ESLint violations."
            )
        }
    } catch (error) {
        fail(`ESLint execution failed: ${error.message}`);
    }
}