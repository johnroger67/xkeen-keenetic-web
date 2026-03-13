import { useMemo } from 'react';

import { API } from '@/api/client';

type UseStatusResult = {
  status: boolean;
  service: boolean;
  anonym: boolean;
  isPending: boolean;
};

export const useStatus = (): UseStatusResult => {
  const { data: status, isPending, isError } = API.status();

  return useMemo(() => {
    if (!isError && !isPending && status?.status === 0) {
      return {
        status: true,
        service: status.service,
        anonym: status.anonym,
        isPending,
      };
    }

    return {
      status: isError || isPending,
      service: false,
      anonym: true,
      isPending,
    };
  }, [isError, isPending, status]);
};
