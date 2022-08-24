export async function getMonsters(page) {
    return await page.$$eval(".ak-responsivetable tbody > tr", (lines) => {
      lines = lines.map((el) => {
        return {
          name: el.querySelectorAll(".ak-linker")[1]?.firstChild?.innerHTML,
          url: el.querySelectorAll(".ak-linker")[1]?.firstChild?.href,
          image: el.querySelectorAll(".ak-linker")[0]?.firstChild?.src,
        };
      });
      return lines;
    });
  }

  export async function getName(page) {
    return await page.$eval("h1.ak-return-link", (text) =>
      text.textContent.trim()
    );
  }

  export async function getFamily(page) {
    return await page.$eval(
      ".ak-encyclo-detail-type",
      (el) => el.querySelectorAll("span")[0].innerHTML
    );
  }

  export async function getStats(page) {
    return await page.$eval(".row.ak-nocontentpadding", (col) => {
      const container = col.querySelectorAll(".ak-container.ak-content-list")[0];
      const statLines = container.querySelectorAll(".ak-title");

      return Object.values(statLines).map((line) => {
        return {
          label: line.textContent.split(":")[0].trim(),
          value: line.textContent.split(":")[1].trim(),
        };
      });
    });
  }

  export async function getResistances(page) {
    return await page.$eval(".row.ak-nocontentpadding", (col) => {
      const container = col.querySelectorAll(".ak-container.ak-content-list")[1];
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
  }

  export async function getLists(page) {
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
                image: item.querySelector(".ak-image .ak-linker")?.firstChild.src,
                name: item
                  .querySelector(".ak-title .ak-linker")
                  ?.textContent.trim(),
                percent: item
                  .querySelector(".ak-drop-percent")
                  ?.textContent.trim(),
                rarity: item
                  .querySelector(".item-rarity")
                  ?.firstChild?.nextElementSibling?.getAttribute("title"),
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
  }