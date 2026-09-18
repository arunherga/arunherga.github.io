import sharp from "sharp";

for (const name of ["home", "work"]) {
  await sharp(`assets/og-${name}.svg`)
    .png()
    .toFile(`public/og-${name}.png`);
}
