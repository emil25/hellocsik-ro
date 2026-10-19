import { createContext, useContext, type ReactNode } from "react";

const PortalContext = createContext(false);

export function RegionalPortalProvider({ children }: { children: ReactNode }) {
  return (
    <PortalContext.Provider value={true}>{children}</PortalContext.Provider>
  );
}

export function usePortal() {
  const regional = useContext(PortalContext);
  return { regional, name: regional ? "Hello Székelyföld" : "HelloCsík" };
}
