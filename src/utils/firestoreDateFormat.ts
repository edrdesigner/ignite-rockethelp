import { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';

export function dateFormat(timestap: FirebaseFirestoreTypes.Timestamp) {
  if (timestap) {
    const date = new Date(timestap.toDate());
    const day = date.toLocaleDateString('pt-BR');
    const hour = date.toLocaleTimeString('pt-BR');

    return `${day} as ${hour}`;
  }

  return '';
}
