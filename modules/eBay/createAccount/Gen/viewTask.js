import config from "../../../../config/config.js";
import { sleep } from "../../../../helpers.js";

export const handleViewAcctGenTask = async () => {
  try {
    let saved = config.get("ebay-cli.tasks");

    if (saved.length > 0) {
      global.logThis(`Total Task Saved: ${saved.length}`, "warn");

      let ebayGenTask = saved.filter((x) => x.module === "eBay Gen");

      if (ebayGenTask.length > 0) {
        global.logThis(
          `--- eBay Account Generator Task ${ebayGenTask.length} ---`,
          "info"
        );

        console.table(ebayGenTask, [
          "module",
          "catchall",
          "imap",
          "simProvider",
          "useProxies",
        ]);
      } else {
        global.logThis("❌ No tasks saved!", "error");
        await sleep(1500);
        global.runMain();
        return;
      }
    } else {
      global.logThis("❌ No tasks saved!", "error");
      await sleep(1500);
      global.runMain();
      return;
    }
  } catch (error) {
    console.log(`Error in handleViewAcctGenTask = `, error);
  }
};
