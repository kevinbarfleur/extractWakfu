const pageScraper = require("./pageScraper");
const db = require("./db");

async function scrapeAll(browserInstance) {
  let browser;
  try {
    browser = await browserInstance;
    const wakfuData = JSON.stringify(
      await pageScraper.scraper(browser),
      null,
      4
    );

    if (await db.isFileExist("monsters.json")) {
      db.updateFile(wakfuData, "monsters.json");
    } else {
      db.uploadFile(wakfuData, "monsters.json");
    }
  } catch (err) {
    console.log("Could not resolve the browser instance => ", err);
  }
}

module.exports = (browserInstance) => scrapeAll(browserInstance);
