const { User } = require('../models');
const { hashPassword, comparePassword } = require('../utils/password');
const {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  ACCESS_EXPIRY,
} = require('../utils/jwt');
const { toSafeUser, CUSTOMER_PERMISSIONS } = require('../utils/userHelpers');
const HttpError = require('../utils/httpError');
const { ROLES } = require('../constants/roles');

const REFRESH_COOKIE_NAME = 'refreshToken';
const REFRESH_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

function setRefreshCookie(res, token) {
  res.cookie(REFRESH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: REFRESH_MAX_AGE_MS,
    path: '/auth',
  });
}

function clearRefreshCookie(res) {
  res.clearCookie(REFRESH_COOKIE_NAME, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/auth',
  });
}

async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;

    const existing = await User.findOne({ where: { email } });
    if (existing) {
      throw new HttpError(409, 'An account with this email already exists.');
    }

    const passwordHash = await hashPassword(password);

    const user = await User.create({
      name,
      email,
      passwordHash,
      role: ROLES.CUSTOMER,
      isActive: true,
      permissions: { ...CUSTOMER_PERMISSIONS },
    });

    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken(user);
    setRefreshCookie(res, refreshToken);

    return res.status(201).json({
      accessToken,
      expiresIn: ACCESS_EXPIRY,
      user: toSafeUser(user),
    });
  } catch (err) {
    return next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    const user = await User.scope('withPassword').findOne({ where: { email } });

    if (!user) {
      throw new HttpError(401, 'Invalid email or password.');
    }

    if (!user.isActive) {
      throw new HttpError(403, 'Account is deactivated. Contact an administrator.');
    }

    const valid = await comparePassword(password, user.passwordHash);
    if (!valid) {
      throw new HttpError(401, 'Invalid email or password.');
    }

    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken(user);
    setRefreshCookie(res, refreshToken);

    return res.json({
      accessToken,
      expiresIn: ACCESS_EXPIRY,
      user: toSafeUser(user),
    });
  } catch (err) {
    return next(err);
  }
}

async function refresh(req, res, next) {
  try {
    const token = req.cookies[REFRESH_COOKIE_NAME];

    if (!token) {
      throw new HttpError(401, 'Refresh token not found. Please log in again.');
    }

    let payload;
    try {
      payload = verifyRefreshToken(token);
    } catch (err) {
      clearRefreshCookie(res);
      if (err.name === 'TokenExpiredError') {
        throw new HttpError(401, 'Refresh token has expired. Please log in again.');
      }
      throw new HttpError(401, 'Invalid refresh token. Please log in again.');
    }

    const user = await User.findByPk(payload.userId);

    if (!user || !user.isActive) {
      clearRefreshCookie(res);
      throw new HttpError(401, 'User not found or inactive. Please log in again.');
    }

    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken(user);
    setRefreshCookie(res, refreshToken);

    return res.json({
      accessToken,
      expiresIn: ACCESS_EXPIRY,
      user: toSafeUser(user),
    });
  } catch (err) {
    return next(err);
  }
}

async function logout(req, res, next) {
  try {
    clearRefreshCookie(res);
    return res.json({ message: 'Logged out successfully.' });
  } catch (err) {
    return next(err);
  }
}

async function me(req, res, next) {
  try {
    return res.json({ user: toSafeUser(req.user) });
  } catch (err) {
    return next(err);
  }
}

async function updateProfile(req, res, next) {
  try {
    const { name } = req.body;

    if (!name?.trim()) {
      throw new HttpError(400, 'Name is required.');
    }

    await req.user.update({ name: name.trim() });

    return res.json({ user: toSafeUser(req.user) });
  } catch (err) {
    return next(err);
  }
}

async function updateEmail(req, res, next) {
  try {
    const { email, currentPassword } = req.body;

    if (!email?.trim()) {
      throw new HttpError(400, 'Email is required.');
    }

    if (!currentPassword) {
      throw new HttpError(400, 'Current password is required to change email.');
    }

    const user = await User.scope('withPassword').findByPk(req.user.id);
    const valid = await comparePassword(currentPassword, user.passwordHash);

    if (!valid) {
      throw new HttpError(401, 'Current password is incorrect.');
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existing = await User.findOne({ where: { email: normalizedEmail } });

    if (existing && existing.id !== user.id) {
      throw new HttpError(409, 'An account with this email already exists.');
    }

    await user.update({ email: normalizedEmail });

    return res.json({ user: toSafeUser(user) });
  } catch (err) {
    return next(err);
  }
}

async function updatePassword(req, res, next) {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      throw new HttpError(400, 'Current password and new password are required.');
    }

    if (newPassword.length < 8) {
      throw new HttpError(400, 'New password must be at least 8 characters.');
    }

    const user = await User.scope('withPassword').findByPk(req.user.id);
    const valid = await comparePassword(currentPassword, user.passwordHash);

    if (!valid) {
      throw new HttpError(401, 'Current password is incorrect.');
    }

    const passwordHash = await hashPassword(newPassword);
    await user.update({ passwordHash });

    return res.json({ message: 'Password updated successfully.' });
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  register,
  login,
  refresh,
  logout,
  me,
  updateProfile,
  updateEmail,
  updatePassword,
};
