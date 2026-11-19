import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { QueryEditor } from "./QueryEditor";
import { tokenizeQuery } from "./queryLanguage";

describe("tokenizeQuery", () => {
  it("classifies keywords, strings, numbers, and comments", () => {
    const { tokens, diagnostic } = tokenizeQuery("select id from hosts -- note\nwhere n = 3");
    expect(diagnostic).toBeNull();
    expect(tokens.filter((token) => token.type === "keyword").map((token) => token.text)).toEqual([
      "select",
      "from",
      "where",
    ]);
    expect(tokens.some((token) => token.type === "comment" && token.text === "-- note")).toBe(true);
    expect(tokens.some((token) => token.type === "number" && token.text === "3")).toBe(true);
  });

  it("accepts escaped quotes and balanced parentheses", () => {
    const { diagnostic } = tokenizeQuery("select 'o''brien' from (select 1) t");
    expect(diagnostic).toBeNull();
  });

  it("reports an unclosed string, comment, and parenthesis", () => {
    expect(tokenizeQuery("select 'eu").diagnostic?.message).toBe("Unclosed string.");
    expect(tokenizeQuery("select 1 /* still").diagnostic?.message).toBe("Unclosed block comment.");
    expect(tokenizeQuery("select (1").diagnostic?.message).toBe("Unclosed parenthesis.");
    expect(tokenizeQuery("select 1)").diagnostic?.message).toBe("Unexpected closing parenthesis.");
  });
});

describe("QueryEditor", () => {
  it("renders an accessible textbox and paints keyword tokens", () => {
    const { container } = render(<QueryEditor aria-label="Query" defaultValue="select id from hosts" />);
    expect(screen.getByRole("textbox", { name: "Query" })).toHaveValue("select id from hosts");
    expect(container.querySelectorAll(".b4-query-editor__token--keyword")).toHaveLength(2);
    expect(container.querySelectorAll(".b4-query-editor__line-number")).toHaveLength(1);
  });

  it("updates highlighting as the user types", async () => {
    const user = userEvent.setup();
    const { container } = render(<QueryEditor aria-label="Query" />);
    await user.type(screen.getByRole("textbox", { name: "Query" }), "select 1");
    expect(container.querySelector(".b4-query-editor__token--keyword")).toHaveTextContent("select");
    expect(container.querySelector(".b4-query-editor__token--number")).toHaveTextContent("1");
  });

  it("keeps a controlled value until the parent updates it", async () => {
    const onValueChange = vi.fn();
    const user = userEvent.setup();
    render(<QueryEditor aria-label="Query" value="select 1" onValueChange={onValueChange} />);
    await user.type(screen.getByRole("textbox", { name: "Query" }), "x");
    expect(onValueChange).toHaveBeenCalledWith("select 1x");
    expect(screen.getByRole("textbox", { name: "Query" })).toHaveValue("select 1");
  });

  it("announces a real syntax diagnostic", () => {
    render(<QueryEditor aria-label="Query" defaultValue="select '" />);
    expect(screen.getByRole("alert")).toHaveTextContent("Unclosed string.");
    expect(screen.getByRole("textbox", { name: "Query" })).toHaveAttribute("aria-invalid", "true");
  });

  it("has no axe violations", async () => {
    const { container } = render(<QueryEditor aria-label="Query" defaultValue={"select id\nfrom hosts"} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
