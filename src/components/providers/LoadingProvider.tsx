import React from 'react';

interface LoadingRepository {
  loading: boolean;
  setLoading: (arg0: boolean) => void;
}

export const LoadingContext = React.createContext<LoadingRepository>({
  loading: false,
  setLoading: (_) => {},
});

export const LoadingProvider = (props: any) => {
  const [loading, setLoading] = React.useState<boolean>(false);

  console.log('LoadingProvider');

  return (
    <LoadingContext.Provider value={{ loading, setLoading }}>
      {props.children}
    </LoadingContext.Provider>
  );
};

const useLoading = () => React.useContext(LoadingContext);

export default useLoading;
