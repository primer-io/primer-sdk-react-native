import {AchMandateManager} from '@primer-io/react-native';
import {Alert} from 'react-native';

export async function showAchMandateAlert() {
  const achMandateManager = new AchMandateManager();
  Alert.alert('ACH Mandate', 'Would you like to accept this mandate?', [
    {
      text: 'No',
      onPress: () => achMandateManager.declineMandate(),
      style: 'cancel',
    },
    {
      text: 'Yes',
      onPress: () => achMandateManager.acceptMandate(),
    },
  ]);
}
