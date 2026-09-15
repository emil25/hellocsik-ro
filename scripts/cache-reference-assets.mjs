import { mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const directory = new URL("../artifacts/csikszereda-programajanlat/public/reference/", import.meta.url);
await mkdir(directory, { recursive: true });
const assets = {
  "castle.jpg": "https://upload.wikimedia.org/wikipedia/commons/b/b9/RO_HR_Miercurea_Ciuc_Miko_castle.jpg",
  "cloud-hero.jpg": "https://cloudfestival.ro/hero-poster.jpg?v=20260708-cut",
  "cloud-logo.png": "https://cloudfestival.ro/CYF%20logo%20white%20cropped.png",
  "mehringer.jpg": "https://cloudfestival.ro/Artists/CYF%20_%20mehringer%20_%20fb%20post.jpg",
  "metzker.png": "https://cloudfestival.ro/Artists/CYF%20_%20Metzker%20_%20fb%20post%201.png",
  "csinszka.png": "https://cloudfestival.ro/Artists/CYF%20_%20csinszka%20_%209.16%20_%204.5safe%201.png",
  "doncs.png": "https://cloudfestival.ro/Artists/Doncs%20lila%201.png",
  "czika.png": "https://cloudfestival.ro/Artists/CYF%20_%20Czika%20_%20fb%20post%201.png",
  "bozont.jpg": "https://cloudfestival.ro/Artists/CYF%20_%20Bozont%20_%20fb%20post.jpg",
  "bonzon.webp": "https://cloudfestival.ro/Artists/bonzon.webp",
  "be-toro.webp": "https://cloudfestival.ro/Artists/be-toro.webp",
  "pout-pout-fish.webp": "https://api.cinemacsikimozi.ro/api/image/format?image=uploads%2Fmovies%2Fbdb7b064-f748-4d0a-a2a4-c06ded3ae7f2%2Fimages%2FTPPF_main-poster_B1_RO_LR_52491f66-5d28-4dfb-9565-21e6e566dcd2.jpg&width=300&height=450&format=webp",
  "spider-man.webp": "https://api.cinemacsikimozi.ro/api/image/format?image=uploads%2Fmovies%2Ffc43e522-234f-412b-b437-39c957c19818%2Fimages%2FSpider-ManBrandNewDay-poster_86bcc52d-db67-4c1a-ab55-3cfc7238e9bc.jpg&width=300&height=450&format=webp",
  "cinema-spider-man.webp": "https://api.cinemacsikimozi.ro/api/image/format?image=uploads%2Fmovies%2Ffc43e522-234f-412b-b437-39c957c19818%2Fimages%2FSpider-ManBrandNewDay-poster_86bcc52d-db67-4c1a-ab55-3cfc7238e9bc.jpg&width=375&height=562&format=webp",
  "cinema-dog-stars.webp": "https://api.cinemacsikimozi.ro/api/image/format?image=uploads%2Fmovies%2Fa67b1451-b745-49a1-915e-616dc85f646c%2Fimages%2Fthedogstars_2f82add7-0e17-41a1-bdff-f6a7e34c9abf.jpg&width=375&height=562&format=webp",
  "cinema-one-night.webp": "https://api.cinemacsikimozi.ro/api/image/format?image=uploads%2Fmovies%2F921c33fe-ed81-417c-bd34-70f78c77f771%2Fimages%2Fonenight_7c6e1832-88ed-4049-ad58-745be0f03016.jpg&width=375&height=562&format=webp",
  "cinema-paw-patrol.webp": "https://api.cinemacsikimozi.ro/api/image/format?image=uploads%2Fmovies%2F647e9dad-3810-45d8-9ad5-0d53730910a1%2Fimages%2Fpawpatrol_2d76a38e-1652-4eb9-90db-13fade27ee51.jpg&width=375&height=562&format=webp",
  "running.jpg": "https://images.unsplash.com/photo-1486218119243-13301bc5e9d8?w=800&q=80",
  "conference.jpg": "https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=800&q=80",
  "dance.jpg": "https://images.unsplash.com/photo-1547153760-18fc86324498?w=800&q=80",
};
const results = [];
const entries = Object.entries(assets);
for (let index = 0; index < entries.length; index += 4) {
  results.push(...await Promise.all(entries.slice(index, index + 4).map(async ([file, url]) => {
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(25000) });
      if (!response.ok || !response.headers.get("content-type")?.startsWith("image/")) throw new Error(`HTTP ${response.status}`);
      await writeFile(new URL(file, directory), Buffer.from(await response.arrayBuffer()));
      return { file, url, saved: true };
    } catch (error) { return { file, url, saved: false, error: error.message }; }
  })));
}
await writeFile(new URL("sources.json", directory), JSON.stringify(results, null, 2));
console.log(results.map(({ file, saved, error }) => ({ file, saved, error })));
