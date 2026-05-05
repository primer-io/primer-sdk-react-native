import * as React from 'react';
import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from 'react-native';
import {styles} from '../styles';
import {createClientSession} from '../network/api';
import {PrimerAnalytics, PrimerSettings, HeadlessUniversalCheckout} from '@primer-io/react-native';

interface LogEntry {
  timestamp: string;
  action: string;
  result: 'success' | 'error';
  message?: string;
}

const AnalyticsDebugScreen = () => {
  const isDarkMode = useColorScheme() === 'dark';
  const [logs, setLogs] = React.useState<LogEntry[]>([]);
  const [isSetup, setIsSetup] = React.useState(false);

  const backgroundStyle = {
    backgroundColor: isDarkMode ? '#000000' : '#FFFFFF',
  };

  const addLog = (action: string, result: 'success' | 'error', message?: string) => {
    const entry: LogEntry = {
      timestamp: new Date().toLocaleTimeString(),
      action,
      result,
      message,
    };
    setLogs(prev => [entry, ...prev]);
  };

  const handleSetup = async () => {
    try {
      addLog('createClientSession', 'success', 'Fetching client token...');
      const response = await createClientSession();
      const clientToken = response.clientToken;
      addLog('createClientSession', 'success', `Token: ${clientToken.substring(0, 20)}...`);

      addLog('headlessStart', 'success', 'Starting headless checkout...');
      const settings: PrimerSettings = {};
      await HeadlessUniversalCheckout.startWithClientToken(clientToken, settings);
      addLog('headlessStart', 'success', 'Headless checkout started');

      addLog('setup', 'success', 'Setting up analytics bridge...');
      await PrimerAnalytics.setup(clientToken);
      addLog('setup', 'success', 'Analytics bridge ready');
      setIsSetup(true);
    } catch (err: any) {
      addLog('setup', 'error', err.message || String(err));
    }
  };

  const trackEvent = async (eventName: string, metadata?: Record<string, string>) => {
    try {
      await PrimerAnalytics.trackEvent(eventName, metadata);
      const metaStr = metadata ? ` ${JSON.stringify(metadata)}` : '';
      addLog('trackEvent', 'success', `${eventName}${metaStr}`);
    } catch (err: any) {
      addLog('trackEvent', 'error', err.message || String(err));
    }
  };

  const handleSendLog = async () => {
    try {
      await PrimerAnalytics.sendLog('Debug test message', 'debug_test');
      addLog('sendLog', 'success', 'message: "Debug test message", event: "debug_test"');
    } catch (err: any) {
      addLog('sendLog', 'error', err.message || String(err));
    }
  };

  const eventButtons: {label: string; eventName: string; metadata?: Record<string, string>}[] = [
    {label: 'Checkout Flow Started', eventName: 'CHECKOUT_FLOW_STARTED'},
    {label: 'Payment Success', eventName: 'PAYMENT_SUCCESS', metadata: {paymentMethod: 'PAYMENT_CARD', paymentId: 'debug-payment-123'}},
    {label: 'Payment Failure', eventName: 'PAYMENT_FAILURE', metadata: {paymentMethod: 'PAYMENT_CARD'}},
  ];

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      style={backgroundStyle}>
      <View style={{marginHorizontal: 24, marginTop: 16}}>
        <Text style={styles.sectionTitle}>Analytics Bridge Debug</Text>

        <TouchableOpacity
          style={{
            ...styles.button,
            marginVertical: 5,
            backgroundColor: isSetup ? 'gray' : 'black',
          }}
          onPress={handleSetup}>
          <Text style={{...styles.buttonText, color: 'white'}}>
            {isSetup ? 'Bridge Ready' : 'Setup Bridge'}
          </Text>
        </TouchableOpacity>

        <Text style={{...styles.heading1, marginTop: 16, marginBottom: 8}}>
          Events
        </Text>

        {eventButtons.map((btn) => (
          <TouchableOpacity
            key={btn.eventName}
            style={{
              ...styles.button,
              marginVertical: 3,
              backgroundColor: isSetup ? 'black' : 'gray',
            }}
            disabled={!isSetup}
            onPress={() => trackEvent(btn.eventName, btn.metadata)}>
            <Text style={{...styles.buttonText, color: 'white', fontSize: 14}}>
              {btn.label}
            </Text>
          </TouchableOpacity>
        ))}

        <Text style={{...styles.heading1, marginTop: 16, marginBottom: 8}}>
          Logging
        </Text>

        <TouchableOpacity
          style={{
            ...styles.button,
            marginVertical: 3,
            backgroundColor: isSetup ? 'black' : 'gray',
          }}
          disabled={!isSetup}
          onPress={handleSendLog}>
          <Text style={{...styles.buttonText, color: 'white', fontSize: 14}}>
            Send Info Log
          </Text>
        </TouchableOpacity>

        <Text style={{...styles.heading1, marginTop: 16, marginBottom: 8}}>
          Logs
        </Text>

        {logs.map((entry, index) => (
          <View
            key={index}
            style={{
              padding: 8,
              marginBottom: 4,
              backgroundColor: entry.result === 'error' ? '#ffdddd' : '#ddffdd',
              borderRadius: 4,
            }}>
            <Text style={{fontSize: 12, fontWeight: '600'}}>
              [{entry.timestamp}] {entry.action} - {entry.result}
            </Text>
            {entry.message && (
              <Text style={{fontSize: 11, marginTop: 2}}>{entry.message}</Text>
            )}
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

export default AnalyticsDebugScreen;
