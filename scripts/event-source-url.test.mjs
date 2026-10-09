import test from "node:test";
import assert from "node:assert/strict";
import { normalizeSourceUrl } from "../shared/event-source-url.mjs";

test("different Facebook photos remain distinct event sources", () => {
  const first = normalizeSourceUrl("https://www.facebook.com/photo/?fbid=1559702649291837&set=a.638912981370813");
  const other = normalizeSourceUrl("https://www.facebook.com/photo/?fbid=1519944713463519&set=a.460206639437337");
  assert.notEqual(first, other);
  assert.equal(first, "https://www.facebook.com/photo?fbid=1559702649291837");
});

test("tracking parameters and photo URL variants do not duplicate the same photo", () => {
  const expected = normalizeSourceUrl("https://www.facebook.com/photo/?fbid=1559702649291837&set=a.638912981370813");
  assert.equal(normalizeSourceUrl("https://www.facebook.com/photo.php?fbid=1559702649291837&fbclid=tracking#viewer"), expected);
});

test("Facebook events still deduplicate independently of notification parameters", () => {
  assert.equal(
    normalizeSourceUrl("https://www.facebook.com/events/2083507328948198/?ref=notif&notif_id=123"),
    normalizeSourceUrl("https://www.facebook.com/events/2083507328948198/"),
  );
});
