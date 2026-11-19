import { readFileSync, writeFileSync } from "node:fs";

const regBase64 = readFileSync("packages/tokens/fonts/Graphik-Regular.woff2").toString("base64");
const medBase64 = readFileSync("packages/tokens/fonts/Graphik-Medium.woff2").toString("base64");

const css = `/* Graphik typography for B4 Design System */
@font-face {
  font-family: "Graphik";
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url("/fonts/Graphik-Regular.woff2") format("woff2"),
       url("data:font/woff2;base64,${regBase64}") format("woff2");
}

@font-face {
  font-family: "Graphik";
  font-style: normal;
  font-weight: 500;
  font-display: swap;
  src: url("/fonts/Graphik-Medium.woff2") format("woff2"),
       url("data:font/woff2;base64,${medBase64}") format("woff2");
}

@font-face {
  font-family: "Graphik";
  font-style: normal;
  font-weight: 600;
  font-display: swap;
  src: url("/fonts/Graphik-Medium.woff2") format("woff2"),
       url("data:font/woff2;base64,${medBase64}") format("woff2");
}

@font-face {
  font-family: "Graphik";
  font-style: normal;
  font-weight: 700;
  font-display: swap;
  src: url("/fonts/Graphik-Medium.woff2") format("woff2"),
       url("data:font/woff2;base64,${medBase64}") format("woff2");
}
`;

writeFileSync("packages/tokens/src/fonts.css", css);
console.log("Written fonts.css successfully.");
