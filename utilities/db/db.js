import sqlite3 from "sqlite3";
import { states } from "../statesAndCodes.js";
import AppError from "../errorHandling/appError.js";
import { log } from "../../helpers.js";

export const connectToDb = async () => {
  try {
    const db = new sqlite3.Database(
      "./utilities/db/addresses_sample.sqlite3",
      sqlite3.OPEN_READONLY
    );
    log("🟢 Connected to the SQLite database.", "success");
    return db;
  } catch (error) {
    throw new AppError(
      `Error connecting to database: ${error.message}`,
      "E_DATABASE"
    );
  }
};

// Query the database
export const executeAddressQuery = async (addressQty = 1, db) => {
  console.log("Executing query...", addressQty);
  const sqlQuery = `SELECT * FROM addresses ORDER BY RANDOM() LIMIT ${addressQty}`;

  try {
    const rows = await new Promise((resolve, reject) => {
      db.serialize(() => {
        db.all(sqlQuery, (err, rows) => {
          if (err) {
            return reject(err);
          }
          resolve(rows);
        });
      });
    });

    const modifiedRows = rows.map((row) => {
      let modifiedRow = {
        street: `${row.number} ${row.street}`,
        city: row.city,
        stateCode: row.state,
        zipCode: row.zipcode,
      };

      // Add state to modifiedRow
      modifiedRow.state = states[modifiedRow.stateCode];

      return modifiedRow;
    });

    return modifiedRows;
  } catch (err) {
    throw new AppError(`Error executing query: ${err.message}`, "E_DATABASE");
  } finally {
    db.close((err_1) => {
      if (err_1) {
        throw new AppError(
          `Failed to close the database: ${err_1.message}`,
          "E_DATABASE"
        );
      } else {
        console.log("Closed the database connection.");
      }
    });
  }
};

export const connectAndExecuteAddressQuery = async (addressQty = 1) => {
  try {
    const db = await connectToDb();
    return await executeAddressQuery(addressQty, db);
  } catch (error) {
    throw new AppError(
      `Error connecting to database: ${error.message}`,
      "E_DATABASE"
    );
  }
};

// --- Test ---
// console.log(await connectAndExecuteAddressQuery());
