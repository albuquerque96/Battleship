const authService = require("../services/authService");
const { checkCredentials } = require("../services/credentialsFormatValidation");

const register = async (req, res, next) => {
  const { username, email, password } = req.body;

  try {
      const validationErrors = await checkCredentials(username, email, password);
      if (validationErrors) {
          const err = new Error('Validation failed');
          err.statusCode = 400;
          err.details = validationErrors;
          throw err;
      }

      const { userId, accessToken, refreshToken } = await authService.register(username, email, password);

      if (!userId || !accessToken || !refreshToken) {
          const err = new Error('Missing user data');
          err.statusCode = 500;
          throw err; 
      }

      res.cookie("accessToken", accessToken, {
          httpOnly: true,
          sameSite: "strict",
      });

      res.status(201).json({ message: "User registered successfully", userId });
  } catch (error) {
      console.error('Registration error:', error);
      if (error.message.includes("already exists in cache")) {
          const err = new Error('User already exists');
          err.statusCode = 409; 
          return next(err); 
      }
      next(error);
  }
};
const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const { userId, accessToken, refreshToken } = await authService.login(
      email,
      password
    );
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      sameSite: "strict",
    });
    res.set("Authorization", `Bearer ${accessToken}`);
    res.status(200).json({ userId });
  } catch (error) {
    res.status(401).json({ message: "Invalid credentials" });
  }
};

const logout = async (req, res) => {
  try {
    const userId = req.userId;
    await authService.logout(userId);
    res.clearCookie("refreshToken");
    res.status(200).json({ message: "User logged out successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to log out" });
  }
};

const refreshAccessToken = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    return res.status(401).json({ error: "Refresh token not provided" });
  }
  try {
    const { accessToken } = await authService.refreshAccessToken(refreshToken);
    res.json({ accessToken });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
};

module.exports = { register, login, refreshAccessToken, logout };
