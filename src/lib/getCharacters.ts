export type CharacterPick = {
  position: number;
  value: string;
};

export function getCharacters(
  str: string,
  positions: number[],
): CharacterPick[] {
  return positions.map((pos) => {
    const index = pos - 1;
    return { position: pos, value: str[index] || "-" };
  });
}

export function expandPositionTokens(raw: string): number[] {
  const out: number[] = [];
  const withCollapsedRanges = raw.replace(/(\d+)\s*-\s*(\d+)/g, "$1-$2");
  const segments = withCollapsedRanges.split(/[\s,;]+/u);
  for (const segment of segments) {
    const part = segment.trim();
    if (!part) continue;

    const rangeMatch = /^(\d+)\s*-\s*(\d+)$/.exec(part);
    if (rangeMatch) {
      let start = Number.parseInt(rangeMatch[1], 10);
      let end = Number.parseInt(rangeMatch[2], 10);
      if (Number.isNaN(start) || Number.isNaN(end) || start <= 0 || end <= 0) {
        continue;
      }
      if (start > end) {
        [start, end] = [end, start];
      }
      for (let i = start; i <= end; i++) out.push(i);
      continue;
    }

    const n = Number.parseInt(part, 10);
    if (!Number.isNaN(n) && n > 0) out.push(n);
  }
  return out;
}
