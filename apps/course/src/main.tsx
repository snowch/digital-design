// Copyright © 2026 Chris Snow

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { App } from "./App";
import "@fontsource-variable/source-sans-3";
import "@fontsource-variable/archivo/wdth.css";
import "@fontsource-variable/jetbrains-mono";
import "katex/dist/katex.min.css";
import "./styles/tokens.css";
import "./styles/app.css";
import "./styles/course.css";

const root = document.getElementById("root");
if (!root) throw new Error("index.html has no #root element");
createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
