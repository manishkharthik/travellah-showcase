import { sanitizeMessage } from "../utils/messageUtils";

describe("sanitizeMessage", () => {
  it("removes <script> tags", () => {
    const input = 'Hello <script>alert("hacked")</script> world';
    const result = sanitizeMessage(input);
    expect(result).toBe("Hello  world");
  });

  it("removes inline event handlers", () => {
    const input = '<div onclick="bad()">Click</div>';
    const result = sanitizeMessage(input);
    expect(result).toBe("<div >Click</div>");
  });

  it("removes javascript: links", () => {
    const input = '<a href="javascript:alert(1)">Click</a>';
    const result = sanitizeMessage(input);
    expect(result).toBe('<a href="alert(1)">Click</a>');
  });

  it("preserves safe text", () => {
    const input = "This is a normal message.";
    const result = sanitizeMessage(input);
    expect(result).toBe("This is a normal message.");
  });
});
