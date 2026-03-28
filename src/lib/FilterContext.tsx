import React, { createContext, useContext, useState, ReactNode } from 'react';

interface FilterContextType {
  filterWord: string;
  setFilterWord: (word: string) => void;
}

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export const FilterProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [filterWord, setFilterWord] = useState('');

  return (
    <FilterContext.Provider value={{ filterWord, setFilterWord }}>
      {children}
    </FilterContext.Provider>
  );
};

export const useFilter = (): FilterContextType => {
  const context = useContext(FilterContext);
  if (context === undefined) {
    throw new Error('useFilter must be used within a FilterProvider');
  }
  return context;
};
