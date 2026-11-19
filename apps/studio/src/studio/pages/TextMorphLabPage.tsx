import { useState } from "react";
import { Badge, Button, Card, TextMorph } from "@b4/react";
import { useReducedMotion } from "@b4/motion";

const statuses = ["Write report", "Review report", "Sign report", "Archive report"];
const greetings = ["Bună dimineața!", "Bună ziua!", "Bună seara!"];

export function TextMorphLabPage() {
  const reducedMotion = useReducedMotion();

  const [statusIndex, setStatusIndex] = useState(0);
  const [swapped, setSwapped] = useState(false);
  const [counter, setCounter] = useState(98204);
  const [greetingIndex, setGreetingIndex] = useState(0);

  return (
    <div className="b4-studio-page b4-text-morph-lab">
      <div className="b4-studio-header">
        <div>
          <h1 className="b4-studio-title">Text Morphing Lab</h1>
          <p className="b4-studio-subtitle">
            Interactive test bench for TextMorph's word- and digit-level token matching, FLIP layout
            travel, and accessible live-region updates.
          </p>
        </div>
        <Badge tone={reducedMotion ? "warning" : "neutral"}>
          Reduced Motion: {reducedMotion ? "ON (instant collapse)" : "OFF (spring active)"}
        </Badge>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(420px, 1fr))", gap: 24 }}>
        <Card variant="outlined" padding="lg">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h3 style={{ margin: 0, fontSize: "var(--b4-text-lg)", fontWeight: "var(--b4-weight-semibold)" }}>
              Word Replacement & Reordering
            </h3>
            <Badge tone="neutral">matchByLcs</Badge>
          </div>
          <p style={{ color: "var(--b4-text-secondary)", fontSize: "var(--b4-text-sm)", marginBottom: 16 }}>
            Cycling a status label replaces only the changed word, while a word swap keeps the unmoved
            middle token persistent.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div>
              <div style={{ fontSize: "var(--b4-text-xs)", color: "var(--b4-text-muted)", marginBottom: 8 }}>
                Word Replacement
              </div>
              <div style={{ fontSize: "var(--b4-text-xl)", marginBottom: 8 }}>
                <TextMorph value={statuses[statusIndex % statuses.length]!} />
              </div>
              <Button size="sm" variant="secondary" onClick={() => setStatusIndex((i) => i + 1)}>
                Next status
              </Button>
            </div>

            <div>
              <div style={{ fontSize: "var(--b4-text-xs)", color: "var(--b4-text-muted)", marginBottom: 8 }}>
                Word Reordering
              </div>
              <div style={{ fontSize: "var(--b4-text-xl)", marginBottom: 8 }}>
                <TextMorph value={swapped ? "dog and cat" : "cat and dog"} />
              </div>
              <Button size="sm" variant="secondary" onClick={() => setSwapped((s) => !s)}>
                Swap words
              </Button>
            </div>
          </div>
        </Card>

        <Card variant="outlined" padding="lg">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h3 style={{ margin: 0, fontSize: "var(--b4-text-lg)", fontWeight: "var(--b4-weight-semibold)" }}>
              Numeric Counters
            </h3>
            <Badge tone="neutral">matchByPlaceValue</Badge>
          </div>
          <p style={{ color: "var(--b4-text-secondary)", fontSize: "var(--b4-text-sm)", marginBottom: 16 }}>
            Only the digits that actually change animate, place-value aligned from the ones place.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div
              style={{
                fontSize: "var(--b4-text-2xl)",
                fontWeight: "var(--b4-weight-semibold)",
                fontFamily: "var(--b4-font-mono)",
              }}
            >
              <TextMorph value={`$${counter.toLocaleString("en-US")}`} />
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <Button size="sm" variant="secondary" onClick={() => setCounter((v) => v - 1000)}>
                - 1
              </Button>
              <Button size="sm" variant="secondary" onClick={() => setCounter((v) => v + 1000)}>
                + 1
              </Button>
              <Button size="sm" variant="secondary" onClick={() => setCounter((v) => v + 10000)}>
                + 10
              </Button>
            </div>
          </div>
        </Card>

        <Card variant="outlined" padding="lg">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h3 style={{ margin: 0, fontSize: "var(--b4-text-lg)", fontWeight: "var(--b4-weight-semibold)" }}>
              Multilingual Diacritics
            </h3>
            <Badge tone="neutral">Intl.Segmenter</Badge>
          </div>
          <p style={{ color: "var(--b4-text-secondary)", fontSize: "var(--b4-text-sm)", marginBottom: 16 }}>
            Character-level morphing keeps Romanian precomposed diacritics as single grapheme clusters.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ fontSize: "var(--b4-text-xl)" }}>
              <TextMorph value={greetings[greetingIndex % greetings.length]!} mode="characters" locale="ro" />
            </div>
            <Button size="sm" variant="secondary" onClick={() => setGreetingIndex((i) => i + 1)}>
              Schimbă salutul
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
