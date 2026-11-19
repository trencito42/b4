import { useState, useEffect, useRef } from "react";
import {
  TextMorph,
  Button,
  Card,
  Badge,
  SegmentedControl,
} from "@b4/react";
import { useReducedMotion, type SpringToken } from "@b4/motion";

export function TextMorphLabPage() {
  const reducedMotion = useReducedMotion();
  const [selectedSpring, setSelectedSpring] = useState<SpringToken>("travel");

  // 1. Word Replacement State
  const wordPhrases = [
    "Write report for engineering",
    "Review report for compliance",
    "Sign report with certificate",
    "Archive report to cold storage",
  ];
  const [wordIndex, setWordIndex] = useState(0);

  // 2. Word Reordering State
  const orderPairs = [
    "cat and dog",
    "dog and cat",
    "fast, reliable, and secure",
    "secure, fast, and reliable",
    "the big the small",
    "small the big the",
  ];
  const [orderIndex, setOrderIndex] = useState(0);

  // 3. Character Changes State
  const charStates = [
    "Save",
    "Saved",
    "Saving...",
    "Update",
    "Updating...",
    "Updated!",
  ];
  const [charIndex, setCharIndex] = useState(0);

  // 4. Numeric Morphing State
  const [numericValue, setNumericValue] = useState(99);
  const [currencyValue, setCurrencyValue] = useState(1204.5);
  const [percentValue, setPercentValue] = useState(45.2);

  // 5. Loading to Success State
  const deployPhases = [
    "Ready to deploy",
    "Building container image...",
    "Deploying changes across edge...",
    "Deployed successfully to 24 regions ✨",
  ];
  const [deployIndex, setDeployIndex] = useState(0);

  // 6. Multilingual, Diacritics & Emoji State
  const internationalPhrases = [
    "Bună dimineața! 🇷🇴",
    "Bună ziua! 🇷🇴",
    "Bună seara! 🇷🇴",
    "مرحبا بك في منصة B4 🇸🇦",
    "שלום וברוכים הבאים 🇮🇱",
    "👨‍👩‍👧‍👦 Family trip planned 🚀",
  ];
  const [intlIndex, setIntlIndex] = useState(0);

  // 7. Long Text & Multiline State
  const multilineOptions = [
    "Latency decreased by 42% across all European edge clusters following the global cache warming rollout.",
    "Throughput reached 1.2M requests/sec with 0 errors reported during high-traffic peak hours.",
  ];
  const [multilineIndex, setMultilineIndex] = useState(0);

  // 8. Rapid Ticker / Interruption Stress Test
  const [tickerCount, setTickerCount] = useState(100);
  const [isTickerRunning, setIsTickerRunning] = useState(false);
  const tickerIntervalRef = useRef<any>(null);

  useEffect(() => {
    if (isTickerRunning) {
      tickerIntervalRef.current = setInterval(() => {
        setTickerCount((c) => c + Math.floor(Math.random() * 5) + 1);
      }, 350);
    } else if (tickerIntervalRef.current) {
      clearInterval(tickerIntervalRef.current);
    }
    return () => {
      if (tickerIntervalRef.current) clearInterval(tickerIntervalRef.current);
    };
  }, [isTickerRunning]);

  return (
    <div className="b4-studio-page b4-text-morph-lab">
      <div className="b4-studio-header">
        <div>
          <h1 className="b4-studio-title">Text Morphing Lab</h1>
          <p className="b4-studio-subtitle">
            First-party intelligent text morphing engine with word rearrangement, digit place-value
            continuity, Unicode grapheme segmentation, and spatial spring physics.
          </p>
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <Badge tone={reducedMotion ? "warning" : "neutral"}>
            Reduced Motion: {reducedMotion ? "ON (Instant)" : "OFF (Spring)"}
          </Badge>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: "var(--b4-text-xs)", color: "var(--b4-text-secondary)" }}>
              Spring Preset:
            </span>
            <SegmentedControl<SpringToken>
              aria-label="Spring preset"
              size="sm"
              value={selectedSpring}
              onValueChange={(val) => setSelectedSpring(val)}
              items={[
                { value: "travel", label: "Travel" },
                { value: "snap", label: "Snap" },
                { value: "settle", label: "Settle" },
                { value: "gentle", label: "Gentle" },
              ]}
            />
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(420px, 1fr))", gap: 24 }}>
        {/* Card 1: Word Replacement & Reordering */}
        <Card variant="outlined" padding="lg">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <h3 style={{ margin: 0, fontSize: "var(--b4-text-lg)", fontWeight: "var(--b4-weight-semibold)" }}>
              Word Replacement & Reordering
            </h3>
            <Badge tone="neutral">mode="words"</Badge>
          </div>
          <p style={{ color: "var(--b4-text-secondary)", fontSize: "var(--b4-text-sm)", marginBottom: 16 }}>
            Preserves common prefixes/suffixes and glides rearranged words across the layout using
            distance-affinity bipartite matching.
          </p>

          <div
            style={{
              padding: "20px 24px",
              background: "var(--b4-surface-raised)",
              borderRadius: "var(--b4-radius-md)",
              border: "1px solid var(--b4-border-subtle)",
              minHeight: 80,
              display: "flex",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <div style={{ fontSize: "var(--b4-text-xl)", fontWeight: "var(--b4-weight-semibold)" }}>
              <TextMorph
                value={wordPhrases[wordIndex] ?? ""}
                mode="words"
                spring={selectedSpring}
              />
            </div>
          </div>

          <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setWordIndex((i) => (i + 1) % wordPhrases.length)}
            >
              Next Phrase
            </Button>
          </div>

          <div
            style={{
              padding: "16px 20px",
              background: "var(--b4-surface-raised)",
              borderRadius: "var(--b4-radius-md)",
              border: "1px solid var(--b4-border-subtle)",
              minHeight: 64,
              display: "flex",
              alignItems: "center",
              marginBottom: 12,
            }}
          >
            <div style={{ fontSize: "var(--b4-text-lg)", fontWeight: "var(--b4-weight-medium)" }}>
              <TextMorph
                value={orderPairs[orderIndex] ?? ""}
                mode="words"
                spring={selectedSpring}
              />
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setOrderIndex((i) => (i + 1) % orderPairs.length)}
          >
            Rearrange Tokens
          </Button>
        </Card>

        {/* Card 2: Numeric Counters & Digit Place-Value */}
        <Card variant="outlined" padding="lg">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <h3 style={{ margin: 0, fontSize: "var(--b4-text-lg)", fontWeight: "var(--b4-weight-semibold)" }}>
              Numeric Morphing & Place-Value
            </h3>
            <Badge tone="neutral">mode="numbers"</Badge>
          </div>
          <p style={{ color: "var(--b4-text-secondary)", fontSize: "var(--b4-text-sm)", marginBottom: 16 }}>
            Matches digits by their 10ⁿ decimal place value (units, tens, hundreds). 99 → 100 transforms
            in-place without chaotic jumping.
          </p>

          <div
            style={{
              padding: "20px 24px",
              background: "var(--b4-surface-raised)",
              borderRadius: "var(--b4-radius-md)",
              border: "1px solid var(--b4-border-subtle)",
              marginBottom: 16,
            }}
          >
            <div style={{ fontSize: "36px", fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>
              <TextMorph
                value={numericValue}
                mode="numbers"
                spring={selectedSpring}
              />
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              <Button variant="secondary" size="sm" onClick={() => setNumericValue((v) => v - 1)}>
                - 1
              </Button>
              <Button variant="secondary" size="sm" onClick={() => setNumericValue((v) => v + 1)}>
                + 1
              </Button>
              <Button variant="secondary" size="sm" onClick={() => setNumericValue(99)}>
                Set 99
              </Button>
              <Button variant="primary" size="sm" onClick={() => setNumericValue(100)}>
                Set 100
              </Button>
            </div>
          </div>

          <div
            style={{
              padding: "16px 20px",
              background: "var(--b4-surface-raised)",
              borderRadius: "var(--b4-radius-md)",
              border: "1px solid var(--b4-border-subtle)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <div style={{ fontSize: "var(--b4-text-xs)", color: "var(--b4-text-secondary)", marginBottom: 4 }}>
                Currency & Decimal Fractions
              </div>
              <div style={{ fontSize: "var(--b4-text-2xl)", fontWeight: 700 }}>
                <TextMorph
                  value={`$${currencyValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                  mode="numbers"
                  spring={selectedSpring}
                />
              </div>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <Button variant="secondary" size="sm" onClick={() => setCurrencyValue(1204.5)}>
                $1,204.50
              </Button>
              <Button variant="secondary" size="sm" onClick={() => setCurrencyValue(1318.75)}>
                $1,318.75
              </Button>
            </div>
          </div>
        </Card>

        {/* Card 3: Button Label & Asynchronous States */}
        <Card variant="outlined" padding="lg">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <h3 style={{ margin: 0, fontSize: "var(--b4-text-lg)", fontWeight: "var(--b4-weight-semibold)" }}>
              Character Morphing & State Actions
            </h3>
            <Badge tone="neutral">mode="characters"</Badge>
          </div>
          <p style={{ color: "var(--b4-text-secondary)", fontSize: "var(--b4-text-sm)", marginBottom: 16 }}>
            Fluid character-level transformations for button labels and micro-status changes.
          </p>

          <div
            style={{
              padding: "24px",
              background: "var(--b4-surface-raised)",
              borderRadius: "var(--b4-radius-md)",
              border: "1px solid var(--b4-border-subtle)",
              display: "flex",
              flexDirection: "column",
              gap: 16,
              alignItems: "flex-start",
              marginBottom: 16,
            }}
          >
            <Button
              variant="primary"
              size="lg"
              onClick={() => setCharIndex((i) => (i + 1) % charStates.length)}
            >
              <TextMorph value={charStates[charIndex] ?? ""} mode="characters" spring={selectedSpring} />
            </Button>
            <span style={{ fontSize: "var(--b4-text-xs)", color: "var(--b4-text-secondary)" }}>
              Click button to cycle state: {charStates[charIndex]}
            </span>
          </div>

          <div
            style={{
              padding: "16px 20px",
              background: "var(--b4-surface-raised)",
              borderRadius: "var(--b4-radius-md)",
              border: "1px solid var(--b4-border-subtle)",
            }}
          >
            <div style={{ fontSize: "var(--b4-text-xs)", color: "var(--b4-text-secondary)", marginBottom: 8 }}>
              Multi-Phase Deployment Pipeline
            </div>
            <div style={{ fontSize: "var(--b4-text-base)", fontWeight: 600, minHeight: 28 }}>
              <TextMorph value={deployPhases[deployIndex] ?? ""} mode="auto" spring={selectedSpring} />
            </div>
            <div style={{ marginTop: 12 }}>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setDeployIndex((i) => (i + 1) % deployPhases.length)}
              >
                Advance Deployment
              </Button>
            </div>
          </div>
        </Card>

        {/* Card 4: Internationalization, Diacritics, Emoji & RTL */}
        <Card variant="outlined" padding="lg">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <h3 style={{ margin: 0, fontSize: "var(--b4-text-lg)", fontWeight: "var(--b4-weight-semibold)" }}>
              Unicode, Emojis, Diacritics & RTL
            </h3>
            <Badge tone="neutral">Intl.Segmenter</Badge>
          </div>
          <p style={{ color: "var(--b4-text-secondary)", fontSize: "var(--b4-text-sm)", marginBottom: 16 }}>
            Handles complex emoji sequences, diacritics (ș, ț, ă, î), and right-to-left Arabic/Hebrew
            phrases cleanly without character splitting errors.
          </p>

          <div
            style={{
              padding: "20px 24px",
              background: "var(--b4-surface-raised)",
              borderRadius: "var(--b4-radius-md)",
              border: "1px solid var(--b4-border-subtle)",
              minHeight: 70,
              display: "flex",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <div style={{ fontSize: "var(--b4-text-xl)", fontWeight: 600 }}>
              <TextMorph
                value={internationalPhrases[intlIndex] ?? ""}
                mode="auto"
                spring={selectedSpring}
              />
            </div>
          </div>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIntlIndex((i) => (i + 1) % internationalPhrases.length)}
          >
            Next Language / Script
          </Button>
        </Card>

        {/* Card 5: Rapid Updates & Interruption Safety */}
        <Card variant="outlined" padding="lg">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <h3 style={{ margin: 0, fontSize: "var(--b4-text-lg)", fontWeight: "var(--b4-weight-semibold)" }}>
              Rapid Updates & Interruption Safety
            </h3>
            <Badge tone="neutral">Stress Test</Badge>
          </div>
          <p style={{ color: "var(--b4-text-secondary)", fontSize: "var(--b4-text-sm)", marginBottom: 16 }}>
            Tests rapid consecutive updates mid-flight. Live measurements redirect in-flight springs
            without snapping or visual artifacts.
          </p>

          <div
            style={{
              padding: "20px 24px",
              background: "var(--b4-surface-raised)",
              borderRadius: "var(--b4-radius-md)",
              border: "1px solid var(--b4-border-subtle)",
              marginBottom: 16,
            }}
          >
            <div style={{ fontSize: "var(--b4-text-xs)", color: "var(--b4-text-secondary)", marginBottom: 4 }}>
              Active Concurrent Connections
            </div>
            <div style={{ fontSize: "36px", fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>
              <TextMorph value={`#${tickerCount} req/sec`} mode="numbers" spring={selectedSpring} />
            </div>
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <Button
              variant={isTickerRunning ? "destructive" : "primary"}
              size="sm"
              onClick={() => setIsTickerRunning((r) => !r)}
            >
              {isTickerRunning ? "Stop Ticker" : "Start Rapid Ticker (350ms)"}
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setTickerCount((c) => c + 1)}
            >
              +1 Rapid Click
            </Button>
          </div>
        </Card>

        {/* Card 6: Multiline Transitions */}
        <Card variant="outlined" padding="lg">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <h3 style={{ margin: 0, fontSize: "var(--b4-text-lg)", fontWeight: "var(--b4-weight-semibold)" }}>
              Multiline & Paragraph Transitions
            </h3>
            <Badge tone="neutral">Fluid Container</Badge>
          </div>
          <p style={{ color: "var(--b4-text-secondary)", fontSize: "var(--b4-text-sm)", marginBottom: 16 }}>
            Container height and width adapt dynamically across paragraph changes without clipping.
          </p>

          <div
            style={{
              padding: "20px 24px",
              background: "var(--b4-surface-raised)",
              borderRadius: "var(--b4-radius-md)",
              border: "1px solid var(--b4-border-subtle)",
              marginBottom: 16,
              minHeight: 100,
            }}
          >
            <p style={{ margin: 0, lineHeight: 1.6, fontSize: "var(--b4-text-sm)" }}>
              <TextMorph
                value={multilineOptions[multilineIndex] ?? ""}
                mode="words"
                spring={selectedSpring}
              />
            </p>
          </div>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => setMultilineIndex((i) => (i + 1) % multilineOptions.length)}
          >
            Toggle Paragraph
          </Button>
        </Card>
      </div>
    </div>
  );
}
