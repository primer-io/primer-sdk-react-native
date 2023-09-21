const fs = require('fs');
const smb = require('slack-message-builder')

const TEST_RESULTS_FILE_PATH = './testapp/test-results/wdio-merged.json'
const SUMMARY_FILE_PATH = '/var/tmp/slack-minimal_summary.json'


createSlackReport(process.argv[3])

function createSlackReport(platform) {
    const json = JSON.parse(fs.readFileSync(TEST_RESULTS_FILE_PATH, "utf-8"));

    const suites = [...new Set(json.suites.map(suite => JSON.stringify(suite)))].map(suite => JSON.parse(
        suite))

    const failedSuitesCount = suites.map(suite => suite.tests.some(test => test.state == 'failed'))
        .filter(failed => failed)
        .length

    const totalDuration = new Date(json.end) - new Date(json.start)

    fs.writeFileSync(SUMMARY_FILE_PATH, JSON.stringify(createSummary(platform, totalDuration, suites.length, failedSuitesCount)));
}

function createSummary(platform, totalDuration, totalNumberOfTests, failedSuitesCount) {
    const authorLink = `${process.env.GITHUB_SERVER_URL}/${process.env.GITHUB_ACTOR}`;
    const title = `It took ${new Date(totalDuration).getMinutes()}min ${new Date(totalDuration).getSeconds()}s to execute ${totalNumberOfTests} tests. Number of failed tests: ${failedSuitesCount}.`;
    const repoUrl = `${process.env.GITHUB_SERVER_URL}/${process.env.GITHUB_REPOSITORY}`;

    return smb()
        .attachment()
        .color((failedSuitesCount == 0 && totalNumberOfTests > 0) ? "#36a64f" : "ff0000")
        .pretext("Finished BrowserStack tests.")
        .authorName(process.env.GITHUB_ACTOR)
        .authorLink(authorLink)
        .authorIcon(`${authorLink}.png?size=32`)
        .title(title)
        .field()
        .title("Ref")
        .value(process.env.GITHUB_REF)
        .short(true)
        .end()
        .field()
        .title("Actions URL")
        .value(
            `<${repoUrl}/actions/runs/${process.env.GITHUB_RUN_ID}|${process.env.GITHUB_WORKFLOW}>`
            )
        .short(true)
        .end()
        .field()
        .title("Commit")
        .value(
            `<${repoUrl}/commit/${process.env.GITHUB_SHA}|${process.env.GITHUB_SHA.slice(0,6)}>`
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

