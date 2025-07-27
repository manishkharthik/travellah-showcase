export function sanitizeMessage(content: string): string {
  return content
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/on\w+="[^"]*"/g, "") // remove onClick="..." etc.
    .replace(/javascript:/gi, "")
    .trim();
}
