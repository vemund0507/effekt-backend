export function getPasswordResetToken(): string;
export function getPasswordSalt(): string;
export function getAccessKey(): string;
export function getAccessToken(): string;
export function hashPassword(password: string, salt: string): string;
