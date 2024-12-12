const REGEX_UPPERCASE = /[A-Z]/;
const REGEX_NUMBER = /\d/;  
const REGEX_SPECIAL_CHARACTER = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/;  
const REGEX_ALPHANUMERIC = /^[a-zA-Z0-9]+$/;

async function validateUsernameFormat(username) {
  if (typeof username !== 'string') {
    return "Username must be a string";
  }

  // Sanitize: Remove any characters not allowed (keep only alphanumeric)
  const sanitizedUsername = username.replace(/[^a-zA-Z0-9]/g, '');

  const errors = [];

  // Check length
  if (sanitizedUsername.length < 5) {
    errors.push("Username must be at least 5 characters long");
  }

  if (sanitizedUsername.length > 18) {
    errors.push("Username must not exceed 18 characters");
  }

  // Check if it only contains alphanumeric characters
  if (!REGEX_ALPHANUMERIC.test(sanitizedUsername)) {
    errors.push("Username must contain only letters and numbers");
  }

  // Return errors if any, otherwise return null
  return errors.length > 0 ? errors : null;
}

async function validateEmailFormat(email) {
  if (typeof email !== 'string') {
    return "Email must be a string";
  }

  const sanitizedEmail = email.replace(/[^a-zA-Z0-9._@-]/g, '');
  const regex = /^(([^<>()[\]\\.,;:\s@"]+)@([a-zA-Z0-9\-.]+))\.([a-zA-Z]{2,})$/;
  return regex.test(sanitizedEmail) ? null : "Invalid email format";
}

async function validatePasswordFormat(password) {
  if (typeof password !== 'string') {
    return "Password must be a string";
  }

  const sanitizedPassword = password.replace(/[^a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/g, '');

  const errors = [];
  if (sanitizedPassword.length < 6) {
    errors.push("Password must be at least 6 characters long");
  }

  if (!REGEX_UPPERCASE.test(sanitizedPassword)) {
    errors.push("Password must contain at least one uppercase letter");
  }

  if (!REGEX_NUMBER.test(sanitizedPassword)) {
    errors.push("Password must contain at least one number");
  }

  if (!REGEX_SPECIAL_CHARACTER.test(sanitizedPassword)) {
    errors.push("Password must contain at least one special character");
  }

  return errors.length > 0 ? errors : null;
}

async function checkCredentials(username, email, password) {
  const errors = {};

  const usernameError = await validateUsernameFormat(username);
  if (usernameError) {
    errors.username = usernameError;
  }

  const emailError = await validateEmailFormat(email);
  if (emailError) {
    errors.email = emailError;
  }

  const passwordErrors = await validatePasswordFormat(password);
  if (passwordErrors) {
    errors.password = passwordErrors;
  }

  return Object.keys(errors).length > 0 ? errors : null;
}

async function checkCredentialsWithoutUsername(email, password) {
  const errors = {};

  const emailError = await validateEmailFormat(email);
  if (emailError) {
    errors.email = emailError;
  }

  const passwordErrors = await validatePasswordFormat(password);
  if (passwordErrors) {
    errors.password = passwordErrors;
  }

  return Object.keys(errors).length > 0 ? errors : null;
}

module.exports = {
  validateEmailFormat,
  validatePasswordFormat,
  validateUsernameFormat,
  checkCredentials,
  checkCredentialsWithoutUsername,
};
