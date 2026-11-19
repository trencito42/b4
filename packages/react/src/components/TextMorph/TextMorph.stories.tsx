import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { TextMorph } from "./TextMorph";

const meta: Meta<typeof TextMorph> = {
  title: "Family E — Feedback & Motion/TextMorph",
  component: TextMorph,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof TextMorph>;

const statuses = ["Write report", "Review report", "Sign report", "Archive report"];

export const WordReplacement: Story = {
  render: () => {
    function Demo() {
      const [index, setIndex] = useState(0);
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: 12, alignItems: "flex-start" }}>
          <span style={{ fontSize: "var(--b4-text-xl)" }}>
            <TextMorph value={statuses[index % statuses.length]!} />
          </span>
          <button onClick={() => setIndex((i) => i + 1)}>Next status</button>
        </div>
      );
    }
    return <Demo />;
  },
};

export const WordReordering: Story = {
  render: () => {
    function Demo() {
      const [swapped, setSwapped] = useState(false);
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: 12, alignItems: "flex-start" }}>
          <span style={{ fontSize: "var(--b4-text-xl)" }}>
            <TextMorph value={swapped ? "dog and cat" : "cat and dog"} />
          </span>
          <button onClick={() => setSwapped((s) => !s)}>Swap words</button>
        </div>
      );
    }
    return <Demo />;
  },
};

export const NumericCounters: Story = {
  render: () => {
    function Demo() {
      // Buttons step in $1,000 units — "+ 1"/"+ 10" read as "+1k"/"+10k"
      // on a revenue-style counter, chosen so each step changes a
      // higher-order digit (98,204 -> 99,204 -> 109,204) and exercises
      // matchByPlaceValue's "digit enters at a new place value" path.
      const STEP = 1000;
      const [value, setValue] = useState(98204);
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: 12, alignItems: "flex-start" }}>
          <span style={{ fontSize: "var(--b4-text-2xl)", fontWeight: "var(--b4-weight-semibold)" }}>
            <TextMorph value={`$${value.toLocaleString("en-US")}`} />
          </span>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => setValue((v) => v - STEP)}>- 1</button>
            <button onClick={() => setValue((v) => v + STEP)}>+ 1</button>
            <button onClick={() => setValue((v) => v + STEP * 10)}>+ 10</button>
          </div>
        </div>
      );
    }
    return <Demo />;
  },
};

const greetings = ["Bună dimineața!", "Bună ziua!", "Bună seara!"];

export const MultilingualDiacritics: Story = {
  render: () => {
    function Demo() {
      const [index, setIndex] = useState(0);
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: 12, alignItems: "flex-start" }}>
          <span style={{ fontSize: "var(--b4-text-xl)" }}>
            <TextMorph value={greetings[index % greetings.length]!} mode="characters" locale="ro" />
          </span>
          <button onClick={() => setIndex((i) => i + 1)}>Schimbă salutul</button>
        </div>
      );
    }
    return <Demo />;
  },
};
