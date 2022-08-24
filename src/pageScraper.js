const fs = require("fs");
const _ = require("lodash");
const db = require("./db");

const MONSTERS = require("./../monsters.json").filter(
  (monster) => monster.name && monster.name !== "No name found"
);

const MONSTERS_PAGES = 45;
const DELAY_RANGE = {
  min: 100,
  max: 1000,
};

const scraperObject = {
  data: MONSTERS,
  page: 1,
  size: 24,

  async scraper(browser) {
    const url = `https://www.wakfu.com/fr/mmorpg/encyclopedie/monstres?size=${this.size}&page=${this.page}`;
    let page = await browser.newPage();
    console.log(`Navigating to ${url}...`);
    await page.goto(url);
    await page.waitForSelector(".ak-responsivetable");
    let monsters = await this.getMonsters(page);

    // Loop through each of those monsters, open a new page instance and get the relevant data from them
    let pagePromise = (url) =>
      new Promise(async (resolve, reject) => {
        try {
          let dataObj = {};
          let newPage = await browser.newPage();
          await newPage.waitForTimeout(
            Math.random() * (DELAY_RANGE.max - DELAY_RANGE.min) +
              DELAY_RANGE.min
          );
          await newPage.goto(url);

          dataObj["name"] = await this.getName(newPage);
          dataObj["image"] = await this.getImage(newPage);
          dataObj["family"] = await this.getFamily(newPage);
          dataObj["stats"] = await this.getStats(newPage);
          dataObj["resistances"] = await this.getResistances(newPage);
          dataObj["listing"] = await this.getLists(newPage);

          resolve(dataObj);
          await newPage.close();
        } catch (error) {
          reject(error);
        }
      });

    for (let monster of monsters) {
      const match = this.data.find((item) => item.name === monster.name);
      if (match) continue;

      try {
        let currentPageData = await pagePromise(monster.url);
        this.data.push(currentPageData);

        fs.writeFileSync("monsters.json", JSON.stringify(this.data, null, 4));

        console.log(`🔥 Page ${this.page} - 👾 ${currentPageData.name}`);
      } catch (error) {
        throw new Error(`Error during 👾 ${monster.name}'s data extraction`);
      }
    }

    if (this.page < MONSTERS_PAGES) {
      this.page += 1;

      if (await db.isFileExist("monsters.json")) {
        db.updateFile(JSON.stringify(this.data, null, 4), "monsters.json");
      } else {
        db.uploadFile(JSON.stringify(this.data, null, 4), "monsters.json");
      }

      await this.scraper(browser);
    } else {
      return this.data;
    }

    return this.data;
  },
  async getMonsters(page) {
    try {
      return await page.$$eval(".ak-responsivetable tbody > tr", (lines) => {
        lines = lines.map((el) => {
          return {
            name: el.querySelectorAll(".ak-linker")[1]?.firstChild?.innerHTML,
            url: el.querySelectorAll(".ak-linker")[1]?.firstChild?.href,
          };
        });
        return lines;
      });
    } catch (error) {
      throw new Error(error);
    }
  },
  async getName(page) {
    try {
      return await page.$eval(".ak-title-container .ak-return-link", (text) =>
        text.textContent.trim()
      );
    } catch (error) {
      throw "No name found!";
    }
  },
  async getImage(page) {
    try {
      return await page.$eval(
        ".ak-encyclo-detail-illu-monster img",
        (img) => img.src
      );
    } catch (error) {
      throw "No image found!";
    }
  },
  async getFamily(page) {
    try {
      return await page.$eval(
        ".ak-encyclo-detail-type",
        (el) => el.querySelectorAll("span")[0].innerHTML
      );
    } catch (error) {
      throw "No family found!";
    }
  },
  async getStats(page) {
    try {
      return await page.$eval(".row.ak-nocontentpadding", (col) => {
        const container = col.querySelectorAll(
          ".ak-container.ak-content-list"
        )[0];
        const statLines = container.querySelectorAll(".ak-title");

        return Object.values(statLines).map((line) => {
          return {
            label: line.textContent.split(":")[0].trim(),
            value: line.textContent.split(":")[1].trim(),
          };
        });
      });
    } catch (error) {
      throw new Error(error);
    }
  },
  async getResistances(page) {
    try {
      return await page.$eval(".row.ak-nocontentpadding", (col) => {
        const container = col.querySelectorAll(
          ".ak-container.ak-content-list"
        )[1];
        const resistLines = container.querySelectorAll(".ak-list-element");

        return Object.values(resistLines).map((line) => {
          return {
            label: line.querySelector(".ak-aside").textContent,
            boost: line
              .querySelector(".ak-title")
              .textContent.trim()
              .split("\n")[0],
            resistance: line
              .querySelector(".ak-title")
              .textContent.trim()
              .split("\n")[1],
          };
        });
      });
    } catch (error) {
      throw new Error(error);
    }
  },
  async getLists(page) {
    try {
      return await page.$eval(".ak-container.ak-panel-stack", (content) => {
        const VALID_CAREGORIES = ["Drops", "Sorts", "Permet de recolter"];
        const sections = content.querySelectorAll(".ak-container.ak-panel");
        let list = [];

        sections.forEach((section) => {
          title = section.querySelector(".ak-panel-title")?.textContent.trim();
          if (VALID_CAREGORIES.includes(title)) {
            let items = [];

            if (title === "Drops") {
              items = Object.values(
                section.querySelectorAll(".ak-column.ak-container")
              ).map((item) => {
                return {
                  name: item
                    .querySelector(".ak-title .ak-linker")
                    ?.textContent.trim(),
                  image: item.querySelector(".ak-image .ak-linker img")?.src,
                  percent: item
                    .querySelector(".ak-drop-percent")
                    ?.textContent.trim(),
                  rarity: item
                    .querySelector(".item-rarity")
                    ?.firstChild?.nextElementSibling?.getAttribute("title"),
                  level: item.querySelector(".ak-aside")?.textContent.trim(),
                };
              });
            } else if (title === "Sorts") {
              items = Object.values(
                section.querySelectorAll(".ak-column.ak-container")
              ).map((item) => {
                return {
                  name: item.querySelector(".ak-title")?.textContent.trim(),
                  image: item.querySelector(".ak-image img")?.src,
                  level: item.querySelector(".ak-aside")?.textContent.trim(),
                };
              });
            } else if (title === "Permet de recolter") {
              items = Object.values(
                section.querySelectorAll(".ak-column.ak-container")
              ).map((item) => {
                return {
                  name: item
                    .querySelector(".ak-title a span")
                    ?.textContent.trim(),
                  description: item
                    .querySelector(".ak-text")
                    ?.textContent.trim(),
                  image: item.querySelector(".ak-image img")?.src,
                  level: item.querySelector(".ak-aside")?.textContent.trim(),
                };
              });
            }

            const block = {
              title,
              items,
            };

            list.push(block);
          }
        });

        return list;
      });
    } catch (error) {
      throw new Error(error);
    }
  },
};

module.exports = scraperObject;
