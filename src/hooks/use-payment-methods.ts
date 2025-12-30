import { fetchPaymentMethods, type PaymentMethod } from "@/lib/checkout";
import { useQuery } from "@tanstack/react-query";

export const usePaymentMethods = () =>
  useQuery<PaymentMethod[]>({
    queryKey: ["payment-methods"],
    queryFn: fetchPaymentMethods,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
