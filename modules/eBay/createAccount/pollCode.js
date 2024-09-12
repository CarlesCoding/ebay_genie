import { logger, sleep } from "../../../helpers.js";
import {
  checkFiveSimPhoneNumberStatus,
  finishFiveSimPhoneNumber,
} from "../../../services/SMS/providers/fiveSim.js";
import {
  checkPhoneNumberStatus,
  finishPhoneNumber,
} from "../../../services/SMS/providers/sms-activate.js";
import {
  checkTextVerifiedPhoneNumberStatus,
  getTextVerifiedSMSCode,
} from "../../../services/SMS/providers/textVerified.js";

// Poll for phone verification code
export const pollForCode = async (phoneData, task, index) => {
  // Start time, so you can timeout the loop as error after X time
  const start = Date.now();
  const maxWaitTime = 5 * 60 * 1000; // 5 min in milliseconds
  let code = null;

  try {
    while (code === null) {
      logger(task.module, `[Task #${index + 1}] Polling for code...`, "info");

      // Calculate elapsed time
      const elapsedTime = Date.now() - start;

      // If no code within 5 min, error out
      if (elapsedTime > maxWaitTime) {
        // throw new Error("Timeout: Exceeded maximum wait time of 5 minutes.");
        throw new Error(
          "Timeout: SMS Provider. Please try again or try a different provider."
        );
      }

      if (phoneData.provider === "sms-activate") {
        try {
          let status = await checkPhoneNumberStatus(phoneData.id);
          if (status.startsWith("STATUS_OK:")) {
            // Set code
            code = status.split(":")[1];

            // Finish phone
            await finishPhoneNumber(phoneData.id);
          } else {
            logger(
              task.module,
              `[Task #${index + 1}] Code not ready yet..`,
              "info"
            );
          }
        } catch (error) {
          logger(
            task.module,
            `[Task #${index + 1}] Error checking SMS-activate status: ${
              error.message
            }`,
            "error"
          );
        }
      } else if (phoneData.provider === "fivesim") {
        try {
          let status = await checkFiveSimPhoneNumberStatus(phoneData.id);
          if (status && status.status === "RECEIVED" && status.sms.length > 0) {
            code = status.sms[0].code;
            logger(
              task.module,
              `[Task #${index + 1}] code: ${code}`,
              "success"
            );

            // Finish phone
            await finishFiveSimPhoneNumber(phoneData.id);
          } else {
            logger(
              task.module,
              `[Task #${index + 1}] Code not ready yet..`,
              "info"
            );
          }
        } catch (error) {
          logger(
            task.module,
            `[Task #${index + 1}] Error checking FiveSim status: ${
              error.message
            }`,
            "error"
          );
        }
      } else if (phoneData.provider === "textverified") {
        try {
          let status = await checkTextVerifiedPhoneNumberStatus(phoneData.id);
          if (status.state === "verificationCompleted") {
            // Get code..
            const smsCode = await getTextVerifiedSMSCode(
              phoneData.phone,
              phoneData.id
            );

            // Set code
            code = smsCode;
          } else {
            logger(
              task.module,
              `[Task #${index + 1}] Code not ready yet..`,
              "info"
            );
          }
        } catch (error) {
          logger(
            task.module,
            `[Task #${index + 1}] Error checking TextVerified status: ${
              error.message
            }`,
            "error"
          );
        }
      }

      // Sleep for 5 seconds before next poll
      await sleep(5000);
    }
  } catch (error) {
    logger(
      task.module,
      `[Task #${index + 1}] Error in pollForCode: ${error.message}`,
      "error"
    );
  }
  return code;
};
