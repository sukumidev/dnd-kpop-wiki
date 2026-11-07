// The public staging pipeline filters hidden characters out of characters.json.
// Docusaurus redirects must not target routes for those omitted characters.
export function filterPublicRedirects<T extends {to: string}>(
  redirects: T[],
  isPublicBuild: boolean,
  allowedCharacterIds: ReadonlySet<string>,
): T[] {
  if (!isPublicBuild) return redirects;
  return redirects.filter(({to}) => {
    const characterRoute = /^\/characters\/(?:npc|party|pet)\/([^/?#]+)\/?$/.exec(to);
    return !characterRoute || allowedCharacterIds.has(characterRoute[1]);
  });
}
