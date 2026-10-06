// Copyright © 2026 Christopher Snow

import { createContext, useContext } from "react";

import { DEFAULT_STRINGS, type Strings } from "./strings";

export const StringsContext = createContext<Strings>(DEFAULT_STRINGS);

export function useStrings(): Strings {
  return useContext(StringsContext);
}
