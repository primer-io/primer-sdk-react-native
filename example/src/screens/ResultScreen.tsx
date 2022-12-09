import * as React from 'react';
import {
    ScrollView,
    Text,
    useColorScheme,
    View,
} from 'react-native';

import {
    Colors,
} from 'react-native/Libraries/NewAppScreen';

const ResultScreen = (props: any) => {
    const isDarkMode = useColorScheme() === 'dark';

    const backgroundStyle = {
        backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
    };

    const paramsWithoutLogs: any = {};

    if (props.route.params?.merchantCheckoutData) {
        paramsWithoutLogs.merchantCheckoutData = props.route.params.merchantCheckoutData;
    }

    if (props.route.params?.merchantCheckoutAdditionalInfo) {
        paramsWithoutLogs.merchantCheckoutAdditionalInfo = props.route.params.merchantCheckoutAdditionalInfo;
    }

    if (props.route.params?.merchantPayment) {
        paramsWithoutLogs.merchantPayment = props.route.params.merchantPayment;
    }

    if (props.route.params?.merchantPrimerError) {
        paramsWithoutLogs.merchantPrimerError = props.route.params.merchantPrimerError;
    }

    let logs: string | undefined = props.route.params?.logs;

    return (
        <ScrollView
            contentInsetAdjustmentBehavior="automatic"
            style={backgroundStyle}>

            <View style={{ marginHorizontal: 20, marginVertical: 20, backgroundColor: 'lightgrey' }}>
                <Text
                    testID="checkout-data"
                >
                    {JSON.stringify(paramsWithoutLogs, null, 4)}
                </Text>
            </View>

            {
                !logs ? null :
                    <View style={{ marginHorizontal: 20, marginVertical: 20, backgroundColor: 'lightgrey' }}>
                        <Text
                            testID="checkout-events"
                        >
                            {JSON.stringify(logs, null, 4)}
                        </Text>
                    </View>
            }


        </ScrollView>
    );
};

export default ResultScreen;
