import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  driveFileUrl,
  driveImageUrl,
  extractDriveFileId,
  isAllowedImageHost,
  normaliseImageSource,
  resolveDriveImage,
} from "./drive";

const SAMPLE_ID = "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms";

describe("extractDriveFileId", () => {
  it("accepts a bare file id", () => {
    assert.equal(extractDriveFileId(SAMPLE_ID), SAMPLE_ID);
  });

  it("accepts a share link", () => {
    assert.equal(
      extractDriveFileId(`https://drive.google.com/file/d/${SAMPLE_ID}/view?usp=sharing`),
      SAMPLE_ID,
    );
  });

  it("accepts an open link and a direct image URL", () => {
    assert.equal(extractDriveFileId(`https://drive.google.com/open?id=${SAMPLE_ID}`), SAMPLE_ID);
    assert.equal(
      extractDriveFileId(`https://lh3.googleusercontent.com/d/${SAMPLE_ID}=w1600`),
      SAMPLE_ID,
    );
    assert.equal(resolveDriveImage(`https://lh3.googleusercontent.com/d/${SAMPLE_ID}=w1600`), driveImageUrl(SAMPLE_ID));
  });

  it("rejects anything that is not a Drive reference", () => {
    assert.equal(extractDriveFileId(""), null);
    assert.equal(extractDriveFileId("   "), null);
    assert.equal(extractDriveFileId("https://example.com/photo.jpg"), null);
    assert.equal(extractDriveFileId("short"), null);
  });
});

describe("resolveDriveImage", () => {
  it("points at the Google image host", () => {
    const url = resolveDriveImage(SAMPLE_ID, 1200);
    assert.equal(url, `https://lh3.googleusercontent.com/d/${SAMPLE_ID}=w1200`);
  });

  it("returns null for an unrecognised reference", () => {
    assert.equal(resolveDriveImage("nonsense"), null);
  });
});

describe("isAllowedImageHost", () => {
  it("allows Google's image hosts", () => {
    assert.equal(isAllowedImageHost(driveImageUrl(SAMPLE_ID)), true);
    assert.equal(isAllowedImageHost("https://drive.google.com/file/d/x/view"), true);
  });

  it("rejects everything else", () => {
    assert.equal(isAllowedImageHost("https://evil.example.com/x.jpg"), false);
    assert.equal(isAllowedImageHost("not a url"), false);
    assert.equal(isAllowedImageHost("javascript:alert(1)"), false);
  });
});

describe("normaliseImageSource", () => {
  it("keeps local uploads", () => {
    assert.equal(normaliseImageSource("/uploads/a1b2.jpg"), "/uploads/a1b2.jpg");
    assert.equal(normaliseImageSource("/products/linen-sheer-curtain/01.jpg"), "/products/linen-sheer-curtain/01.jpg");
  });

  it("accepts committed local media under the three allowed prefixes", () => {
    assert.equal(normaliseImageSource("/portfolio/living-room.webp"), "/portfolio/living-room.webp");
    assert.equal(normaliseImageSource("/products/curtain/01.jpg"), "/products/curtain/01.jpg");
    assert.equal(normaliseImageSource("/uploads/abc.jpg?x=1"), "/uploads/abc.jpg");
  });

  it("allows nested product paths but rejects anything that climbs out", () => {
    assert.equal(
      normaliseImageSource("/products/linen-sheer-curtain/01.jpg"),
      "/products/linen-sheer-curtain/01.jpg",
    );

    for (const bad of [
      "/portfolio/../../etc/passwd",
      "/products/../secret.jpg",
      "/portfolio/x%00.jpg",
      "/portfolio/ has space.jpg",
      "/portfolio//double.jpg",
      "/uploads//a.jpg",
    ]) {
      assert.equal(normaliseImageSource(bad), null, `expected ${bad} to be rejected`);
    }
  });

  it("converts a Drive reference into an image URL", () => {
    assert.equal(
      normaliseImageSource(`https://drive.google.com/file/d/${SAMPLE_ID}/view`),
      driveImageUrl(SAMPLE_ID),
    );
  });

  it("rejects junk, so a bad value is never stored", () => {
    assert.equal(normaliseImageSource(""), null);
    assert.equal(normaliseImageSource("   "), null);
    assert.equal(normaliseImageSource("javascript:alert(1)"), null);
    assert.equal(normaliseImageSource("https://example.com/x.jpg"), null);
    assert.equal(normaliseImageSource(42), null);
  });
});

describe("driveFileUrl", () => {
  it("links back to the file in Drive", () => {
    assert.equal(driveFileUrl(SAMPLE_ID), `https://drive.google.com/file/d/${SAMPLE_ID}/view`);
  });
});
