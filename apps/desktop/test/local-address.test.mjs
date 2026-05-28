import assert from "node:assert/strict";
import test from "node:test";
import { toMdnsHostname } from "../dist/src/network/local-address.js";

test("toMdnsHostname preserves an existing local hostname", () => {
  assert.equal(toMdnsHostname("Davids-MacBook-Air-227.local"), "Davids-MacBook-Air-227.local");
});

test("toMdnsHostname strips router search domains before adding .local", () => {
  assert.equal(toMdnsHostname("Davids-Air-227.attlocal.net"), "Davids-Air-227.local");
});

test("toMdnsHostname sanitizes display names into mdns-safe labels", () => {
  assert.equal(toMdnsHostname("David's MacBook Air"), "David-s-MacBook-Air.local");
});
