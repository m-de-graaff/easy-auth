import { describe, expect, it } from "vitest";
import { createMemoryAdapter } from "../src/adapters/memory";
import { getCurrentUser, login, logout, register } from "../src/auth";

describe("auth flows", () => {
  it("registers, logs in and logs out a user", async () => {
    const adapter = createMemoryAdapter();
    await register(adapter, "test@example.com", "secret");
    const { user, session } = await login(adapter, "test@example.com", "secret");
    expect(user.email).toBe("test@example.com");
    const current = await getCurrentUser(adapter, session.id);
    expect(current?.id).toBe(user.id);
    await logout(adapter, session.id);
    const after = await getCurrentUser(adapter, session.id);
    expect(after).toBeNull();
  });
});
