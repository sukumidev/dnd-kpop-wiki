// Minimal PDF with numbered pages and optional vector illustration shapes.
export function pdfFixture(pageCount: number, landscape = false, illustrated = false): Buffer {
  const pageIds = Array.from({length: pageCount}, (_, index) => 3 + index * 2);
  const fontId = 3 + pageCount * 2;
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    `<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(" ")}] /Count ${pageCount} >>`,
  ];
  for (let index = 0; index < pageCount; index++) {
    const stream = `BT /F1 24 Tf 72 ${landscape ? 520 : 720} Td (Page ${index + 1}) Tj ET\n` +
      (illustrated ? "0.25 0.36 0.68 rg 72 220 300 170 re f\n0.75 0.5 0.3 rg 160 270 120 90 re f\n" : "");
    objects.push(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${landscape ? 842 : 595} ${landscape ? 595 : 842}] /Resources << /Font << /F1 ${fontId} 0 R >> >> /Contents ${pageIds[index] + 1} 0 R >>`);
    objects.push(`<< /Length ${Buffer.byteLength(stream)} >>\nstream\n${stream}endstream`);
  }
  objects.push("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>");
  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  objects.forEach((object, index) => { offsets.push(Buffer.byteLength(pdf)); pdf += `${index + 1} 0 obj\n${object}\nendobj\n`; });
  const xref = Buffer.byteLength(pdf);
  pdf += `xref\n0 ${offsets.length}\n0000000000 65535 f \n`;
  for (const offset of offsets.slice(1)) pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
  pdf += `trailer\n<< /Size ${offsets.length} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  return Buffer.from(pdf);
}
