import { useMemo, useState } from "react";
import { expandPositionTokens, getCharacters } from "../lib/getCharacters";
import styles from "./CharacterPicker.module.css";

export default function CharacterPicker() {
  const [input, setInput] = useState("");
  const [positionsRaw, setPositionsRaw] = useState("");
  const [copied, setCopied] = useState(false);

  const { positions, positionSet, hasPositionsInput, parsedOk } =
    useMemo(() => {
      const trimmed = positionsRaw.trim();
      const positionsExpanded = expandPositionTokens(positionsRaw);
      const positionSet = new Set(positionsExpanded);
      return {
        positions: positionsExpanded,
        positionSet,
        hasPositionsInput: trimmed.length > 0,
        parsedOk: positionsExpanded.length > 0,
      };
    }, [positionsRaw]);

  const result = useMemo(
    () => getCharacters(input, positions),
    [input, positions],
  );

  async function handleCopy() {
    if (result.length === 0) {
      return;
    }
    const text = result
      .map((r) => `Position ${r.position}: ${r.value}`)
      .join("\n");
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch {
      setCopied(false);
    }
  }

  const showPositionError = hasPositionsInput && !parsedOk;

  return (
    <div className={styles.wrap}>
      <div className={styles.fieldGroup}>
        <label className={styles.label} htmlFor="string-input">
          String
        </label>
        <input
          id="string-input"
          className={styles.field}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          autoComplete="off"
        />
      </div>

      <div className={styles.fieldGroup}>
        <label className={styles.label} htmlFor="positions-input">
          Positions
        </label>
        <input
          id="positions-input"
          className={styles.field}
          type="text"
          placeholder="4 12 13"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          value={positionsRaw}
          onChange={(e) => setPositionsRaw(e.target.value)}
          autoComplete="off"
        />
        <p className={styles.hint}>
          Separate with spaces, commas, or newlines. Ranges: 1-5
        </p>
        {showPositionError ? (
          <p className={styles.error} role="alert">
            Enter at least one valid position
          </p>
        ) : null}
      </div>

      <div className={styles.previewBox}>
        <div className={styles.previewLabel}>String (highlighted)</div>
        <div className={styles.previewString} aria-live="polite">
          {input.length === 0 ? (
            <span style={{ color: "#94a3b8" }}>Type a string to preview</span>
          ) : (
            [...input].map((ch, i) => {
              const oneBased = i + 1;
              const active = positionSet.has(oneBased);
              return (
                <span
                  key={`${i}-${ch}`}
                  className={`${styles.char} ${active ? styles.charActive : ""}`}
                  title={`Position ${oneBased}`}
                >
                  {ch}
                </span>
              );
            })
          )}
        </div>
      </div>

      <div className={styles.resultsHeader}>
        <h2 className={styles.resultsTitle}>Results</h2>
        <button
          type="button"
          className={`${styles.copyBtn} ${copied ? styles.copied : ""}`}
          onClick={handleCopy}
          disabled={result.length === 0}
        >
          {copied ? "Copied" : "Copy results"}
        </button>
      </div>

      {result.length === 0 ? (
        <p className={styles.emptyState}>
          {parsedOk
            ? "Add positions above to see characters"
            : "Enter one or more positions to see results."}
        </p>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Position</th>
                <th>Character</th>
              </tr>
            </thead>
            <tbody>
              {result.map((item) => (
                <tr key={item.position}>
                  <td className={styles.mono}>{item.position}</td>
                  <td className={styles.mono}>
                    {item.value === " " ? (
                      <span style={{ opacity: 0.5 }}>␠</span>
                    ) : (
                      item.value
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
