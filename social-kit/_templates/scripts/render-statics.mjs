import { chromium } from "playwright";
import path from "node:path";
import { pathToFileURL } from "node:url";

const ROOT = path.resolve("../..");

const JOBS = [
  // Carousel — 1080x1080
  ...[1,2,3,4,5,6,7].map((n) => ({
    html: `_templates/carruseles/4-demos/slide-${n}.html`,
    out:  `personal/carruseles/4-demos/slide-${n}.png`,
    w: 1080, h: 1080,
  })),
  // Single post — 1080x1350
  {
    html: "_templates/posts/lo-que-no-hago.html",
    out:  "personal/posts/lo-que-no-hago.png",
    w: 1080, h: 1350,
  },
  // Google Business Profile cover — 2048x1080 (16:9)
  {
    html: "_templates/posts/gbp-cover.html",
    out:  "personal/posts/gbp-cover.png",
    w: 2048, h: 1080,
  },
  // Story eco — 1080x1920
  {
    html: "_templates/stories/story-eco.html",
    out:  "personal/stories/story-eco.png",
    w: 1080, h: 1920,
  },
  // Story pruébalos — 1080x1920
  {
    html: "_templates/stories/story-pruebalos.html",
    out:  "personal/stories/story-pruebalos.png",
    w: 1080, h: 1920,
  },
];

async function main() {
  const browser = await chromium.launch({ headless: true });
  for (const job of JOBS) {
    const ctx = await browser.newContext({
      viewport: { width: job.w, height: job.h },
      deviceScaleFactor: 1,
    });
    const page = await ctx.newPage();
    const url = pathToFileURL(path.join(ROOT, job.html)).href;
    console.log(`→ ${job.html}`);
    await page.goto(url, { waitUntil: "networkidle" });
    await page.waitForTimeout(2500); // fonts
    await page.screenshot({ path: path.join(ROOT, job.out), clip: { x: 0, y: 0, width: job.w, height: job.h } });
    console.log(`  saved: ${job.out}`);
    await ctx.close();
  }
  await browser.close();
}

main().catch((e) => { console.error(e); process.exit(1); });
