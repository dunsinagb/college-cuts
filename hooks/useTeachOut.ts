import useSWR from 'swr';

export const useTeachOut = (cip: string | undefined, state: string | undefined) =>
  useSWR(
    cip ? `/api/teach-out?cip=${cip}${state ? `&state=${state}` : ''}` : null,
    (u) => fetch(u).then(r => r.json())
  ); 