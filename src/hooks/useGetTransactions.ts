import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { ENV } from "../config/env";

const transactionSchema = z.object({
	id: z.string(),
	accountId: z.string(),
	type: z.enum(["Credit", "Debit"]),
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

async function fetcher(accountId: string, token: string | null) {
	if (!token) {
		throw new Error("Token de autenticação não encontrado");
	}

	const response = await fetch(
		`${ENV.API_BASE_URL}/account/${accountId}/statement`,
		{
			headers: {
				Authorization: `Bearer ${token}`,
			},
		},
	);

	if (!response.ok) {
		throw new Error("Erro ao buscar transações");
	}

	const data = await response.json();
	return responseSchema.parse(data);
}

type Props = {
	accountId: string;
	token: string | null;
};

export function useGetTransactions({ accountId, token }: Props) {
	return useQuery({
		queryKey: ["transactions", accountId],
		queryFn: () => fetcher(accountId, token),
		enabled: !!accountId && !!token,
	});
}
