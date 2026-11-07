import assert from "node:assert/strict";
import test from "node:test";
import {filterPublicRedirects} from "../scripts/public-redirects";

const allowedIds = new Set(["tvxq-yunho", "tvxq-changmin", "pc-kiyori"]);
const redirects = [
  {from: "/characters/npc/nct-taeil", to: "/characters/npc/enemy-taeil"},
  {from: "/cosmology/deities/tvxq-jaejoong", to: "/characters/npc/tvxq-jaejoong"},
  {from: "/cosmology/deities/tvxq-junsu", to: "/characters/npc/tvxq-junsu"},
  {from: "/cosmology/deities/tvxq-yoochun", to: "/characters/npc/tvxq-yoochun"},
  {from: "/cosmology/deities/tvxq-yunho", to: "/characters/npc/tvxq-yunho"},
  {from: "/cosmology/deities/tvxq-changmin", to: "/characters/npc/tvxq-changmin"},
  {from: "/characters/old-kiyori", to: "/characters/party/pc-kiyori"},
  {from: "/factions/old", to: "/factions/ateez"},
];

test("public redirects omit hidden character destinations", () => {
  const result = filterPublicRedirects(redirects, true, allowedIds);
  assert.deepEqual(result, redirects.slice(4));
});

test("normal development builds keep historical redirect definitions", () => {
  assert.deepEqual(filterPublicRedirects(redirects, false, allowedIds), redirects);
});

test("public redirects reject hidden pet destinations", () => {
  assert.deepEqual(
    filterPublicRedirects([
      {from:"/old-pet",to:"/characters/pet/pet-hidden"},
      {from:"/old-god",to:"/cosmology/deities/t1-peyz"},
    ], true, allowedIds),
    [{from:"/old-god",to:"/cosmology/deities/t1-peyz"}],
  );
});
