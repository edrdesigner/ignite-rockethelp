import { Button as ButtonNativeBase, IButtonProps, Heading } from 'native-base';

type Props = IButtonProps & {
  title: string;
  variant?: 'primary' | 'secondary';
};

export function Button({ title, variant = 'primary', ...rest }: Props) {
  return (
    <ButtonNativeBase
      bg={variant === 'secondary' ? 'transparent' : 'green.700'}
      h={14}
      fontSize="sm"
      rounded="sm"
      _pressed={{
        bg: variant === 'primary' ? 'green.500' : undefined,
        opacity: 0.7,
      }}
      borderWidth={1}
      borderColor="green.700"
      {...rest}
    >
      <Heading color="white" fontSize="md">
        {title}
      </Heading>
    </ButtonNativeBase>
  );
}
