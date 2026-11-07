import assert from "node:assert/strict";
import test from "node:test";
import {
  publicCharacters,
  sanitiseRelations,
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
