// backend/src/auth/constants.ts
export const jwtConstants = {
  secret: process.env.JWT_SECRET || 'DEV_ONLY_FALLBACK_CHANGE_ME',
};