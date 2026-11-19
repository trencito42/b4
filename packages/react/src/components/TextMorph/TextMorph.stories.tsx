import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { TextMorph } from "./TextMorph.js";
import { Button } from "../Button/Button.js";

const meta: Meta<typeof TextMorph> = {
  title: "Family E — Feedback & Motion/TextMorph",
  component: TextMorph,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "First-party intelligent text morphing engine. Fluidly rearranges words, characters, and place-value digits with physical spring continuity, layout adaptation, and screen-reader accessibility.",
      },
    },
  },
  argTypes: {
    mode: {
      control: "select",
      options: ["auto", "words", "characters", "numbers"],
    },
    spring: {
      control: "select",
      options: ["travel", "snap", "settle", "gentle"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof TextMorph>;

export const Default: Story = {
  args: {
    value: "Intelligent Text Morphing",
    mode: "auto",
    spring: "travel",
  },
};

export const WordReplacement: Story = {
  render: function Render() {
    const phrases = [
      "Write report",
      "Review report",
      "Sign report",
      "Archive report",
    ];
    const [index, setIndex] = useState(0);

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "16px", alignItems: "flex-start" }}>
        <div style={{ fontSize: "24px", fontWeight: 600, minHeight: "36px" }}>
          <TextMorph value={phrases[index] ?? ""} mode="words" />
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setIndex((i) => (i + 1) % phrases.length)}
        >
          Next status
        </Button>
      </div>
    );
  },
};

export const WordReordering: Story = {
  render: function Render() {
    const [swapped, setSwapped] = useState(false);

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "16px", alignItems: "flex-start" }}>
        <div style={{ fontSize: "28px", fontWeight: 600 }}>
          <TextMorph value={swapped ? "dog and cat" : "cat and dog"} mode="words" />
        </div>
        <Button variant="secondary" size="sm" onClick={() => setSwapped((s) => !s)}>
          Swap words
        </Button>
      </div>
    );
  },
};

export const CharacterMorph: Story = {
  render: function Render() {
    const states = ["Save", "Saved", "Saving...", "Saved!"];
    const [index, setIndex] = useState(0);

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "16px", alignItems: "flex-start" }}>
        <div style={{ fontSize: "24px", fontWeight: 600 }}>
          <TextMorph value={states[index] ?? ""} mode="characters" />
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={() => setIndex((i) => (i + 1) % states.length)}
        >
          Cycle state
        </Button>
      </div>
    );
  },
};

export const NumericCounters: Story = {
  render: function Render() {
    const [count, setCount] = useState(98);

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "16px", alignItems: "flex-start" }}>
        <div style={{ fontSize: "32px", fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>
          <TextMorph value={`$${count.toLocaleString()},204`} mode="numbers" />
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <Button variant="secondary" size="sm" onClick={() => setCount((c) => c - 1)}>
            - 1
          </Button>
          <Button variant="secondary" size="sm" onClick={() => setCount((c) => c + 1)}>
            + 1
          </Button>
          <Button variant="primary" size="sm" onClick={() => setCount((c) => c + 10)}>
            + 10
          </Button>
        </div>
      </div>
    );
  },
};

export const MultilingualDiacritics: Story = {
  render: function Render() {
    const greetings = [
      "Bună dimineața!",
      "Bună ziua!",
      "Bună seara!",
      "Noapte bună!",
    ];
    const [index, setIndex] = useState(0);

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "16px", alignItems: "flex-start" }}>
        <div style={{ fontSize: "24px", fontWeight: 600 }}>
          <TextMorph value={greetings[index] ?? ""} mode="words" />
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setIndex((i) => (i + 1) % greetings.length)}
        >
          Schimbă salutul
        </Button>
      </div>
    );
  },
};
