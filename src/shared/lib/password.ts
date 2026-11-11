export type PasswordEvaluation = {
  score: number;
  valid: boolean;
  hasLength: boolean;
  hasUpper: boolean;
  hasLower: boolean;
  hasNumber: boolean;
};

export const MIN_PASSWORD_LENGTH = 8;

export function evaluarPassword(password: string): PasswordEvaluation {
  const hasLength = password.length >= MIN_PASSWORD_LENGTH;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);

  let score = 0;
  if (hasLength) score += 1;
  if (hasUpper) score += 1;
  if (hasLower) score += 1;
  if (hasNumber) score += 1;

  return {
    score,
    valid: hasLength && hasUpper && hasLower && hasNumber,
    hasLength,
    hasUpper,
    hasLower,
    hasNumber,
  };
}
