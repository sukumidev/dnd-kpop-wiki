# Public Wiki build and DM-approved mysteries

## Threat model

The public Wiki must **not** send hidden character profiles or unpublished
documents to the browser. Filtering React cards is not a security boundary:
Docusaurus produces static HTML and JavaScript that anyone can inspect.

The source repository **must be private** if it contains DM secrets. This repo
was public when the feature was implemented. Removing secrets from a future
build does **not** erase anything that may already be in Git history, forks, or
existing clones. Cloudflare Access or a password on the deployed site does
not protect a public source repository.

## Publishing workflow

1. Make the source repository private and review its Git history.
2. Install dependencies in the normal checkout:
   - npm ci
3. Set an HTTPS SITE_URL and BASE_URL, for example on macOS/Linux:
   - SITE_URL=https://hallyura-wiki.pages.dev BASE_URL=/ npm run build:public
4. Only deploy the new **build-public/** directory, never the normal
   **build/** directory.
5. For Cloudflare Pages: root directory my-website, build command
   npm run build:public, output directory build-public, Node >=20.
6. Do not deploy if the build exits with an error or prints a leak report.

The public builder generates an isolated staging copy in a temporary directory,
does not edit the original characters.json, and copies only explicitly referenced
public image assets. It excludes all hidden character MDX files and scrubs
direct ID relationships from public JSON. Only publicly published documents
are included; private MDX document bodies are not copied. Statblocks are
restricted to public character IDs. The mystery public dataset contains no
private character IDs.

The build is deliberately **fail-closed**. It uses Docusaurus's existing strict
broken-link checks, then scans the generated HTML, JS, JSON, CSS and related
text for hidden IDs, restricted document IDs and distinctive private names.
If anything matches, it refuses to produce build-public/. This is intended to
catch spoiler links remaining in sessions, faction pages or custom TSX.

**Limitations:** Automatic checks cannot judge every natural-language lore
spoiler, nor infer whether a faction or map illustration reveals unreleased
plot information. DM editorial review is required. Source-repo privacy is
required independently of the published build.

## Create a mystery teaser

The input belongs **outside Git**. It can live in my-website/private/mysteries.json
(the private/ folder is gitignored) or be injected as a protected CI secret.

Example private/mysteries.json:

  [
    {
      "characterId": "npc-example-hidden-id",
      "publish": true,
      "slug": "figura-enmascarada",
      "title": "Una figura enmascarada",
      "teaser": "Alguien ha sido visto cerca del puerto."
    }
  ]

The characterId above is a placeholder. Use the real ID **only in the private
input**. Never commit this mapping or paste it into a public PR.

Use either:
- HALLYURA_MYSTERIES_FILE=/absolute/path/to/mysteries.json
- HALLYURA_MYSTERIES_JSON (protected build-environment variable)

The public generated object is strictly:

  {
    "slug": "figura-enmascarada",
    "title": "Una figura enmascarada",
    "teaser": "Alguien ha sido visto cerca del puerto."
  }

The private characterId is never serialized to publicMysteries.json or used
in the public URL. Teasers are included only with publish:true and only while
the target character is hidden. When you make a character public, revoke its
teaser in the private input to avoid a build error. Mystery slugs are
independent of character identity.

Optional mystery illustrations must be approved safe files at
/img/mysteries/<slug>.webp. Do not use existing hidden-character portraits
or telltale filenames. Unreferenced uploads are not copied.

If no approved teaser input is provided, the public build contains no mystery
cards. The usual character directory displays a "Figuras misteriosas"
section only when there is at least one approved teaser.

## Commands

- npm run build:public
- npm run test:public-build
- npm test
- npm run typecheck

DO NOT use the regular npm run build for a public Cloudflare deployment:
that command remains the full development/DM build, containing all characters
and source data. Once build:public is verified in CI, consider requiring it
as the sole production build and disabling generic deploy scripts.

## What to do when a leak check fails

The builder prints the generated asset and number of restricted terms
detected, without printing private values to CI logs. Review the corresponding public MDX/TSX or data record, and either:
- Remove the spoiler or move the content to a private DM-only source.
- Publish the character intentionally if it is no longer secret.
- Create an identity-free mystery teaser **without** linking back to the hidden
  record.

Never bypass the leak check to force a deploy.

## Future CMS integration

The CMS can manage this feature by exporting the private teaser definitions
through a protected channel (not the public Wiki JSON or repository). Its
UI should expose a deliberate "Publish teaser" switch and a preview of the
exact public object. No CMS UI integration is included in this initial PR.
