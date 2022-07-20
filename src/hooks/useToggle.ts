import { useCallback, useState } from 'react';

export function useToggle(initialState: boolean = false): [boolean, any] {
  const [state, setState] = useState<boolean>(initialState);

  const toggle = useCallback(() => setState((state) => !state), []);

  return [state, toggle];
}
