import { describe, it, expect, beforeEach } from "vitest";
import { saveToken, clearToken, getStoredToken, getStoredUser } from "../services/api";

describe("Frontend Auth & Storage Helpers", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("should store and clear token correctly", () => {
    expect(getStoredToken()).toBeNull();
    saveToken("sample_jwt_token_123");
    expect(getStoredToken()).toBe("sample_jwt_token_123");
    clearToken();
    expect(getStoredToken()).toBeNull();
  });

  it("should decode stored JWT user details correctly", () => {
    // Header.Payload.Signature (sub: user_123, role: admin, name: Admin)
    // Payload: {"sub":"user_123","name":"Admin User","email":"admin@shopzen.com","role":"admin"} -> base64
    const payloadObj = { sub: "user_123", name: "Admin User", email: "admin@shopzen.com", role: "admin" };
    const encodedPayload = btoa(JSON.stringify(payloadObj));
    const mockToken = `header.${encodedPayload}.signature`;

    saveToken(mockToken);
    const user = getStoredUser();
    expect(user).not.toBeNull();
    expect(user?.id).toBe("user_123");
    expect(user?.role).toBe("admin");
    expect(user?.email).toBe("admin@shopzen.com");
  });
});
