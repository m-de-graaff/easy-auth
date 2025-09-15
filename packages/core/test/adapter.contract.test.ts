import { beforeEach, describe, expect, it } from "vitest";
import type { Adapter } from "../src/adapter";
import { createMemoryAdapter } from "../src/adapters/memory";

function adapterContract(create: () => Adapter) {
  describe("Adapter contract", () => {
    let adapter: Adapter;

    beforeEach(() => {
      adapter = create();
    });

    it("creates and fetches a user", async () => {
      const created = await adapter.createUser({ email: "Test@Example.com", name: "T" });
      expect(created.id).toBeTruthy();
      expect(created.createdAt).instanceOf(Date);
      const fetched = await adapter.getUser(created.id);
      expect(fetched?.email).toBe("Test@Example.com");
      const byEmail = await adapter.getUserByEmail("test@example.com");
      expect(byEmail?.id).toBe(created.id);
    });

    it("updates a user", async () => {
      const u = await adapter.createUser({ email: "a@example.com" });
      const updated = await adapter.updateUser(u.id, { email: "b@example.com", name: "Bee" });
      expect(updated.email).toBe("b@example.com");
      const byEmail = await adapter.getUserByEmail("b@example.com");
      expect(byEmail?.id).toBe(u.id);
      const old = await adapter.getUserByEmail("a@example.com");
      expect(old).toBeNull();
    });

    it("links and fetches an account", async () => {
      const u = await adapter.createUser({ email: "acct@example.com" });
      await adapter.linkAccount({
        id: "acc-1",
        userId: u.id,
        provider: "github",
        providerAccountId: "123",
        accessToken: "tok",
      });
      const acc = await adapter.getAccountByProvider("github", "123");
      expect(acc?.userId).toBe(u.id);
    });

    it("creates and deletes a session", async () => {
      const u = await adapter.createUser({ email: "s@example.com" });
      const s = await adapter.createSession({
        userId: u.id,
        expiresAt: new Date(Date.now() + 60_000),
      });
      const got = await adapter.getSession(s.id);
      expect(got?.userId).toBe(u.id);
      await adapter.deleteSession(s.id);
      const gone = await adapter.getSession(s.id);
      expect(gone).toBeNull();
    });

    it("creates and consumes a verification token (single-use)", async () => {
      const vt = await adapter.createVerificationToken({
        id: "vt-1",
        identifier: "v@example.com",
        token: "abc",
        expiresAt: new Date(Date.now() + 60_000),
      });
      expect(vt.id).toBe("vt-1");
      const used = await adapter.useVerificationToken("v@example.com", "abc");
      expect(used?.id).toBe("vt-1");
      const again = await adapter.useVerificationToken("v@example.com", "abc");
      expect(again).toBeNull();
    });

    it("respects token expiry", async () => {
      await adapter.createVerificationToken({
        id: "vt-2",
        identifier: "x",
        token: "t",
        expiresAt: new Date(Date.now() - 1),
      });
      const res = await adapter.useVerificationToken("x", "t");
      expect(res).toBeNull();
    });

    it("appends audit events without throwing", async () => {
      await adapter.appendAudit({ type: "test", userId: "u1", ip: "127.0.0.1", meta: { k: 1 } });
    });
  });
}

// Run the contract against the in-memory adapter
adapterContract(createMemoryAdapter);