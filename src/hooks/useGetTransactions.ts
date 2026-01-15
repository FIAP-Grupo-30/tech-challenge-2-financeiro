import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';
import { ENV } from '../config/env';

const transactionSchema = z.object({
  id: z.string(),
  accountId: z.string(),
  type: z.enum(['Credit', 'Debit']),
  value: z.number(),
  date: z.string(),
  description: z.string().optional(),
  category: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
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
      Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6IkRvdWdsYXMgR29tZXMiLCJlbWFpbCI6ImRvdWdsYXNAbWFpbC5jb20iLCJwYXNzd29yZCI6IjEyMzQ1IiwiaWQiOiI2OTY5Nzk0MDZhOGUyYjliODYzYWI5MjciLCJpYXQiOjE3Njg1MjAwMDcsImV4cCI6MTc2ODU2MzIwN30.RWE24Hg2yl8uOdUdDML8wlYAo3iIOwDWH-gDqLxcQWA`,
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
