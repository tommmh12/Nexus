/**
 * Shared JWT configuration
 * Ensures consistent JWT secret usage across AuthService and authMiddleware
 */

export const getJwtSecret = (): string => {
  // Require JWT_SECRET in production, allow fallback only in development
  if (process.env.NODE_ENV === "production" && !process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET environment variable is required in production");
  }
  
  return process.env.JWT_SECRET || "nexus_super_secret_key_change_in_production";
};

export const getJwtExpiresIn = (): string => {
  return process.env.JWT_EXPIRES_IN || "7d";
};

export const getJwtRefreshExpiresIn = (): string => {
  return process.env.JWT_REFRESH_EXPIRES_IN || "30d";
};

