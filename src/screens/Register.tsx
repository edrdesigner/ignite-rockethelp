import { useState } from 'react';
import { Alert, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { VStack } from 'native-base';
import { useForm } from 'react-hook-form';
import * as zod from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigation } from '@react-navigation/native';
import firestore from '@react-native-firebase/firestore';

import { Header } from '../components/Header';
import { Button } from '../components/Button';
import { useAuthContext } from '../contexts/AuthContext';
import { FormInput } from '../components/FormInput';

const signInValidationSchema = zod.object({
  patrimony: zod.string({ required_error: 'O patrimônio é obrigatório' }),
  description: zod.string({ required_error: 'A descrição é obrigatória' }),
});

type CreateNewOrderFormData = zod.infer<typeof signInValidationSchema>;

export function Register() {
  const { user } = useAuthContext();
  const [isLoading, setIsLoading] = useState(false);
  const navigation = useNavigation();

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<CreateNewOrderFormData>({
    resolver: zodResolver(signInValidationSchema),
  });

  function handleNewOrderRegister(data: CreateNewOrderFormData) {
    const newOrder = {
      ...data,
      user_uid: user?.uid,
      status: 'open',
      created_at: firestore.FieldValue.serverTimestamp() as any,
    };

    setIsLoading(true);

    firestore()
      .collection('orders')
      .add({
        ...newOrder,
      })
      .then(() => {
        Alert.alert('Solicitação', 'Solicitação registrada com sucesso.');
        navigation.goBack();
      })
      .catch((error) => {
        console.log(error);
        setIsLoading(false);
        return Alert.alert(
          'Solicitação',
          'Não foi possível registrar o pedido'
        );
      });
  }

  return (
    <TouchableWithoutFeedback style={{ flex: 1 }} onPress={Keyboard.dismiss}>
      <VStack flex={1} p={6} bg="gray.600">
        <Header title="Solicitação" />
        <FormInput
          placeholder="Número do patrimônio"
          mt={4}
          name="patrimony"
          control={control}
          error={errors.patrimony?.message}
        />
        <FormInput
          placeholder="Descrição do problema"
          flex={1}
          mt={5}
          textAlignVertical="top"
          name="description"
          control={control}
          error={errors.description?.message}
          multiline
        />
        <Button
          title="Cadastrar"
          mt={5}
          onPress={handleSubmit(handleNewOrderRegister)}
          isLoading={isLoading}
        />
      </VStack>
    </TouchableWithoutFeedback>
  );
}
