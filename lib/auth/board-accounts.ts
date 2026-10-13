export const BOARD_ACCOUNTS = [
  { email: "chairman@nerfed.example", name: "رئيس مجلس الإدارة" },
  { email: "operations@nerfed.example", name: "إدارة التشغيل" },
  { email: "finance@nerfed.example", name: "الإدارة المالية" },
  { email: "technology@nerfed.example", name: "الإدارة التقنية" },
  { email: "strategy@nerfed.example", name: "إدارة الاستراتيجية" },
] as const;

export type BoardAccount = (typeof BOARD_ACCOUNTS)[number];

type AuthenticatedUser = {
  email?: string;
  app_metadata?: Record<string, unknown>;
};

export function getBoardAccount(
  email: string | undefined,
): BoardAccount | undefined {
  const normalizedEmail = email?.trim().toLowerCase();
  return BOARD_ACCOUNTS.find((account) => account.email === normalizedEmail);
}

export function isBoardUser(
  user: AuthenticatedUser | null | undefined,
): boolean {
  return Boolean(
    user &&
    getBoardAccount(user.email) &&
    user.app_metadata?.narfid_board_member === true,
  );
}
