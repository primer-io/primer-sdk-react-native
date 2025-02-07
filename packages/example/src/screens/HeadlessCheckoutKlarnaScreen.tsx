import React, { useEffect, useState } from 'react';
import { Text, TouchableOpacity, View, StyleSheet, Button } from 'react-native';
import {
  KlarnaManager,
  KlarnaComponent,
  KlarnaPaymentStep,
  PrimerError,
  PrimerInvalidComponentData,
  PrimerValidComponentData,
  PrimerValidatingComponentData,
  PrimerComponentDataValidationError,
  KlarnaManagerProps,
  KlarnaPaymentCategory,
  PrimerKlarnaPaymentView,
  KlarnaPaymentValidatableData,
} from '@primer-io/react-native';

const klarnaManager = new KlarnaManager();
let klarnaComponent: KlarnaComponent;

const HeadlessCheckoutKlarnaScreen = (props: any) => {
  const [isAuthorizationVisible, setAuthorizationVisible] = useState<boolean>(false);
  const [selectedPaymentCategoryIdentifier, setSelectedPaymentCategoryIdentifier] = useState<string | null>(null);
  const [paymentCategories, setPaymentCategories] = useState<KlarnaPaymentCategory[]>([]);

  /* eslint-disable react-hooks/exhaustive-deps */
  useEffect(() => {
    (async () => {
      const klarnaManagerProps: KlarnaManagerProps = {
        primerSessionIntent: props.route.params.paymentSessionIntent,
        onStep: (data: KlarnaPaymentStep) => {
          const log = `\nonStep: ${JSON.stringify(data)}\n`;
          console.log(log);
          switch (data.stepName) {
            case 'paymentSessionCreated':
              setPaymentCategories(data.paymentCategories);
              break;

            case 'paymentViewLoaded':
              setAuthorizationVisible(true);
              break;

            case 'paymentSessionAuthorized':
              if (data.isFinalized) {
                console.log('Payment finalization is not required');
              } else {
                console.log('Finalizing payment');
                finalizePayment();
              }
              break;
            case 'paymentSessionFinalized':
              break;
          }
        },
        onError: (error: PrimerError) => {
          const log = `\nonError: ${JSON.stringify(error)}\n`;
          console.log(log);
        },
        onInvalid: (data: PrimerInvalidComponentData<KlarnaPaymentValidatableData>) => {
          const log = `\nonInvalid: ${JSON.stringify(data)}\n`;
          console.log(log);
        },
        onValid: (data: PrimerValidComponentData<KlarnaPaymentValidatableData>) => {
          const log = `\nonValid: ${JSON.stringify(data)}\n`;
          console.log(log);
        },
        onValidating: (data: PrimerValidatingComponentData<KlarnaPaymentValidatableData>) => {
          const log = `\onValidating: ${JSON.stringify(data)}\n`;
          console.log(log);
        },
        onValidationError: (data: PrimerComponentDataValidationError<KlarnaPaymentValidatableData>) => {
          const log = `\nonValidationError: ${JSON.stringify(data)}\n`;
          console.log(log);
        },
      };
      klarnaComponent = await klarnaManager.provide(klarnaManagerProps);
      console.log('Starting Klarna payment component');
      klarnaComponent?.start();
    })();
  }, []);
  /* eslint-enable react-hooks/exhaustive-deps */

  const handlePaymentCategoryChange = async () => {
    try {
      const klarnaPaymentCategory = paymentCategories.find(
        paymentCategory => paymentCategory.identifier === selectedPaymentCategoryIdentifier
      ) as KlarnaPaymentCategory;

      await klarnaComponent.handlePaymentOptionsChange({
        returnIntentUrl: 'app://deeplink.return.activity.rn',
        paymentCategory: klarnaPaymentCategory,
      });
    } catch (err) {
      console.error(err);
    }
  };

  const finalizePayment = async () => {
    await klarnaComponent.finalizePayment();
  };

  const onSubmit = async () => {
    try {
      await klarnaComponent.submit();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <View
      style={{
        padding: 16,
        flex: 1,
        backgroundColor: 'white',
      }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold', paddingBottom: 8 }}>Klarna session</Text>

      <PaymentCategories
        selectedPaymentCategoryIdentifier={selectedPaymentCategoryIdentifier}
        paymentCategories={paymentCategories}
        onPress={identifier => {
          setAuthorizationVisible(false);
          setSelectedPaymentCategoryIdentifier(identifier);
        }}
      />

      <View style={styles.button}>
        <Button
          disabled={selectedPaymentCategoryIdentifier === null}
          onPress={() => handlePaymentCategoryChange()}
          title="Initialize Klarna view"
        />
      </View>

      {isAuthorizationVisible && <PrimerKlarnaPaymentView style={{ minHeight: 250 }} />}

      <View style={styles.button}>
        {isAuthorizationVisible && <Button onPress={() => onSubmit()} title="Continue" />}
      </View>
    </View>
  );
};

const PaymentCategories = ({
  paymentCategories,
  selectedPaymentCategoryIdentifier,
  onPress,
}: {
  paymentCategories: KlarnaPaymentCategory[];
  selectedPaymentCategoryIdentifier: string | null;
  onPress: (identifier: string) => void;
}) => {
  return (
    <>
      {paymentCategories.map(paymentCategory => (
        <RadioButton
          key={paymentCategory.identifier}
          text={paymentCategory.name}
          isChecked={selectedPaymentCategoryIdentifier == paymentCategory.identifier}
          onPress={() => onPress(paymentCategory.identifier)}
        />
      ))}
    </>
  );
};

const RadioButton = ({ text, isChecked, onPress }: { text: string; isChecked: boolean; onPress: () => void }) => {
  return (
    <TouchableOpacity style={styles.radioButton} onPress={() => onPress()}>
      <View style={[styles.radioCircle, isChecked && styles.checkedRadioCircle]} />
      <Text style={styles.radioText}>{text}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingTop: 16,
  },
  checkedRadioCircle: {
    backgroundColor: '#2C98F0',
  },
  radioButton: {
    alignItems: 'center',
    flexDirection: 'row',
    paddingVertical: 4,
  },
  radioCircle: {
    alignItems: 'center',
    borderColor: '#2C98F0',
    borderRadius: 10,
    borderWidth: 2,
    height: 20,
    justifyContent: 'center',
    width: 20,
  },
  radioText: {
    paddingStart: 8,
  },
});

export default HeadlessCheckoutKlarnaScreen;
