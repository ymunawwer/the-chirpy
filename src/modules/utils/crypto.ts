import crypto from "crypto";
function generateUserCode(length: number = 8): string {
    // Generate cryptographically strong random bytes
    const bytes = crypto.randomBytes(length);
    // Convert to URL-safe Base64 (similar to Python's token_urlsafe)
    const token = bytes.toString("base64url");
    // Truncate to desired length
    return token.slice(0, length);
  }
  export default generateUserCode;