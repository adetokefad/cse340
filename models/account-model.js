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

async function getAccountById(accountId) {
  try {
    const sql = "SELECT * FROM public.account WHERE account_id = $1";
    const data = await pool.query(sql, [accountId]);
    return data.rows;
  } catch (err) {
    throw new Error("Error fetching account: " + err.message);
  }
}

async function updateAccount(accountId, { firstName, lastName, email }) {
  try {
    const sql =
      "UPDATE public.account SET first_name = $1, last_name = $2, email = $3 WHERE account_id = $4";
    await pool.query(sql, [firstName, lastName, email, accountId]);
  } catch (err) {
    throw new Error("Error updating account: " + err.message);
  }
}

async function updatePassword(accountId, hash) {
  try {
    const sql = "UPDATE public.account SET password = $1 WHERE account_id = $2";
    await pool.query(sql, [hash, accountId]);
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
