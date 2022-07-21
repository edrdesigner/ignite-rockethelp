import { useMemo, useState } from 'react';
import { Alert, Keyboard, TouchableWithoutFeedback } from 'react-native';
import auth from '@react-native-firebase/auth';
import {
  VStack,
  Heading,
  Icon,
  useTheme,
  Pressable,
  Box,
  KeyboardAvoidingView,
} from 'native-base';
import { Envelope, Eye, EyeSlash, Key } from 'phosphor-react-native';
import * as zod from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Logo from '../assets/logo_primary.svg';
import { Button } from '../components/Button';
import { useToggle } from '../hooks/useToggle';
import { FormInput } from '../components/FormInput';
import { useNavigation } from '@react-navigation/native';

const signInValidationSchema = zod.object({
  email: zod
    .string({ required_error: 'O e-mail é obrigatório' })
    .email('Digite um e-mail válido'),
  password: zod
    .string({ required_error: 'A senha é obrigatória' })
    .min(6, 'Mínimo 6 caracteres'),
});

type SignInFormData = zod.infer<typeof signInValidationSchema>;

export function SignIn() {
  const { colors } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useToggle(false);
  const { navigate } = useNavigation();
  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<SignInFormData>({
    resolver: zodResolver(signInValidationSchema),
  });

  function handleSignIn({ email, password }: SignInFormData) {
    setIsLoading(true);

    auth()
      .signInWithEmailAndPassword(email, password)
      .catch((error) => {
        setIsLoading(false);
        let errorMessage = 'Não foi possível entrar.';

        if (
          error.code === 'auth/user-not-found' ||
          error.code === 'auth/wrong-password'
        ) {
          errorMessage = 'Credenciais inválidas.';
        } else {
          console.log(error);
        }

        return Alert.alert('Entrar', errorMessage);
      });
  }

  function handleSignUp() {
    navigate('signUp');
  }
  const passwordRevealRender = useMemo(() => {
    return (
      <Pressable onPress={setShowPassword}>
        <Icon
          as={
            showPassword ? (
              <Eye color={colors.gray[100]} />
            ) : (
              <EyeSlash color={colors.gray[300]} />
            )
          }
          ml={1}
          mr={4}
        />
      </Pressable>
    );
  }, [showPassword]);

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} style={{ flex: 1 }}>
      <Box flex={1} bg="gray.600">
        <KeyboardAvoidingView behavior="position" enabled>
          <VStack alignItems="center"  px={8} pt={24}>
            <Logo />
            <Heading
              fontFamily="heading"
              color="gray.100"
              fontSize="xl"
              mt={20}
              mb={6}
            >
              Acesse sua conta
            </Heading>

            <FormInput
              placeholder="E-mail"
              mb={4}
              InputLeftElement={
                <Icon ml={4} as={<Envelope color={colors.gray[300]} />} />
              }
              name="email"
              control={control}
              error={errors.email?.message}
              autoCapitalize="none"
              autoComplete="email"
            />
            <FormInput
              placeholder="Senha"
              secureTextEntry={!showPassword}
              mb={8}
              InputLeftElement={
                <Icon ml={4} as={<Key color={colors.gray[300]} />} />
              }
              InputRightElement={passwordRevealRender}
              name="password"
              control={control}
              error={errors.password?.message}
            />
            <Button
              title="Entrar"
              w="full"
              onPress={handleSubmit(handleSignIn)}
              isLoading={isLoading}
            />
            <Button
              title="Criar uma conta"
              variant="secondary"
              my={4}
              w="full"
              onPress={handleSignUp}
            />
          </VStack>
        </KeyboardAvoidingView>
      </Box>
    </TouchableWithoutFeedback>
  );
}
