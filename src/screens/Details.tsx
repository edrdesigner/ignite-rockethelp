import { useEffect, useRef, useState } from 'react';
import {
  VStack,
  Text,
  HStack,
  useTheme,
  ScrollView,
  Box,
  KeyboardAvoidingView,
} from 'native-base';
import { useNavigation, useRoute } from '@react-navigation/native';
import {
  Hourglass,
  CircleWavyCheck,
  DesktopTower,
  ClipboardText,
} from 'phosphor-react-native';
import * as zod from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import firestore from '@react-native-firebase/firestore';
import { dateFormat } from '../utils/firestoreDateFormat';
import { Header } from '../components/Header';
import { OrderProps } from '../components/Order';
import { OrderFirestoreDTO } from '../DTO/OrderFirestoreDTO';
import { Loading } from '../components/Loading';
import { CardDetails } from '../components/CardDetails';
import { Button } from '../components/Button';
import { Alert, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { FormInput } from '../components/FormInput';

type RouteParams = {
  orderId: string;
};

type OrderDetails = OrderProps & {
  description: string;
  solution?: string;
  closed?: string;
};

const solutionValidationSchema = zod.object({
  solution: zod.string({
    required_error: 'Informe a solução para encerrar a solicitação',
  }),
});

type SolutionFormData = zod.infer<typeof solutionValidationSchema>;

export function Details() {
  const [isLoading, setIsLoading] = useState(true);
  const [order, setOrder] = useState<OrderDetails>({} as OrderDetails);
  const scrollRef = useRef(null);
  const { colors } = useTheme();
  const route = useRoute();
  const navigation = useNavigation();
  const { orderId } = route.params as RouteParams;

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<SolutionFormData>({
    resolver: zodResolver(solutionValidationSchema),
  });

  function handleOrderClose({ solution }) {
    firestore()
      .collection<OrderFirestoreDTO>('orders')
      .doc(orderId)
      .update({
        status: 'closed',
        solution,
        closed_at: firestore.FieldValue.serverTimestamp(),
      })
      .then(() => {
        Alert.alert('Solicitação', 'Solicitação encerrada');
        navigation.goBack();
      })
      .catch((error) => {
        console.log(error);
        Alert.alert('Solicitação', 'Não foi possível encerrar a solicitação');
      });
  }

  useEffect(() => {
    firestore()
      .collection<OrderFirestoreDTO>('orders')
      .doc(orderId)
      .get()
      .then((doc) => {
        const {
          patrimony,
          description,
          solution,
          status,
          created_at,
          closed_at,
        } = doc.data();

        const closed = closed_at ? dateFormat(closed_at) : null;

        setOrder({
          id: doc.id,
          patrimony,
          description,
          status,
          closed,
          solution,
          when: dateFormat(created_at),
        });

        setIsLoading(false);
      });
  }, [orderId]);

  if (isLoading) {
    return <Loading />;
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <Box flex={1} bg="gray.700">
        <KeyboardAvoidingView
          behavior="padding"
          flex={1}
          onLayout={() => {
            scrollRef?.current?.scrollToEnd();
          }}
          enabled
        >
          <VStack flex={1}>
            <Box px={6} bg="gray.600">
              <Header title="Solicitação" />
            </Box>
            <HStack bg="gray.500" justifyContent="center" p={4}>
              {order.status === 'closed' ? (
                <CircleWavyCheck size={22} color={colors.green[300]} />
              ) : (
                <Hourglass size={22} color={colors.secondary[700]} />
              )}

              <Text
                fontSize="sm"
                color={
                  order.status === 'closed'
                    ? colors.green[300]
                    : colors.secondary[700]
                }
                ml={2}
                textTransform="uppercase"
              >
                {order.status === 'closed' ? 'finalizado' : 'em aberto'}
              </Text>
            </HStack>

            <ScrollView
              ref={scrollRef}
              mx={5}
              showsVerticalScrollIndicator={false}
            >
              <CardDetails
                title="equipamento"
                description={`Patrimônio ${order.patrimony}`}
                icon={DesktopTower}
              />
              <CardDetails
                title="descrição do problema"
                description={order.description}
                icon={ClipboardText}
                footer={`Registrado em ${order.when}`}
              />
              <CardDetails
                title="solução"
                icon={CircleWavyCheck}
                description={order.solution}
                footer={order.closed && `Encerrado em ${order.closed}`}
              >
                {order.status === 'open' && (
                  <FormInput
                    placeholder="Descrição da solução"
                    textAlignVertical="top"
                    name="solution"
                    control={control}
                    h={24}
                    error={errors.solution?.message}
                    multiline
                  />
                )}
              </CardDetails>
            </ScrollView>
            {order.status === 'open' && (
              <Button
                title="Encerrar solicitação"
                m={5}
                onPress={handleSubmit(handleOrderClose)}
              />
            )}
          </VStack>
        </KeyboardAvoidingView>
      </Box>
    </TouchableWithoutFeedback>
  );
}
