const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  "url",
  "anonkey"
);

const db = {
  async uploadFile(file, name) {
    try {
      const { data } = await supabase.storage.from("wakfu").update(name, file, {
        contentType: "application/json",
      });

      console.log("The data has been successfully imported 🚀", data);
    } catch (error) {
      console.log("Error during file import 🔥", error);
    }
  },

  async updateFile(file, name) {
    try {
      const { data } = await supabase.storage.from("wakfu").update(name, file, {
        contentType: "application/json",
      });

      console.log("The data has been successfully updated 🚀", data);
    } catch (error) {
      console.log("Error during file update 🔥", error);
    }
  },

  async isFileExist(name) {
    const { data } = await supabase.storage.from("wakfu").list("", {
      limit: 100,
      offset: 0,
      sortBy: { column: "name", order: "asc" },
    });

    return !!data.find((item) => item.name === name);
  },
};

module.exports = db;
