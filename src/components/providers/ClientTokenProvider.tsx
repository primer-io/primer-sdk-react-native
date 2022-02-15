import React, { createContext, useContext } from 'react';

interface DecodedClientToken {
  accessToken: string;
}

interface IClientTokenRepository {
  getDecodedClientToken: () => DecodedClientToken | null;
  setDecodedClientToken: (clientToken: DecodedClientToken) => void;
}

class ClientTokenRepository implements IClientTokenRepository {
  decodedClientToken: DecodedClientToken | null = null;

  getDecodedClientToken() {
    return this.decodedClientToken;
  }

  setDecodedClientToken(decodedClientToken: DecodedClientToken) {
    this.decodedClientToken = decodedClientToken;
  }
}

const ClientTokenContext = createContext<IClientTokenRepository>({
  getDecodedClientToken: () => null,
  setDecodedClientToken: (_) => {},
});

export const ClientTokenProvider = (props: any) => {
  const repository = new ClientTokenRepository();

  return (
    <ClientTokenContext.Provider value={repository}>
      {props.children}
    </ClientTokenContext.Provider>
  );
};

const useClientToken = () => useContext(ClientTokenContext);

export default useClientToken;
