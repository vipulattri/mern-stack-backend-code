export const generateToken = (user, message, statusCode, res) => {
  const token = user.generateJsonWebToken();

  // Ensure COOKIE_EXPIRE is a number and parse it correctly
  const cookieExpireInDays = parseInt(process.env.COOKIE_EXPIRE, 10);

  if (isNaN(cookieExpireInDays)) {
    return res.status(500).json({
      success: false,
      message: 'Invalid COOKIE_EXPIRE value in environment variables',
    });
  }

  // Calculate expiration date
  const expiresIn = new Date(Date.now() + cookieExpireInDays * 24 * 60 * 60 * 1000);

  res
    .status(statusCode)
    .cookie('token', token, {
      expires: expiresIn,  // Use the calculated expiration date
      httpOnly: true,
    })
    .json({
      success: true,
      message,
      user,
      token,
    });
};
