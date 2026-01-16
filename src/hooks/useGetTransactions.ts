import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';
import { ENV } from '../config/env';

const transactionSchema = z.object({
  id: z.string(),
  accountId: z.string(),
  type: z.enum(['Credit', 'Debit']),
  value: z.number(),
  date: z.string(),
  from: z.string().optional(),
  to: z.string().optional(),
  anexo: z.string().optional(),
});

export type Transaction = z.infer<typeof transactionSchema>;

export const responseSchema = z.object({
  message: z.string(),
  result: z.object({
    transactions: z.array(transactionSchema),
  }),
});

export type Response = z.infer<typeof responseSchema>;

async function fetcher(accountId: string) {
  const response = await fetch(`${ENV.API_BASE_URL}/account/${accountId}/statement`, {
    headers: {
      Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InN0cmluZyIsImVtYWlsIjoic3RyaW5nIiwicGFzc3dvcmQiOiJzdHJpbmciLCJpZCI6IjY5Njk5N2YwZjc0MjhkOTY3NTA0NTUyYyIsImlhdCI6MTc2ODUyNzg3MiwiZXhwIjoxNzY4NTcxMDcyfQ.90ueBmfq0FMsJc-o7dEvuNhvyUumIRxcseMvXTlvfO0`,
    },
  });

  const data = await response.json();
  return responseSchema.parse(data);
}

type Props = {
  accountId: string;
};

export function useGetTransactions({ accountId }: Props) {
  return useQuery({
    queryKey: ['transactions', accountId],
    queryFn: () => fetcher(accountId),
    enabled: !!accountId,
  });
}
