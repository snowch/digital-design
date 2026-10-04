import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { App } from "./App";
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
