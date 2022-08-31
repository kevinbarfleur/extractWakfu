const db = require("./db");
const monstersScraper = require("./categories/monstersScraper");

async function extract(browserInstance) {
  try {
    await extractMonster(browserInstance)
  } catch (err) {
    console.log("Could not resolve the browser instance => ", err);
  }
}

async function extractMonster(browserInstance) {
  let browser = await browserInstance;
  const data = JSON.stringify(
    await monstersScraper.scraper(browser),
    null,
    4
  );

  if (await db.isFileExist("monsters.json")) {
    db.updateFile(data, "monsters.json");
  } else {
    db.uploadFile(data, "monsters.json");
  }
}

module.exports = (browserInstance) => extract(browserInstance);
