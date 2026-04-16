const BLOCKED_DOMAINS = new Set([
  "example.com", "example.org", "example.net", "example.edu",
  "test.com", "test.org", "test.net",
  "mailinator.com", "guerrillamail.com", "guerrillamail.net",
  "tempmail.com", "temp-mail.org", "throwam.com",
  "yopmail.com", "sharklasers.com", "guerrillamailblock.com",
  "grr.la", "spam4.me", "trashmail.com", "trashmail.me",
  "dispostable.com", "maildrop.cc", "fakeinbox.com",
  "mailnull.com", "spamgourmet.com", "trashmail.at",
  "getairmail.com", "filzmail.com", "armyspy.com",
  "cuvox.de", "dayrep.com", "einrot.com", "fleckens.hu",
  "gustr.com", "jourrapide.com", "rhyta.com", "superrito.com",
  "teleworm.us", "spamgap.com", "throwam.com",
]);

export function isRealEmail(email: string): { valid: boolean; reason?: string } {
  if (!email || typeof email !== "string") {
    return { valid: false, reason: "Email is required" };
  }

  const clean = email.trim().toLowerCase();

  const basicFormat = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(clean);
  if (!basicFormat) {
    return { valid: false, reason: "Invalid email format" };
  }

  const domain = clean.split("@")[1];

  if (BLOCKED_DOMAINS.has(domain)) {
    return { valid: false, reason: "Please use a real email address" };
  }

  if (domain.includes("example") || domain.includes("test.") || domain === "test") {
    return { valid: false, reason: "Please use a real email address" };
  }

  return { valid: true };
}
