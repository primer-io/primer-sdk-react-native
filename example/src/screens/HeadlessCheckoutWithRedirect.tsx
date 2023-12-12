import React, {useEffect, useState} from 'react';
import {
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  NativeEventEmitter,
  NativeModules,
  FlatList,
} from 'react-native';
import {ActivityIndicator} from 'react-native';
import {RedirectManager} from '@primer-io/react-native';

const redirectManager = new RedirectManager();
const eventEmitter = new NativeEventEmitter(
  NativeModules.RNTPrimerHeadlessUniversalCheckoutComponentWithRedirectManager,
);

interface IBank {
  id: string;
  name: string;
  iconUrl: string;
}

const HeadlessCheckoutWithRedirect = (props: any) => {
  //@ts-ignore
  const [isLoading, setIsLoading] = useState(false);
  const [banks, setBanks] = useState<any>('');

  useEffect(() => {
    initialize();
  }, []);

  useEffect(() => {
    let eventListener = eventEmitter.addListener('onRetrieved', setBanks);
    let validListener = eventEmitter.addListener('onInvalid', event => {
      console.log(event);
    });

    let errorListener = eventEmitter.addListener('onError', event => {
      console.log(event);
    });

    // Removes the listener once unmounted
    return () => {
      eventListener.remove();
      validListener.remove();
    };
  }, []);

  const initialize = async () => {
    await redirectManager.configure({
      paymentMethodType: props.route.params.paymentMethodType,
      //@ts-ignore
      onRetrieving: data => {
        const log = `\nonRetrieved: ${JSON.stringify(data)}\n`;
        console.log(log);
      },
      //@ts-ignore
      onRetrieved: data => {
        const log = `\nonRetrieved: ${JSON.stringify(data)}\n`;
        console.log(log);
      },
      //@ts-ignore
      onInvalid: data => {
        const log = `\nonInvalid: ${JSON.stringify(data)}\n`;
        console.log(log);
      },
      //@ts-ignore
      onError: data => {
        const log = `\nonError: ${JSON.stringify(data)}\n`;
        console.log(log);
      },
    });
  };

  const pay = async (id: string) => {
    try {
      await redirectManager.onBankSelected(id);
    } catch (err) {
      console.error(err);
    }
  };

  const renderLoadingOverlay = () => {
    if (!isLoading) {
      return null;
    } else {
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
  };

  const Bank = ({item}: {item: IBank}) => (
    <TouchableOpacity
      onPress={() => {
        pay(item.id);
      }}
      style={{}}>
      <Text style={{}}>{item.name}</Text>
    </TouchableOpacity>
  );

  const renderBanks = () => {
    return (
      <FlatList
        data={banks.banks}
        renderItem={({item}) => <Bank item={item} />}
        keyExtractor={item => item.id}
      />
    );
  };
  return (
    <View style={{paddingHorizontal: 24, flex: 1}}>
      {renderBanks()}
      {renderLoadingOverlay()}
    </View>
  );
};

export default HeadlessCheckoutWithRedirect;
