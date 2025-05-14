import React, {useEffect, useState} from 'react';
import {FlatList, Text, TouchableOpacity, View} from 'react-native';
import {ActivityIndicator} from 'react-native';
import {RawDataManager, RetailerData} from '@primer-io/react-native';
import {styles} from '../styles';

const rawDataManager = new RawDataManager();

const RawRetailOutletScreen = (props: any) => {
  //@ts-ignore
  const [isLoading] = useState(false);
  const [isCardFormValid, setIsCardFormValid] = useState(false);
  //@ts-ignore
  const [, setRequiredInputElementTypes] = useState<string[] | undefined>(
    undefined,
  );
  const [retailers, setRetailers] = useState<any[] | undefined>(undefined);
  const [selectedRetailOutletId, setSelectedRetailOutletId] = useState<
    string | undefined
  >(undefined);
  const [metadataLog, setMetadataLog] = useState<string>('');
  const [validationLog, setValidationLog] = useState<string>('');

  /* eslint-disable react-hooks/exhaustive-deps */
  useEffect(() => {
    initialize();
  }, []);
  /* eslint-enable react-hooks/exhaustive-deps */

  const initialize = async () => {
    const response = await rawDataManager.configure({
      paymentMethodType: props.route.params.paymentMethodType,
      //@ts-ignore
      onMetadataChange: data => {
        const log = `\nonMetadataChange: ${JSON.stringify(data)}\n`;
        console.log(log);
        setMetadataLog(log);
      },
      //@ts-ignore
      onValidation: (isVallid, errors) => {
        let log = `\nonValidation:\nisValid: ${isVallid}\n`;

        if (errors) {
          log += `errors:${JSON.stringify(errors, null, 2)}\n`;
        }

        console.log(log);
        setValidationLog(log);
        setIsCardFormValid(isVallid);
      },
    });

    if (response?.initializationData) {
      //@ts-ignore
      const currentRetailers: any[] = response.initializationData.result;
      setRetailers(currentRetailers);
    }

    setRequiredInputElementTypes(
      await rawDataManager.getRequiredInputElementTypes(),
    );
  };

  const setRawData = (tmpRetailOutletId: string) => {
    let rawData: RetailerData = {
      id: tmpRetailOutletId,
    };

    setSelectedRetailOutletId(tmpRetailOutletId);

    rawDataManager.setRawData(rawData);
  };

  const renderInputs = () => {
    if (!retailers) {
      return null;
    } else {
      return (
        <FlatList
          style={{flex: 1}}
          data={retailers}
          keyExtractor={item => item.id}
          renderItem={data => {
            return (
              <TouchableOpacity
                style={{marginVertical: 8}}
                onPress={() => {
                  setRawData(data.item.id);
                }}>
                <Text
                  style={{
                    ...styles.heading3,
                    color:
                      data.item.id === selectedRetailOutletId
                        ? 'blue'
                        : 'black',
                  }}>
                  {data.item.name}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      );
    }
  };

  const pay = async () => {
    try {
      await rawDataManager.submit();
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

  const renderPayButton = () => {
    return (
      <TouchableOpacity
        style={{
          ...styles.button,
          marginVertical: 16,
          backgroundColor: isCardFormValid ? 'black' : 'lightgray',
        }}
        onPress={() => {
          if (isCardFormValid) {
            pay();
          }
        }}>
        <Text style={{...styles.buttonText, color: 'white'}}>Pay</Text>
      </TouchableOpacity>
    );
  };

  const renderEvents = () => {
    return (
      <View>
        <View style={{backgroundColor: 'lightgray'}}>
          <Text style={{height: 50}} testID="headless-metadata-event">
            {metadataLog}
          </Text>
        </View>
        <View style={{backgroundColor: 'lightgray', marginTop: 16}}>
          <Text testID="headless-validation-event">{validationLog}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={{paddingHorizontal: 24, flex: 1}}>
      {renderInputs()}
      {renderPayButton()}
      {renderEvents()}
      {renderLoadingOverlay()}
    </View>
  );
};

export default RawRetailOutletScreen;
