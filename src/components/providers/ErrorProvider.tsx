import React, { createContext, useContext } from 'react';

interface ErrorRepository {
  error: Error | null;
  setError: (arg0: Error) => void;
}

export const ErrorContext = createContext<ErrorRepository>({
  error: null,
  setError: (_) => {},
});

export const ErrorProvider = (props: any) => {
  const [error, setError] = React.useState<Error | null>(null);
  console.log('ErrorProvider');

  return (
    <ErrorContext.Provider value={{ error, setError }}>
      {props.children}
    </ErrorContext.Provider>
  );
};

const useError = () => useContext(ErrorContext);

export default useError;
