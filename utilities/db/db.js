import sqlite3 from "sqlite3";
import { states } from "../locations/statesAndCodes.js";

// Open a database in memory
// let db = new sqlite3.Database(
//   "./utilities/db/addresses_sample.sqlite3",
//   // "./addresses_sample.sqlite3",
//   sqlite3.OPEN_READONLY,
//   (err) => {
//     if (err) {
//       console.error(err.message);
//     }
//     // console.log("🟢 Connected to the SQLite database.");
//     global.logThis("🟢 Connected to the SQLite database.", "success");
//   }
// );

export const connectToDb = () => {
  return new Promise((resolve, reject) => {
    let db = new sqlite3.Database(
      "./utilities/db/addresses_sample.sqlite3",
      // "./addresses_sample.sqlite3",
      sqlite3.OPEN_READONLY,
      (err) => {
        if (err) {
          reject(err);
        } else {
          // console.log("🟢 Connected to the SQLite database.");
          global.logThis("🟢 Connected to the SQLite database.", "success");
          resolve(db);
        }
      }
    );
  });
};

// Query the database
export const executeAddressQuery = async (addressQty = 1, db) => {
  console.log("Executing query...", addressQty);
  const sqlQuery = `SELECT * FROM addresses ORDER BY RANDOM() LIMIT ${addressQty}`;
  try {
    return await new Promise((resolve, reject) => {
      db.serialize(() => {
        db.all(sqlQuery, (err, rows) => {
          if (err) {
            console.error(err.message);
          } else {
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

            // Return modifiedRows
            resolve(modifiedRows);
          }
        });
      });
    });
  } finally {
    db.close((err_1) => {
      if (err_1) {
        return console.error(err_1.message);
      }
      console.log("Closed the database connection.");
    });
  }
};

export const connectAndExecuteAddressQuery = async (addressQty = 1) => {
  const db = await connectToDb();
  return await executeAddressQuery(addressQty, db);
};

// --- Test ---
// console.log(await executeAddressQuery());
