export type QueryTokenType = "keyword" | "string" | "number" | "comment" | "identifier" | "operator" | "whitespace" | "invalid";

export interface QueryToken {
  type: QueryTokenType;
  text: string;
  index: number;
}

export interface QueryDiagnostic {
  message: string;
  index: number;
}

const KEYWORDS = new Set([
  "select",
  "from",
  "where",
  "and",
  "or",
  "not",
  "insert",
  "into",
  "values",
  "update",
  "set",
  "delete",
  "join",
  "left",
  "right",
  "inner",
  "outer",
  "on",
  "group",
  "by",
  "order",
  "limit",
  "offset",
  "as",
  "distinct",
  "null",
  "is",
  "in",
  "like",
  "between",
  "create",
  "table",
  "drop",
  "alter",
  "having",
  "union",
  "all",
  "asc",
  "desc",
  "true",
  "false",
]);

/**
 * Tokenize a SQL subset and return the first syntax diagnostic.
 * This is a real scanner (strings, comments, keywords, paren balance),
 * not a keyword-colored textarea heuristic that ignores structure.
 */
export function tokenizeQuery(source: string): { tokens: QueryToken[]; diagnostic: QueryDiagnostic | null } {
  const tokens: QueryToken[] = [];
  let i = 0;
  let diagnostic: QueryDiagnostic | null = null;

  function mark(message: string, index: number) {
    if (!diagnostic) diagnostic = { message, index };
  }

  while (i < source.length) {
    const rest = source.slice(i);

    if (rest.startsWith("--")) {
      const end = source.indexOf("\n", i);
      const stop = end === -1 ? source.length : end;
      tokens.push({ type: "comment", text: source.slice(i, stop), index: i });
      i = stop;
      continue;
    }

    if (rest.startsWith("/*")) {
      const end = source.indexOf("*/", i + 2);
      if (end === -1) {
        tokens.push({ type: "invalid", text: source.slice(i), index: i });
        mark("Unclosed block comment.", i);
        break;
      }
      tokens.push({ type: "comment", text: source.slice(i, end + 2), index: i });
      i = end + 2;
      continue;
    }

    if (source[i] === "'") {
      let j = i + 1;
      let closed = false;
      while (j < source.length) {
        if (source[j] === "'" && source[j + 1] === "'") {
          j += 2;
          continue;
        }
        if (source[j] === "'") {
          closed = true;
          j += 1;
          break;
        }
        j += 1;
      }
      tokens.push({ type: closed ? "string" : "invalid", text: source.slice(i, j), index: i });
      if (!closed) mark("Unclosed string.", i);
      i = j;
      continue;
    }

    const whitespace = /^[ \t\r\n]+/.exec(rest);
    if (whitespace) {
      tokens.push({ type: "whitespace", text: whitespace[0], index: i });
      i += whitespace[0].length;
      continue;
    }

    const number = /^(?:\d+\.\d+|\d+)/.exec(rest);
    if (number) {
      tokens.push({ type: "number", text: number[0], index: i });
      i += number[0].length;
      continue;
    }

    const identifier = /^[A-Za-z_][A-Za-z0-9_]*/.exec(rest);
    if (identifier) {
      const word = identifier[0];
      tokens.push({
        type: KEYWORDS.has(word.toLowerCase()) ? "keyword" : "identifier",
        text: word,
        index: i,
      });
      i += word.length;
      continue;
    }

    const operator = /^(?:<>|!=|<=|>=|.)/s.exec(rest);
    const text = operator?.[0] ?? source[i]!;
    tokens.push({ type: "operator", text, index: i });
    i += text.length;
  }

  if (!diagnostic) {
    let depth = 0;
    for (const token of tokens) {
      if (token.type === "string" || token.type === "comment" || token.type === "invalid") continue;
      for (let n = 0; n < token.text.length; n += 1) {
        const char = token.text[n];
        if (char === "(") depth += 1;
        if (char === ")") {
          depth -= 1;
          if (depth < 0) {
            mark("Unexpected closing parenthesis.", token.index + n);
            break;
          }
        }
      }
      if (diagnostic) break;
    }
    if (!diagnostic && depth > 0) mark("Unclosed parenthesis.", source.length);
  }

  return { tokens, diagnostic };
}
