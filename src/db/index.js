const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  "https://jwxluouysvjcljgkrfgp.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp3eGx1b3V5c3ZqY2xqZ2tyZmdwIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NjA5ODQzMDUsImV4cCI6MTk3NjU2MDMwNX0.8Sh865N0N3LvywBVRuDyAMggi6aNFBfLLp4a1ex1p9I"
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
