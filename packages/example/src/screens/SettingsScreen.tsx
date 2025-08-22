import * as React from 'react';
import {
  ScrollView,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';
import {Colors} from 'react-native/Libraries/NewAppScreen';
import {styles} from '../styles';
import SegmentedControl from '@react-native-segmented-control/segmented-control';
import {
  Environment,
  makeEnvironmentFromIntVal,
  makePaymentHandlingFromIntVal,
  PaymentHandling,
} from '../network/Environment';
import {
  appPaymentParameters,
  IClientSessionAddress,
  IClientSessionCustomer,
  IClientSessionLineItem,
  IClientSessionOrder,
  IClientSessionPaymentMethod,
  IClientSessionPaymentMethodOptions,
  IClientSessionRequestBody,
} from '../models/IClientSessionRequestBody';
import {useState} from 'react';
import {Switch} from 'react-native';
import TextField from '../components/TextField';
import type {NewLineItemScreenProps} from './NewLineItemSreen';

export interface AppPaymentParameters {
  environment: Environment;
  paymentHandling: PaymentHandling;
  clientSessionRequestBody: IClientSessionRequestBody;
  merchantName?: string;
  shippingOptions?: {
    requireShippingMethod: boolean;
    shippingContactFields: string[];
  };
  billingOptions?: {
    requiredBillingContactFields: string[];
  };
}

export let customApiKey: string | undefined;
export let customClientToken: string | undefined;
export let customAppearanceMode: 'SYSTEM' | 'LIGHT' | 'DARK' = 'SYSTEM';

enum CheckoutVaultingType {
  NONE,
  VAULT_ON_SUCCESS,
  VAULT_ON_AGREEMENT,
}

export function makeCheckoutVaultingTypeFromIntVal(
  env: number,
): CheckoutVaultingType {
  switch (env) {
    case 0:
      return CheckoutVaultingType.NONE;
    case 1:
      return CheckoutVaultingType.VAULT_ON_SUCCESS;
    case 2:
      return CheckoutVaultingType.VAULT_ON_AGREEMENT;
    default:
      throw new Error('Failed to create checkout vaulting type.');
  }
}

// @ts-ignore
const SettingsScreen = ({navigation}) => {
  const isDarkMode = useColorScheme() === 'dark';
  const [environment, setEnvironment] = React.useState<Environment>(
    Environment.Sandbox,
  );
  const [apiKey, setApiKey] = React.useState<string | undefined>(customApiKey);
  const [clientToken, setClientToken] = React.useState<string | undefined>(
    undefined,
  );
  const [paymentHandling, setPaymentHandling] = React.useState<PaymentHandling>(
    PaymentHandling.Auto,
  );
  const [appearanceMode, setAppearanceMode] = React.useState<'SYSTEM' | 'LIGHT' | 'DARK'>(
    customAppearanceMode,
  );
  const [lineItems, setLineItems] = React.useState<IClientSessionLineItem[]>(
    appPaymentParameters.clientSessionRequestBody.order?.lineItems || [],
  );
  const [currency, setCurrency] = React.useState<string>('EUR');
  const [countryCode, setCountryCode] = React.useState<string>('DE');
  const [orderId, setOrderId] = React.useState<string | undefined>(
    appPaymentParameters.clientSessionRequestBody.orderId,
  );
  const [captureVaultedCardCvv, setCaptureVaultedCardCvv] = React.useState<
    string | undefined
  >(
    appPaymentParameters.clientSessionRequestBody.paymentMethod?.options
      ?.PAYMENT_CARD?.captureVaultedCardCvv,
  );

  const [merchantName, setMerchantName] = React.useState<string | undefined>(
    appPaymentParameters.merchantName,
  );

  const [isCustomerApplied, setIsCustomerApplied] = React.useState<boolean>(
    appPaymentParameters.clientSessionRequestBody.customer !== undefined,
  );
  const [customerId, setCustomerId] = React.useState<string | undefined>(
    appPaymentParameters.clientSessionRequestBody.customerId,
  );
  const [firstName, setFirstName] = React.useState<string | undefined>(
    appPaymentParameters.clientSessionRequestBody.customer?.firstName,
  );
  const [lastName, setLastName] = React.useState<string | undefined>(
    appPaymentParameters.clientSessionRequestBody.customer?.lastName,
  );
  const [email, setEmail] = React.useState<string | undefined>(
    appPaymentParameters.clientSessionRequestBody.customer?.emailAddress,
  );
  const [phoneNumber, setPhoneNumber] = React.useState<string | undefined>(
    appPaymentParameters.clientSessionRequestBody.customer?.mobileNumber,
  );
  const [nationalDocumentId, setNationalDocumentId] = React.useState<
    string | undefined
  >(appPaymentParameters.clientSessionRequestBody.customer?.nationalDocumentId);
  const [isAddressApplied, setIsAddressApplied] = React.useState<boolean>(
    appPaymentParameters.clientSessionRequestBody.customer?.billingAddress !==
      undefined,
  );
  const [addressLine1, setAddressLine1] = React.useState<string | undefined>(
    appPaymentParameters.clientSessionRequestBody.customer?.billingAddress
      ?.addressLine1,
  );
  const [addressLine2, setAddressLine2] = React.useState<string | undefined>(
    appPaymentParameters.clientSessionRequestBody.customer?.billingAddress
      ?.addressLine2,
  );
  const [postalCode, setPostalCode] = React.useState<string | undefined>(
    appPaymentParameters.clientSessionRequestBody.customer?.billingAddress
      ?.postalCode,
  );
  const [city, setCity] = React.useState<string | undefined>(
    appPaymentParameters.clientSessionRequestBody.customer?.billingAddress
      ?.city,
  );
  const [state, setState] = React.useState<string | undefined>(
    appPaymentParameters.clientSessionRequestBody.customer?.billingAddress
      ?.state,
  );
  const [customerAddressCountryCode, setCustomerAddressCountryCode] =
    React.useState<string | undefined>(
      appPaymentParameters.clientSessionRequestBody.customer?.billingAddress
        ?.countryCode,
    );

  const [isSurchargeApplied, setIsSurchargeApplied] =
    React.useState<boolean>(true);
  const [applePaySurcharge, setApplePaySurcharge] = React.useState<
    number | undefined
  >(
    appPaymentParameters.clientSessionRequestBody.paymentMethod?.options
      ?.APPLE_PAY?.surcharge.amount,
  );
  const [googlePaySurcharge, setGooglePaySurcharge] = React.useState<
    number | undefined
  >(
    appPaymentParameters.clientSessionRequestBody.paymentMethod?.options
      ?.GOOGLE_PAY?.surcharge.amount,
  );
  const [adyenGiropaySurcharge, setAdyenGiropaySurcharge] = React.useState<
    number | undefined
  >(
    appPaymentParameters.clientSessionRequestBody.paymentMethod?.options
      ?.ADYEN_GIROPAY?.surcharge.amount,
  );
  const [adyenIdealSurcharge, setAdyenIdealSurcharge] = React.useState<
    number | undefined
  >(
    appPaymentParameters.clientSessionRequestBody.paymentMethod?.options
      ?.ADYEN_IDEAL?.surcharge.amount,
  );
  const [adyenSofortSurcharge, setAdyenSofortySurcharge] = React.useState<
    number | undefined
  >(
    appPaymentParameters.clientSessionRequestBody.paymentMethod?.options
      ?.ADYEN_SOFORT?.surcharge.amount,
  );
  const [visaSurcharge, setVisaSurcharge] = React.useState<number | undefined>(
    appPaymentParameters.clientSessionRequestBody.paymentMethod?.options
      ?.PAYMENT_CARD?.networks.VISA?.surcharge.amount,
  );
  const [masterCardSurcharge, setMasterCardSurcharge] = React.useState<
    number | undefined
  >(
    appPaymentParameters.clientSessionRequestBody.paymentMethod?.options
      ?.PAYMENT_CARD?.networks.MASTERCARD?.surcharge.amount,
  );

  const [isBillingOptionsApplied, setIsBillingOptionsApplied] =
    useState<boolean>(false);
  const [requiredBillingContactFields, setRequiredBillingContactFields] =
    useState<string[]>([]);

  const [isShippingOptionsApplied, setIsShippingOptionsApplied] =
    useState<boolean>(false);
  const [requireShippingMethod, setRequireShippingMethod] =
    useState<boolean>(false);
  const [shippingContactFields, setShippingContactFields] = useState<string[]>(
    [],
  );

  const vaultOnSuccess =
    appPaymentParameters.clientSessionRequestBody.paymentMethod?.vaultOnSuccess;
  const vaultOnAgreement =
    appPaymentParameters.clientSessionRequestBody.paymentMethod
      ?.vaultOnAgreement;

  const [checkoutVaultingType, setCheckoutVaultingType] = React.useState<
    CheckoutVaultingType | undefined
  >(
    vaultOnSuccess
      ? CheckoutVaultingType.VAULT_ON_SUCCESS
      : vaultOnAgreement
      ? CheckoutVaultingType.VAULT_ON_AGREEMENT
      : CheckoutVaultingType.NONE,
  );

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.black : Colors.white,
  };

  const renderEnvironmentSection = () => {
    return (
      <View style={{marginTop: 12, marginBottom: 8}}>
        <Text style={{...styles.heading1}}>Environment</Text>
        <SegmentedControl
          testID="Enviroment"
          style={{marginTop: 6}}
          values={['Dev', 'Sandbox', 'Staging', 'Production']}
          selectedIndex={environment}
          onChange={event => {
            const selectedIndex = event.nativeEvent.selectedSegmentIndex;
            let selectedEnvironment = makeEnvironmentFromIntVal(selectedIndex);
            setEnvironment(selectedEnvironment);
          }}
        />
        <TextField
          title="API Key"
          testID="ApiKey"
          style={{marginVertical: 8}}
          value={apiKey}
          placeholder={'Set API key'}
          onChangeText={text => {
            setApiKey(text);
            customApiKey = text;
          }}
        />
        <TextField
          title="Client token"
          style={{marginVertical: 8}}
          value={clientToken}
          placeholder={'Set client token'}
          onChangeText={text => {
            setClientToken(text);
          }}
        />

        <Text style={{marginVertical: 8, ...styles.heading1}}>
          Checkout vaulting
        </Text>
        <SegmentedControl
          testID="CheckoutVaulting"
          style={{marginTop: 6, height: 56}}
          values={['No vaulting', 'Vault on success', 'Vault on agreement']}
          selectedIndex={checkoutVaultingType}
          onChange={event => {
            const selectedIndex = event.nativeEvent.selectedSegmentIndex;
            let selectedCheckoutVaultingType =
              makeCheckoutVaultingTypeFromIntVal(selectedIndex);
            setCheckoutVaultingType(selectedCheckoutVaultingType);
          }}
        />
      </View>
    );
  };

  const renderPaymentHandlingSection = () => {
    return (
      <View style={{marginTop: 12, marginBottom: 8}}>
        <Text style={{...styles.heading1}}>Payment Handling</Text>
        <SegmentedControl
          style={{marginTop: 6}}
          values={['Auto', 'Manual']}
          selectedIndex={paymentHandling}
          onChange={event => {
            const selectedIndex = event.nativeEvent.selectedSegmentIndex;
            let selectedPaymentHandling =
              makePaymentHandlingFromIntVal(selectedIndex);
            setPaymentHandling(selectedPaymentHandling);
          }}
        />
      </View>
    );
  };

  const renderAppearanceModeSection = () => {
    return (
      <View style={{marginTop: 12, marginBottom: 8}}>
        <Text style={{...styles.heading1}}>Appearance Mode</Text>
        <Text style={{...styles.sectionDescription, marginVertical: 4}}>
          Control SDK appearance independently of system settings
        </Text>
        <SegmentedControl
          style={{marginTop: 6}}
          values={['System', 'Light', 'Dark']}
          selectedIndex={appearanceMode === 'SYSTEM' ? 0 : appearanceMode === 'LIGHT' ? 1 : 2}
          onChange={event => {
            const selectedIndex = event.nativeEvent.selectedSegmentIndex;
            const modes: ('SYSTEM' | 'LIGHT' | 'DARK')[] = ['SYSTEM', 'LIGHT', 'DARK'];
            const selectedMode = modes[selectedIndex];
            setAppearanceMode(selectedMode);
            customAppearanceMode = selectedMode;
          }}
        />
      </View>
    );
  };

  const renderRecaptureCvvSection = () => {
    return (
      <View
        style={{
          marginTop: 12,
          marginBottom: 8,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'left',
        }}>
        <Text style={{...styles.heading1}}>Enable Recapture CVV</Text>
        <Switch
          onValueChange={setCaptureVaultedCardCvv}
          value={captureVaultedCardCvv}
        />
      </View>
    );
  };

  const renderOrderSection = () => {
    return (
      <View style={{marginTop: 12, marginBottom: 8}}>
        <Text style={{...styles.heading1}}>Order</Text>

        <View style={{marginTop: 8, marginBottom: 4}}>
          <TextField
            title="Currency"
            style={{marginVertical: 8}}
            value={currency}
            placeholder={'Set currency'}
            onChangeText={text => {
              setCurrency(text);
            }}
          />

          <TextField
            title="Country Code"
            style={{marginVertical: 8}}
            value={countryCode}
            placeholder={'Set country code'}
            onChangeText={text => {
              setCountryCode(text);
            }}
          />
        </View>

        {renderLineItems()}

        <View style={{marginTop: 8, marginBottom: 4}}>
          <TextField
            title="Order ID"
            value={orderId}
            onChangeText={text => {
              setOrderId(text);
            }}
          />
        </View>
      </View>
    );
  };

  const renderLineItems = () => {
    return (
      <View style={{marginTop: 8, marginBottom: 4}}>
        <View style={{flex: 1, flexDirection: 'row', marginBottom: 4}}>
          <Text style={{...styles.heading2}}>Line Items</Text>
          <View style={{flexGrow: 1}} />
          <TouchableOpacity
            onPress={() => {
              const newLineItemsScreenProps: NewLineItemScreenProps = {
                onAddLineItem: lineItem => {
                  const currentLineItems = [...lineItems];
                  currentLineItems.push(lineItem);
                  setLineItems(currentLineItems);
                },
              };

              navigation.navigate('NewLineItem', newLineItemsScreenProps);
            }}>
            <Text style={{color: 'blue'}}>+Add Line Item</Text>
          </TouchableOpacity>
        </View>
        {lineItems.map((item, index) => {
          return (
            <TouchableOpacity
              key={`${index}`}
              style={{
                flex: 1,
                flexDirection: 'row',
                marginVertical: 4,
                height: 30,
              }}
              onPress={() => {
                const newLineItemsScreenProps: NewLineItemScreenProps = {
                  lineItem: item,
                  onEditLineItem: editedLineItem => {
                    const currentLineItems = [...lineItems];
                    const currentIndex = currentLineItems.indexOf(item, 0);
                    currentLineItems[currentIndex] = editedLineItem;
                    setLineItems(currentLineItems);
                  },
                  onRemoveLineItem: lineItem => {
                    const currentLineItems = [...lineItems];
                    const currentIndex = currentLineItems.indexOf(lineItem, 0);
                    if (currentIndex > -1) {
                      currentLineItems.splice(currentIndex, 1);
                    }
                    setLineItems(currentLineItems);
                  },
                };

                navigation.navigate('NewLineItem', newLineItemsScreenProps);
              }}>
              <Text>
                {item.description} {`x${item.quantity}`}
              </Text>
              <View style={{flexGrow: 1}} />
              <Text>{item.amount}</Text>
            </TouchableOpacity>
          );
        })}
        <View style={{flex: 1, flexDirection: 'row', marginVertical: 4}}>
          <Text style={{fontWeight: '600'}}>Total</Text>
          <View style={{flexGrow: 1}} />
          <Text
            style={{
              fontWeight: '600',
            }}>{`${(lineItems || [])
            .map(item => item.amount * item.quantity)
            .reduce((prev, next) => prev + next, 0)}`}</Text>
        </View>
      </View>
    );
  };

  const renderRequiredSettings = () => {
    return (
      <View style={{marginTop: 32, marginBottom: 12}}>
        <Text
          style={[
            styles.sectionTitle,
            {
              color: 'black',
            },
          ]}>
          Required Settings
        </Text>
        <Text
          style={[
            styles.sectionDescription,
            {
              color: 'black',
            },
          ]}>
          The settings below cannot be left blank.
        </Text>

        {renderEnvironmentSection()}

        {renderPaymentHandlingSection()}

        {renderAppearanceModeSection()}

        {renderRecaptureCvvSection()}

        {renderOrderSection()}
      </View>
    );
  };

  const renderSurchargeSection = () => {
    return (
      <View style={{marginTop: 12, marginBottom: 8}}>
        <View style={{flex: 1, flexDirection: 'row'}}>
          <Text style={{...styles.heading1, marginBottom: 4}}>Surcharge</Text>
          <View style={{flex: 1}} />
          <Switch
            value={isSurchargeApplied}
            onValueChange={val => {
              setIsSurchargeApplied(val);
            }}
          />
        </View>
        {!isSurchargeApplied ? null : (
          <View>
            <TextField
              title="Apple Pay Surcharge"
              style={{marginVertical: 4}}
              value={
                applePaySurcharge === undefined
                  ? undefined
                  : `${applePaySurcharge}`
              }
              placeholder={'Set Apple Pay surcharge'}
              onChangeText={text => {
                const tmpSurcharge = Number(text);
                if (!isNaN(tmpSurcharge) && tmpSurcharge > 0) {
                  setApplePaySurcharge(tmpSurcharge);
                } else {
                  setApplePaySurcharge(undefined);
                }
              }}
            />
            <TextField
              title="Google Pay Surcharge"
              style={{marginVertical: 4}}
              value={
                googlePaySurcharge === undefined
                  ? undefined
                  : `${googlePaySurcharge}`
              }
              placeholder={'Set Google Pay surcharge'}
              onChangeText={text => {
                const tmpSurcharge = Number(text);
                if (!isNaN(tmpSurcharge) && tmpSurcharge > 0) {
                  setGooglePaySurcharge(tmpSurcharge);
                } else {
                  setGooglePaySurcharge(undefined);
                }
              }}
            />
            <TextField
              title="Adyen Giropay Surcharge"
              style={{marginVertical: 4}}
              value={
                adyenGiropaySurcharge === undefined
                  ? undefined
                  : `${adyenGiropaySurcharge}`
              }
              placeholder={'Set Adyen Giropay surcharge'}
              onChangeText={text => {
                const tmpSurcharge = Number(text);
                if (!isNaN(tmpSurcharge) && tmpSurcharge > 0) {
                  setAdyenGiropaySurcharge(tmpSurcharge);
                } else {
                  setAdyenGiropaySurcharge(undefined);
                }
              }}
            />
            <TextField
              title="Adyen IDeal Surcharge"
              style={{marginVertical: 4}}
              value={
                adyenIdealSurcharge === undefined
                  ? undefined
                  : `${adyenIdealSurcharge}`
              }
              placeholder={'Set Adyen IDeal surcharge'}
              onChangeText={text => {
                const tmpSurcharge = Number(text);
                if (!isNaN(tmpSurcharge) && tmpSurcharge > 0) {
                  setAdyenIdealSurcharge(tmpSurcharge);
                } else {
                  setAdyenIdealSurcharge(undefined);
                }
              }}
            />
            <TextField
              title="Adyen Sofort Surcharge"
              style={{marginVertical: 4}}
              value={
                adyenSofortSurcharge === undefined
                  ? undefined
                  : `${adyenSofortSurcharge}`
              }
              placeholder={'Set Adyen Sofort surcharge'}
              onChangeText={text => {
                const tmpSurcharge = Number(text);
                if (!isNaN(tmpSurcharge) && tmpSurcharge > 0) {
                  setAdyenSofortySurcharge(tmpSurcharge);
                } else {
                  setAdyenSofortySurcharge(undefined);
                }
              }}
            />
            <TextField
              title="VISA Surcharge"
              style={{marginVertical: 4}}
              value={
                visaSurcharge === undefined ? undefined : `${visaSurcharge}`
              }
              placeholder={'Set VISA surcharge'}
              onChangeText={text => {
                const tmpSurcharge = Number(text);
                if (!isNaN(tmpSurcharge) && tmpSurcharge > 0) {
                  setVisaSurcharge(tmpSurcharge);
                } else {
                  setVisaSurcharge(undefined);
                }
              }}
            />
            <TextField
              title="MasterCard Surcharge"
              style={{marginVertical: 4}}
              value={
                masterCardSurcharge === undefined
                  ? undefined
                  : `${masterCardSurcharge}`
              }
              placeholder={'Set MasterCard surcharge'}
              onChangeText={text => {
                const tmpSurcharge = Number(text);
                if (!isNaN(tmpSurcharge) && tmpSurcharge > 0) {
                  setMasterCardSurcharge(tmpSurcharge);
                } else {
                  setMasterCardSurcharge(undefined);
                }
              }}
            />
          </View>
        )}
      </View>
    );
  };

  const renderCustomerSection = () => {
    return (
      <View style={{marginTop: 12, marginBottom: 8}}>
        <View style={{flex: 1, flexDirection: 'row'}}>
          <Text style={{...styles.heading1, marginBottom: 4}}>Customer</Text>
          <View style={{flex: 1}} />
          <Switch
            value={isCustomerApplied}
            onValueChange={val => {
              setIsCustomerApplied(val);
            }}
          />
        </View>

        {!isCustomerApplied ? null : (
          <View>
            <TextField
              title="ID"
              style={{marginVertical: 4}}
              value={customerId}
              placeholder={'Set a unique ID for your customer'}
              onChangeText={text => {
                setCustomerId(text);
              }}
            />
            <TextField
              title="First Name"
              style={{marginVertical: 4}}
              value={firstName}
              placeholder={"Set your customer's first name"}
              onChangeText={text => {
                setFirstName(text);
              }}
            />
            <TextField
              title="Last Name"
              style={{marginVertical: 4}}
              value={lastName}
              placeholder={"Set your customer's last name"}
              onChangeText={text => {
                setLastName(text);
              }}
            />
            <TextField
              title="Email"
              style={{marginVertical: 4}}
              value={email}
              placeholder={"Set your customer's email"}
              onChangeText={text => {
                setEmail(text);
              }}
            />
            <TextField
              title="Mobile Number"
              style={{marginVertical: 4}}
              value={phoneNumber}
              placeholder={"Set your customer's mobile number"}
              onChangeText={text => {
                setPhoneNumber(text);
              }}
            />
            <TextField
              title="National Document ID"
              style={{marginVertical: 4}}
              value={nationalDocumentId}
              placeholder={"Set your customer's national doc ID"}
              onChangeText={text => {
                setNationalDocumentId(text);
              }}
            />

            <View style={{marginTop: 8}}>
              <View style={{flex: 1, flexDirection: 'row'}}>
                <Text style={{...styles.heading1, marginBottom: 4}}>
                  Address
                </Text>
                <View style={{flex: 1}} />
                <Switch
                  value={isAddressApplied}
                  onValueChange={val => {
                    setIsAddressApplied(val);
                  }}
                />
              </View>
              {!isAddressApplied ? null : (
                <View>
                  <TextField
                    title="Line 1"
                    style={{marginVertical: 4}}
                    value={addressLine1}
                    placeholder={"Set your customer's address line 1"}
                    onChangeText={text => {
                      setAddressLine1(text);
                    }}
                  />
                  <TextField
                    title="Line 2"
                    style={{marginVertical: 4}}
                    value={addressLine2}
                    placeholder={"Set your customer's address line 2"}
                    onChangeText={text => {
                      setAddressLine2(text);
                    }}
                  />
                  <TextField
                    title="Postal Code"
                    style={{marginVertical: 4}}
                    value={postalCode}
                    placeholder={"Set your customer's postal code"}
                    onChangeText={text => {
                      setPostalCode(text);
                    }}
                  />
                  <TextField
                    title="City"
                    style={{marginVertical: 4}}
                    value={city}
                    placeholder={"Set your customer's city"}
                    onChangeText={text => {
                      setCity(text);
                    }}
                  />
                  <TextField
                    title="State"
                    style={{marginVertical: 4}}
                    value={state}
                    placeholder={"Set your customer's state"}
                    onChangeText={text => {
                      setState(text);
                    }}
                  />
                  <TextField
                    title="Country Code"
                    style={{marginVertical: 4}}
                    value={customerAddressCountryCode}
                    placeholder={"Set your customer's country code"}
                    onChangeText={text => {
                      setCustomerAddressCountryCode(text);
                    }}
                  />
                </View>
              )}
            </View>
          </View>
        )}
      </View>
    );
  };

  const renderMerchantSection = () => {
    return (
      <View style={{marginTop: 12, marginBottom: 8}}>
        <Text style={{...styles.heading1}}>Merchant Name</Text>
        <TextField
          value={merchantName}
          placeholder={'Set merchant name that is presented on Apple Pay'}
          onChangeText={text => {
            setMerchantName(text);
          }}
        />
      </View>
    );
  };

  const renderOptionalSettings = () => {
    return (
      <View style={{marginTop: 32, marginBottom: 12}}>
        <Text
          style={[
            styles.sectionTitle,
            {
              color: 'black',
            },
          ]}>
          Optional Settings
        </Text>
        <Text
          style={[
            styles.sectionDescription,
            {
              color: 'black',
            },
          ]}>
          These settings are not required, however some payment methods may need
          them.
        </Text>
        {renderMerchantSection()}
        {renderCustomerSection()}
        {renderSurchargeSection()}
        {renderBillingOptionsSection()}
        {renderShippingOptionsSection()}
      </View>
    );
  };

  const renderActions = () => {
    return (
      <View>
        <TouchableOpacity
          testID="PrimerSDK"
          style={{
            ...styles.button,
            marginVertical: 5,
            backgroundColor: 'black',
          }}
          onPress={() => {
            updateAppPaymentParameters();
            console.log(appPaymentParameters);
            navigation.navigate('Checkout');
          }}>
          <Text style={{...styles.buttonText, color: 'white'}}>Primer SDK</Text>
        </TouchableOpacity>

        <TouchableOpacity
          testID="HeadlessUniversalCheckout"
          style={{
            ...styles.button,
            marginVertical: 5,
            backgroundColor: 'black',
          }}
          onPress={() => {
            updateAppPaymentParameters();
            console.log(appPaymentParameters);
            navigation.navigate('HUC');
          }}>
          <Text style={{...styles.buttonText, color: 'white'}}>
            Headless Universal Checkout
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            ...styles.button,
            marginVertical: 5,
            backgroundColor: 'black',
          }}
          onPress={() => {
            updateAppPaymentParameters();
            console.log(appPaymentParameters);
            navigation.navigate('HUCVault');
          }}>
          <Text style={{...styles.buttonText, color: 'white'}}>
            Headless Universal Checkout Vault
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderBillingOptionsSection = () => {
    return (
      <View style={{marginTop: 12, marginBottom: 8}}>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <Text style={{...styles.heading1, marginBottom: 4}}>
            Billing Options
          </Text>
          <View style={{flex: 1}} />
          <Switch
            value={isBillingOptionsApplied}
            onValueChange={val => {
              setIsBillingOptionsApplied(val);
            }}
          />
        </View>

        {!isBillingOptionsApplied ? null : (
          <View>
            <Text style={{...styles.heading2, marginVertical: 4}}>
              Billing Contact Fields
            </Text>
            <View style={{marginVertical: 4}}>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <Text style={{flex: 1}}>Name</Text>
                <Switch
                  value={requiredBillingContactFields.includes('name')}
                  onValueChange={val => {
                    if (val) {
                      setRequiredBillingContactFields([
                        ...requiredBillingContactFields,
                        'name',
                      ]);
                    } else {
                      setRequiredBillingContactFields(
                        requiredBillingContactFields.filter(
                          field => field !== 'name',
                        ),
                      );
                    }
                  }}
                />
              </View>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <Text style={{flex: 1}}>Email Address</Text>
                <Switch
                  value={requiredBillingContactFields.includes('emailAddress')}
                  onValueChange={val => {
                    if (val) {
                      setRequiredBillingContactFields([
                        ...requiredBillingContactFields,
                        'emailAddress',
                      ]);
                    } else {
                      setRequiredBillingContactFields(
                        requiredBillingContactFields.filter(
                          field => field !== 'emailAddress',
                        ),
                      );
                    }
                  }}
                />
              </View>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <Text style={{flex: 1}}>Phone Number</Text>
                <Switch
                  value={requiredBillingContactFields.includes('phoneNumber')}
                  onValueChange={val => {
                    if (val) {
                      setRequiredBillingContactFields([
                        ...requiredBillingContactFields,
                        'phoneNumber',
                      ]);
                    } else {
                      setRequiredBillingContactFields(
                        requiredBillingContactFields.filter(
                          field => field !== 'phoneNumber',
                        ),
                      );
                    }
                  }}
                />
              </View>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <Text style={{flex: 1}}>Postal Address</Text>
                <Switch
                  value={requiredBillingContactFields.includes('postalAddress')}
                  onValueChange={val => {
                    if (val) {
                      setRequiredBillingContactFields([
                        ...requiredBillingContactFields,
                        'postalAddress',
                      ]);
                    } else {
                      setRequiredBillingContactFields(
                        requiredBillingContactFields.filter(
                          field => field !== 'postalAddress',
                        ),
                      );
                    }
                  }}
                />
              </View>
            </View>
          </View>
        )}
      </View>
    );
  };

  const renderShippingOptionsSection = () => {
    return (
      <View style={{marginTop: 12, marginBottom: 8}}>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <Text style={{...styles.heading1, marginBottom: 4}}>
            Shipping Options
          </Text>
          <View style={{flex: 1}} />
          <Switch
            value={isShippingOptionsApplied}
            onValueChange={val => {
              setIsShippingOptionsApplied(val);
            }}
          />
        </View>

        {!isShippingOptionsApplied ? null : (
          <View>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginVertical: 4,
              }}>
              <Text style={{flex: 1}}>Require Shipping Method</Text>
              <Switch
                value={requireShippingMethod}
                onValueChange={val => {
                  setRequireShippingMethod(val);
                }}
              />
            </View>
            <Text style={{...styles.heading2, marginVertical: 4}}>
              Shipping Contact Fields
            </Text>
            <View style={{marginVertical: 4}}>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <Text style={{flex: 1}}>Name</Text>
                <Switch
                  value={shippingContactFields.includes('name')}
                  onValueChange={val => {
                    if (val) {
                      setShippingContactFields([
                        ...shippingContactFields,
                        'name',
                      ]);
                    } else {
                      setShippingContactFields(
                        shippingContactFields.filter(field => field !== 'name'),
                      );
                    }
                  }}
                />
              </View>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <Text style={{flex: 1}}>Email Address</Text>
                <Switch
                  value={shippingContactFields.includes('emailAddress')}
                  onValueChange={val => {
                    if (val) {
                      setShippingContactFields([
                        ...shippingContactFields,
                        'emailAddress',
                      ]);
                    } else {
                      setShippingContactFields(
                        shippingContactFields.filter(
                          field => field !== 'emailAddress',
                        ),
                      );
                    }
                  }}
                />
              </View>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <Text style={{flex: 1}}>Phone Number</Text>
                <Switch
                  value={shippingContactFields.includes('phoneNumber')}
                  onValueChange={val => {
                    if (val) {
                      setShippingContactFields([
                        ...shippingContactFields,
                        'phoneNumber',
                      ]);
                    } else {
                      setShippingContactFields(
                        shippingContactFields.filter(
                          field => field !== 'phoneNumber',
                        ),
                      );
                    }
                  }}
                />
              </View>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <Text style={{flex: 1}}>Postal Address</Text>
                <Switch
                  value={shippingContactFields.includes('postalAddress')}
                  onValueChange={val => {
                    if (val) {
                      setShippingContactFields([
                        ...shippingContactFields,
                        'postalAddress',
                      ]);
                    } else {
                      setShippingContactFields(
                        shippingContactFields.filter(
                          field => field !== 'postalAddress',
                        ),
                      );
                    }
                  }}
                />
              </View>
            </View>
          </View>
        )}
      </View>
    );
  };

  const updateAppPaymentParameters = () => {
    appPaymentParameters.merchantName = merchantName;
    appPaymentParameters.environment = environment;
    appPaymentParameters.paymentHandling = paymentHandling;

    const currentClientSessionRequestBody: IClientSessionRequestBody = {
      ...appPaymentParameters.clientSessionRequestBody,
    };
    currentClientSessionRequestBody.currencyCode = currency;

    const currentClientSessionOrder: IClientSessionOrder = {
      ...currentClientSessionRequestBody.order,
    };
    currentClientSessionOrder.countryCode = countryCode;
    currentClientSessionOrder.lineItems = lineItems;

    currentClientSessionRequestBody.order = currentClientSessionOrder;

    currentClientSessionRequestBody.customerId = customerId;

    let currentCustomer: IClientSessionCustomer | undefined = {
      ...appPaymentParameters.clientSessionRequestBody.customer,
    };
    if (isCustomerApplied) {
      currentCustomer.firstName = firstName;
      currentCustomer.lastName = lastName;
      currentCustomer.emailAddress = email;
      currentCustomer.mobileNumber = phoneNumber;

      let currentAddress: IClientSessionAddress | undefined = {
        ...appPaymentParameters.clientSessionRequestBody.customer
          ?.billingAddress,
      };
      if (isAddressApplied) {
        currentAddress.firstName = firstName;
        currentAddress.lastName = lastName;
        currentAddress.addressLine1 = addressLine1;
        currentAddress.addressLine2 = addressLine2;
        currentAddress.postalCode = postalCode;
        currentAddress.city = city;
        currentAddress.state = state;
        currentAddress.countryCode = customerAddressCountryCode;
      } else {
        currentAddress = undefined;
      }

      currentCustomer.billingAddress =
        Object.keys(currentAddress || {}).length === 0
          ? undefined
          : currentAddress;
      currentCustomer.shippingAddress =
        Object.keys(currentAddress || {}).length === 0
          ? undefined
          : currentAddress;
    } else {
      currentClientSessionRequestBody.customerId = undefined;
      currentCustomer = undefined;
    }

    currentClientSessionRequestBody.customer =
      Object.keys(currentCustomer || {}).length === 0
        ? undefined
        : currentCustomer;

    const currentPaymentMethod: IClientSessionPaymentMethod = {
      ...currentClientSessionRequestBody.paymentMethod,
    };
    let currentPaymentMethodOptions:
      | IClientSessionPaymentMethodOptions
      | undefined = {...currentPaymentMethod.options};

    if (isSurchargeApplied) {
      if (applePaySurcharge) {
        currentPaymentMethodOptions.APPLE_PAY = {
          surcharge: {
            amount: applePaySurcharge,
          },
        };
      } else {
        currentPaymentMethodOptions.APPLE_PAY = undefined;
      }

      if (googlePaySurcharge) {
        currentPaymentMethodOptions.GOOGLE_PAY = {
          surcharge: {
            amount: googlePaySurcharge,
          },
        };
      } else {
        currentPaymentMethodOptions.GOOGLE_PAY = undefined;
      }

      if (adyenGiropaySurcharge) {
        currentPaymentMethodOptions.ADYEN_GIROPAY = {
          surcharge: {
            amount: adyenGiropaySurcharge,
          },
        };
      } else {
        currentPaymentMethodOptions.ADYEN_GIROPAY = undefined;
      }

      if (visaSurcharge || captureVaultedCardCvv) {
        currentPaymentMethodOptions.PAYMENT_CARD = {
          networks: {
            VISA: {
              surcharge: {
                amount: visaSurcharge ?? 0,
              },
            },
          },
          captureVaultedCardCvv: captureVaultedCardCvv,
        };
      } else {
        currentPaymentMethodOptions.PAYMENT_CARD = undefined;
      }
    } else {
      currentPaymentMethodOptions = undefined;
    }

    currentPaymentMethod.options =
      Object.keys(currentPaymentMethodOptions || {}).length === 0
        ? undefined
        : currentPaymentMethodOptions;
    currentPaymentMethod.vaultOnSuccess =
      checkoutVaultingType === CheckoutVaultingType.VAULT_ON_SUCCESS;
    currentPaymentMethod.vaultOnAgreement =
      checkoutVaultingType === CheckoutVaultingType.VAULT_ON_AGREEMENT;
    currentClientSessionRequestBody.paymentMethod =
      Object.keys(currentPaymentMethod).length === 0
        ? undefined
        : currentPaymentMethod;

    appPaymentParameters.clientSessionRequestBody =
      currentClientSessionRequestBody;
    appPaymentParameters.shippingOptions = isShippingOptionsApplied
      ? {
          requireShippingMethod: requireShippingMethod,
          shippingContactFields: shippingContactFields,
        }
      : undefined;
    appPaymentParameters.billingOptions = isBillingOptionsApplied
      ? {
          requiredBillingContactFields: requiredBillingContactFields,
        }
      : undefined;
  };

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      style={backgroundStyle}>
      {/* <Header /> */}
      <View
        style={{
          marginHorizontal: 24,
        }}>
        {renderRequiredSettings()}
        {renderOptionalSettings()}

        <View style={{marginVertical: 5}} />

        {renderActions()}
      </View>
    </ScrollView>
  );
};

export default SettingsScreen;
