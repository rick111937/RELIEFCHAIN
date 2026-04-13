import { createContext, useContext, useState } from 'react';
const AppContext = createContext(null);
export function AppProvider({ children }) {
  const [loading, setLoading] = useState(false);
  return <AppContext.Provider value={{ loading, setLoading }}>{children}</AppContext.Provider>;
}
export const useAppContext = () => useContext(AppContext);
