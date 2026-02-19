const pool = require("../database/");

/* ***************************
 *  Register a new account
 * ************************** */
async function registerAccount(
  account_firstname,
  account_lastname,
  account_email,
  account_password,
) {
  try {
    const sql = `
      INSERT INTO public.account (
        account_firstname, account_lastname, account_email, account_password
      ) VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const result = await pool.query(sql, [
      account_firstname,
      account_lastname,
      account_email,
      account_password,
    ]);
    return result;
  } catch (error) {
    console.error("registerAccount error:", error);
    throw error;
  }
}

/* **********************
 *   Check for existing email
 * ********************* */
async function checkExistingEmail(account_email) {
  try {
    const sql = "SELECT * FROM account WHERE account_email = $1";
    const email = await pool.query(sql, [account_email]);
    return email.rowCount;
  } catch (error) {
    return error.message;
  }
}

/* *****************************
 * Return account data using email address
 * ***************************** */
async function getAccountByEmail(account_email) {
  try {
    const result = await pool.query(
      "SELECT account_id, account_firstname, account_lastname, account_email, account_type, account_password FROM account WHERE account_email = $1",
      [account_email],
    );
    return result.rows[0];
  } catch (error) {
    return new Error("No matching email found");
  }
}

/* *****************************
 * Return account data using account ID
 * FIXED: Returns single object, not array
 * ***************************** */
async function getAccountById(accountId) {
  try {
    const sql = "SELECT * FROM public.account WHERE account_id = $1";
    const data = await pool.query(sql, [accountId]);
    return data.rows[0]; // Return single object
  } catch (err) {
    throw new Error("Error fetching account: " + err.message);
  }
}

/* *****************************
 * Update account information
 * FIXED: Takes individual params, not object
 * FIXED: Uses correct column names with account_ prefix
 * FIXED: Returns result object
 * ***************************** */
async function updateAccount(accountId, firstName, lastName, email) {
  try {
    const sql =
      "UPDATE public.account SET account_firstname = $1, account_lastname = $2, account_email = $3 WHERE account_id = $4 RETURNING *";
    const result = await pool.query(sql, [
      firstName,
      lastName,
      email,
      accountId,
    ]);
    return result; // Return result so controller can check rowCount
  } catch (err) {
    throw new Error("Error updating account: " + err.message);
  }
}

/* *****************************
 * Update account password
 * FIXED: Uses correct column name account_password
 * FIXED: Returns result object
 * ***************************** */
async function updatePassword(accountId, hash) {
  try {
    const sql =
      "UPDATE public.account SET account_password = $1 WHERE account_id = $2 RETURNING *";
    const result = await pool.query(sql, [hash, accountId]);
    return result; // Return result so controller can check rowCount
  } catch (err) {
    throw new Error("Error updating password: " + err.message);
  }
}

module.exports = {
  registerAccount,
  checkExistingEmail,
  getAccountByEmail,
  getAccountById,
  updateAccount,
  updatePassword,
};
