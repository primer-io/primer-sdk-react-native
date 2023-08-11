const fs = require('fs');
const smb = require('slack-message-builder')

const FAILED_SUMMARY_FILE_PATH = '/var/tmp/appetize-failure-link-summary.json'

createAppetizeSummaryReport(process.argv[3],process.argv[4])

async function createAppetizeSummaryReport(branch, platform) {
    fs.writeFileSync(FAILED_SUMMARY_FILE_PATH, JSON.stringify(createAppetizeSummary(branch, platform)));
}

function createAppetizeSummary(branch, platform) {
    return smb()
        .attachment()
        .mrkdwnIn(["title"])
        .color("#ff0000")
        .title(`Failed to generate Appetize link for branch ${branch}.`)
        .authorName(process.env.GITHUB_ACTOR)
        .authorLink(`${process.env.GITHUB_SERVER_URL}/${process.env.GITHUB_ACTOR}`)
        .authorIcon(`${process.env.GITHUB_SERVER_URL}/${process.env.GITHUB_ACTOR}.png?size=32`)
        .field()
        .title("Ref")
        .value(process.env.GITHUB_REF)
        .short(true)
        .end()
        .field()
        .title("Actions URL")
        .value(
            `<${process.env.GITHUB_SERVER_URL}/${process.env.GITHUB_REPOSITORY}/actions/runs/${process.env.GITHUB_RUN_ID}|${process.env.GITHUB_WORKFLOW}>`
        )
        .short(true)
        .end()
        .field()
        .title("Commit")
        .value(
            `<${process.env.GITHUB_SERVER_URL}/${process.env.GITHUB_REPOSITORY}/commit/${process.env.GITHUB_SHA}|${process.env.GITHUB_SHA.slice(0,6)}>`
        )
        .short(true)
        .end()
        .field()
        .title("Platform")
        .value(platform)
        .short(true)
        .end()
        .end()
        .json()
}
