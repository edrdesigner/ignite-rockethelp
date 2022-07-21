import { NavigationContainer } from '@react-navigation/native';
import { AppRoutes } from './app.routes';
import { AuthRoutes } from './auth.routes';
import { Loading } from '../components/Loading';
import { useAuthContext } from '../contexts/AuthContext';

export function Routes() {
  const { isLoading, isAuthenticated } = useAuthContext();

  if (isLoading) {
    return <Loading />;
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? <AppRoutes /> : <AuthRoutes />}
    </NavigationContainer>
  );
}
