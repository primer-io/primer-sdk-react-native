import React, { useEffect, useState } from 'react';
import {
  Text,
  TouchableOpacity,
  View,
  Image,
} from 'react-native';
import { ActivityIndicator } from 'react-native';
import { 
  ComponentWithRedirectManager, 
  BanksComponent, 
  IssuingBank, 
  BankId, 
  BankListFilter, 
  PrimerError, 
  PrimerInvalidComponentData, 
  PrimerValidComponentData, 
  PrimerValidatingComponentData, 
  PrimerComponentDataValidationError, 
  RedirectManagerProps 
} from '@primer-io/react-native';
import TextField from '../components/TextField';

const componentWithRedirectManager = new ComponentWithRedirectManager();
let banksComponent: BanksComponent;

const HeadlessCheckoutWithRedirect = (props: any) => {
  //@ts-ignore
  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState<string | null>('');
  const [banks, setBanks] = useState<any>([]);
  const [search, setSearch] = useState<any>('');

  useEffect(() => {
    (async () => {
      const redirectManagerProps: RedirectManagerProps = {
        paymentMethodType: props.route.params.paymentMethodType,
        onRetrieved: (data: IssuingBank[]) => {
          const log = `\nonRetrieved: ${JSON.stringify(data)}\n`;
          console.log(log);
          setBanks(data as IssuingBank[]);
          setIsLoading(false);
        },
        onRetrieving: () => {
          const log = `\nonRetrieving\n`;
          console.log(log);
          setIsLoading(true);
        },
        onError: (error: PrimerError) => {
          const log = `\nonError: ${JSON.stringify(error)}\n`;
          console.log(log);
        },
        onInvalid: (data: PrimerInvalidComponentData<BankId | BankListFilter>) => {
          const log = `\nonInvalid: ${JSON.stringify(data)}\n`;
          console.log(log);
          setIsLoading(false);
          setIsValidating(null);
        },
        onValid: (data: PrimerValidComponentData<BankId | BankListFilter>) => {
          const log = `\nonValid: ${JSON.stringify(data)}\n`;
          console.log(log);
          setIsLoading(false);
          setIsValidating(null);
          if (data?.data?.id) {
            submit()
          }
        },
        onValidating: (data: PrimerValidatingComponentData<BankId | BankListFilter>) => {
          const log = `\onValidating: ${JSON.stringify(data)}\n`;
          console.log(log);
        },
        onValidationError: (data: PrimerComponentDataValidationError<BankId | BankListFilter>) => {
          const log = `\nonValidationError: ${JSON.stringify(data)}\n`;
          console.log(log);
          setIsLoading(false);
          setIsValidating(null);
        },
      };

      banksComponent = await componentWithRedirectManager.provide(redirectManagerProps);
      banksComponent?.start();
    })()
  }, []);

  const submit = async () => {
    try {
      await banksComponent.submit();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <View
      style={{
        paddingHorizontal: 5,
        flex: 1,
        backgroundColor: 'white',
      }}>
      <Search
        search={search}
        onSearch={async (value: string) => {
          setSearch(value);

          try {
            await banksComponent.onBankFilterChange(value);
          } catch (err) {
            console.error(err);
          }
        }}
      />
      <Banks
        banks={banks}
        isValidating={isValidating}
        onPay={async (id: string) => {
          try {
            setIsValidating(id);
            await banksComponent.onBankSelected(id);
          } catch (err) {
            setIsValidating(null);
            console.error(err);
          }
        }}
      />
      <Loader isLoading={isLoading} />
    </View>
  );
};

const Search = ({ search, onSearch }: any) => {
  return (
    <TextField
      title="Choose your bank"
      textInputStyle={{
        backgroundColor: '#f5f5f5',
        borderColor: '#f5f5f5',
        paddingHorizontal: 10,
      }}
      style={{
        padding: 5,
        marginVertical: 10,
        borderRadius: 5,
        marginHorizontal: 5,
      }}
      placeholder="Search Banks"
      value={search}
      onChangeText={(value) => {
        onSearch(value);
      }}
    />
  );
}

const Loader = ({ isLoading }: {
  isLoading: boolean
}) => {
  if (!isLoading) return null;

  return (
    <View
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(200, 200, 200, 0.5)',
        zIndex: 1000,
      }}>
      <ActivityIndicator size="small" />
    </View>
  );
}

const Banks = ({ banks, isValidating, onPay }: {
  banks: IssuingBank[];
  isValidating: string | null;
  onPay: (id: string) => void;
}) => {
  if (!banks.length) return null;

  return <>{banks.map((bank: IssuingBank) =>
    <Bank key={bank.id} item={bank} isValidating={isValidating} onPay={onPay} />
  )}</>
}

const Bank = ({ item, isValidating, onPay }: {
  item: IssuingBank;
  isValidating: string | null;
  onPay: (id: string) => void;
}) => {
  return (
    <TouchableOpacity
      key={item.id}
      testID={`button-${item.name
        .toLowerCase()
        .replace(' ', '-')}`}
      disabled={!!isValidating}
      onPress={() => {
        onPay(item.id);
      }}
      style={{
        flexDirection: 'row',
        padding: 10,
        backgroundColor: 'white',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderColor: '#f5f5f5',
        opacity: isValidating && isValidating !== item.id ? 0.8 : 1,
      }}>
      <Image source={{ uri: item.iconUrl ?? item.iconUrlStr }} style={{ width: 30, height: 30 }} />

      <Text style={{ paddingLeft: 10 }}>{item.name}</Text>

      {item.id === isValidating && (
        <ActivityIndicator
          style={{ position: 'absolute', right: 10 }}
          size="small"
        />
      )}
    </TouchableOpacity>
  );
}

export default HeadlessCheckoutWithRedirect;
