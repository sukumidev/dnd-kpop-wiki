import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {copyAllowed, stripHiddenCharacterLinks, supplementalPublicCharacterImages, referencedRealmImageAssets} from "../scripts/build-public.mjs";
import test from "node:test";
import {
  publicCharacters,
  publishEveryCharacter,
  sanitiseRelations,
  sanitisePublicCosmology,
  restrictedTerms,
  restrictedIdentifiers,
  approvedTeasers,
  containsTerm,
  findLeaks,
} from "../scripts/public-build-policy.mjs";

const registry = {
  "npc-hero": {id: "npc-hero", title: "Hero", visibility: "public", bonds: [
    {characterId: "npc-secret", label: "Hidden Name", docPath: "characters/npc/npc-secret"},
    {characterId: "npc-ally", label: "Ally"},
  ]},
  "npc-secret": {id: "npc-secret", title: "Secret Name", visibility: "hidden", imageSrc: "/img/characters/npc/npc-secret.webp"},
  "npc-ally": {id: "npc-ally", title: "Ally", visibility: "public"},
};
const hidden = {"npc-secret": registry["npc-secret"]};
const hiddenIds = new Set(Object.keys(hidden));

test("public registry completely omits hidden records", () => {
  assert.deepEqual(Object.keys(publicCharacters(registry)), ["npc-hero", "npc-ally"]);
});

test("relations to hidden characters disappear as complete objects", () => {
  const scrubbed = sanitiseRelations(publicCharacters(registry), hiddenIds);
  assert.equal(scrubbed["npc-hero"].bonds.length, 1);
  assert.equal(scrubbed["npc-hero"].bonds[0].label, "Ally");
  assert.ok(!JSON.stringify(scrubbed).includes("npc-secret"));
  assert.ok(!JSON.stringify(scrubbed).includes("Hidden Name"));
});

test("direct references, route paths, map keys are removed", () => {
  const source = {
    characterIds: ["npc-hero", "npc-secret"],
    leading: {id: "npc-secret", label: "The spoiler"},
    homepage: {"npc-secret": "internal"},
    docPath: "characters/npc/npc-secret",
  };
  const result = sanitiseRelations(source, hiddenIds);
  assert.deepEqual(result, {characterIds:["npc-hero"],homepage:{}});
});

test("published teaser serializes only public-safe fields and ignores extras", () => {
  const forbidden = restrictedTerms(hidden, [], publicCharacters(registry));
  const list = approvedTeasers([{
    characterId: "npc-secret", publish:true, slug:"el-encapuchado",
    title:"Una figura desconocida", teaser:"Se oyen pasos junto al faro.",
    metadata: {name: "Secret Name", factionId: "secret-faction"},
  }], hidden, forbidden);
  assert.deepEqual(list, [{
    slug:"el-encapuchado",title:"Una figura desconocida",
    teaser:"Se oyen pasos junto al faro.",
  }]);
  assert.ok(!JSON.stringify(list).includes("npc-secret"));
  assert.ok(!JSON.stringify(list).includes("Secret Name"));
});

test("draft or non-published mystery does not enter public output", () => {
  assert.deepEqual(approvedTeasers([{
    publish:false,characterId:"npc-secret",
    slug:"secret",title:"Secret Name",teaser:"Private data",
  }],hidden,restrictedTerms(hidden,[],publicCharacters(registry))),[]);
});

test("mystery cannot expose private character name, ID, or unapproved image path", () => {
  const terms = restrictedTerms(hidden,[],publicCharacters(registry));
  assert.throws(() => approvedTeasers([{
    publish:true, characterId:"npc-secret", slug:"secret-name",
    title:"???",teaser:"A rumour.",
  }],hidden,terms));
  assert.throws(() => approvedTeasers([{
    publish:true,characterId:"npc-secret",slug:"unknown",
    title:"???",teaser:"npc-secret has arrived.",
  }],hidden,terms));
  assert.throws(() => approvedTeasers([{
    publish:true,characterId:"npc-secret",slug:"unknown",
    title:"???",teaser:"Unmarked.",
    imageSrc:"/img/characters/npc/npc-secret.webp",
  }],hidden,terms));
});

test("disallows duplicate slugs and nonhidden targets", () => {
  const a = {characterId:"npc-secret",publish:true,slug:"unknown",title:"The unknown",teaser:"Something moved."};
  assert.throws(() => approvedTeasers([a,a],hidden,new Set()));
  assert.throws(() => approvedTeasers([{...a,characterId:"npc-hero"}],hidden,new Set()));
});

test("leak scanner matches exact terms rather than arbitrary substrings", () => {
  assert.ok(containsTerm("The npc-secret was mentioned.", "npc-secret"));
  assert.equal(containsTerm("npc-secretary", "npc-secret"), false);
  assert.deepEqual(findLeaks("A character was called Secret Name.", new Set(["Secret Name","npc-secret"])),["Secret Name"]);
});

test("narrative opt-in still blocks private record identifiers", () => {
  const terms = restrictedIdentifiers(hidden, [{id: "private-diary", title: "The Lost Diary"}]);
  assert.ok(terms.has("npc-secret"));
  assert.ok(terms.has("private-diary"));
  assert.ok(!terms.has("Secret Name"));
  assert.ok(!terms.has("The Lost Diary"));
  assert.deepEqual(findLeaks("A rumor about Secret Name", terms), []);
  assert.deepEqual(findLeaks("The npc-secret was mentioned", terms), ["npc-secret"]);
  assert.deepEqual(findLeaks("Source private-diary", terms), ["private-diary"]);
});

test("public stage omits hidden pet and deity MDX pages", () => {
  const hiddenIds = new Set(["pet-secret", "astro-secret"]);
  assert.equal(copyAllowed("docs/characters/pet/pet-secret.mdx", hiddenIds), false);
  assert.equal(copyAllowed("docs/cosmology/deities/astro-secret.mdx", hiddenIds), false);
  assert.equal(copyAllowed("docs/characters/npc/npc-visible.mdx", hiddenIds), true);
  assert.equal(copyAllowed("docs/campaign/sessions/16.mdx", hiddenIds), true);
});

test("public authored docs retain narrative labels but unlink hidden characters", () => {
  const hiddenIds = new Set(["npc-secret", "pet-secret", "astro-secret"]);
  const source = [
    "[Unknown traveler](/characters/npc/npc-secret)",
    "[Secret pet](/characters/pet/pet-secret)",
    "[Secret god](/cosmology/deities/astro-secret#story)",
    "[Known hero](/characters/npc/npc-hero)",
  ].join(" | ");
  assert.equal(stripHiddenCharacterLinks(source, hiddenIds), [
    "Unknown traveler",
    "Secret pet",
    "Secret god",
    "[Known hero](/characters/npc/npc-hero)",
  ].join(" | "));
});

test("explicit public cosmology and homepage assets are allowed without exposing hidden portraits", () => {
  const hidden = {
    "npc-hidden": {id: "npc-hidden", imageSrc: "/img/characters/enemy/hidden.webp"},
  };
  const publicCosmology = {
    "deity-no-character": {imageSrc: "/img/characters/mythic/public-deity.webp"},
    "npc-hidden": {imageSrc: "/img/characters/enemy/hidden.webp"},
    "alternate-hidden-id": {characterId: "npc-hidden", imageSrc: "/img/characters/enemy/other.webp"},
  };
  const homepage = 'imageSrc: "/img/characters/txt/home-illustration.webp"';
  const cards = '[{id: "pc-imugi", imageFile: "imugi-card.webp"}]';
  const {allowed, required} = supplementalPublicCharacterImages(publicCosmology, hidden, homepage, cards);
  assert.deepEqual([...allowed].sort(), [
    "/img/characters/mythic/public-deity.webp",
    "/img/characters/party/cards/imugi-card.webp",
    "/img/characters/txt/home-illustration.webp",
  ].sort());
  assert.deepEqual([...required], ["/img/characters/party/cards/imugi-card.webp"]);
  assert.ok(!allowed.has("/img/characters/enemy/hidden.webp"));
});

test("public cosmology retains deity profiles but removes hidden character links", () => {
  const registry = {
    "astro-myungjun": {
      id: "astro-myungjun", title: "MYUNGJUN",
      characterId: "astro-mj", docPath: "cosmology/deities/astro-myungjun",
    },
    "bg-gdragon": {
      id: "bg-gdragon", title: "G-DRAGON",
      characterId: "bigbang-g-dragon", docPath: "cosmology/deities/bg-gdragon",
    },
    "npc-private": {
      id: "npc-private", title: "Do not publish",
      characterId: "npc-private",
    },
    "public-deity": {
      id: "public-deity", title: "Visible deity",
      characterId: "npc-hero", notes: ["npc-private", "public note"],
    },
  };
  const hidden = new Set(["astro-mj", "bigbang-g-dragon", "npc-private"]);
  const result = sanitisePublicCosmology(registry, hidden);
  assert.deepEqual(Object.keys(result), ["astro-myungjun", "bg-gdragon", "public-deity"]);
  assert.equal(result["astro-myungjun"].characterId, undefined);
  assert.equal(result["bg-gdragon"].characterId, undefined);
  assert.equal(result["public-deity"].characterId, "npc-hero");
  assert.deepEqual(result["public-deity"].notes, ["public note"]);
  for (const id of hidden) assert.equal(JSON.stringify(result).includes(id), false);
});

test("public sanitization excludes hidden IDs from client-side curated lists", () => {
  const registry = JSON.parse(fs.readFileSync(path.join(process.cwd(), "src/data/characters.json"), "utf8"));
  const hiddenIds = new Set(Object.entries(registry)
    .filter(([, record]) => record.visibility !== "public").map(([id]) => id));
  const idols = JSON.parse(fs.readFileSync(path.join(process.cwd(), "src/data/idolCharacterIds.json"), "utf8"));
  const overrides = JSON.parse(fs.readFileSync(path.join(process.cwd(), "src/data/characterDirectoryOverrides.json"), "utf8"));
  const clean = sanitiseRelations({idols, overrides}, hiddenIds);
  const forbidden = restrictedIdentifiers(
    Object.fromEntries([...hiddenIds].map(id => [id, registry[id]])),
    [],
  );
  assert.deepEqual(findLeaks(JSON.stringify(clean), forbidden), []);
  assert.ok(clean.idols.length > 0);
  assert.equal(clean.overrides.alwaysInclude.includes("enemy-seungri"), false);
  assert.equal(clean.overrides.exclude.includes("tvxq-jaejoong"), false);
});

test("public realm illustrations are copied even when image paths are dynamically assembled", () => {
  const gallery = [
    '{id:"hyberia", imageFile: "hyberia.webp"}',
    '{id:"sylmorien", imageFile: "sylmorien.webp"}',
  ].join("\n");
  const world = [
    "const realmImageFiles: Record<string, string> = {",
    "  hyberia: 'hyberia.webp',",
    "  jeyperia: 'jeyperia.webp',",
    "};",
  ].join("\n");
  assert.deepEqual([...referencedRealmImageAssets(gallery, world)].sort(), [
    "/img/realms/hyberia.webp",
    "/img/realms/jeyperia.webp",
    "/img/realms/sylmorien.webp",
  ]);
});

test("public realm image collector rejects missing or unsafe source mappings", () => {
  assert.throws(
    () => referencedRealmImageAssets('imageFile: "../secret.webp"', "const realmImageFiles = {};"),
    /Cannot determine public realm illustration assets/,
  );
});

test("all configured public realm illustrations exist under static assets", () => {
  const root = process.cwd();
  const gallery = fs.readFileSync(path.join(root, "src/components/RealmGallery.tsx"), "utf8");
  const world = fs.readFileSync(path.join(root, "src/pages/world/index.tsx"), "utf8");
  const images = referencedRealmImageAssets(gallery, world);
  assert.equal(images.size, 6);
  for (const asset of images) {
    assert.equal(fs.existsSync(path.join(root, "static", asset.slice(1))), true, asset);
  }
});

test("approved complete character catalog is public in staging without mutating the CMS source", () => {
  const original = {
    "npc-public": {id:"npc-public", visibility:"public", title:"Visible"},
    "npc-private": {id:"npc-private", visibility:"hidden", title:"Previously hidden", hasProfile:false},
  };
  const snapshot = publishEveryCharacter(original);
  assert.deepEqual(Object.keys(snapshot), ["npc-public", "npc-private"]);
  assert.equal(snapshot["npc-private"].visibility, "public");
  assert.equal(snapshot["npc-private"].hasProfile, false);
  assert.equal(original["npc-private"].visibility, "hidden");
  assert.notStrictEqual(snapshot["npc-private"], original["npc-private"]);
  assert.deepEqual(
    Object.keys(sanitisePublicCosmology({
      "god-one": {id:"god-one", characterId:"npc-private", docPath:"cosmology/deities/god-one"},
    }, new Set())),
    ["god-one"],
  );
});

test("publishing characters does not publish non-public documents", () => {
  const documents = [
    {id:"public-one", status:"published", visibility:"public"},
    {id:"private-one", status:"draft", visibility:"private"},
    {id:"archived-one", status:"archived", visibility:"public"},
  ];
  const visible = documents.filter(d => d.status === "published" && d.visibility === "public");
  assert.deepEqual(visible.map(d=>d.id), ["public-one"]);
});
