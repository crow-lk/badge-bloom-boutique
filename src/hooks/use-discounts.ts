import { API_BASE_URL, getStoredToken } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";

export type Discount = {
  id: number;
  name: string;
  start_date: string;
  end_date: string;
  discount_percentage: number;
  is_active: boolean;
};

export const useDiscounts = () =>
  useQuery({
    queryKey: ["discounts", "active"],
    queryFn: async () => {
      const token = getStoredToken();
      console.log("[useDiscounts] Fetching, token exists:", !!token);
      const response = await fetch(`${API_BASE_URL}/api/discounts/active`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      console.log("[useDiscounts] Response status:", response.status);
      if (!response.ok) {
        console.warn("[useDiscounts] API failed, returning empty");
        return [];
      }
      const data = (await response.json()) as Discount[];
      console.log("[useDiscounts] Data:", data);
      return data;
    },
    staleTime: 1000 * 60 * 5,
    retry: 1,
    refetchOnWindowFocus: false,
  });

export const calculateDiscountedPrice = (
  originalPrice: number | null,
  discountPercentage: number
): number | null => {
  if (originalPrice == null) return null;
  return originalPrice - (originalPrice * discountPercentage) / 100;
};

export const applyDiscountToPrice = (
  originalPrice: number | null,
  discounts: Discount[]
): { discountedPrice: number | null; appliedDiscount: Discount | null } => {
  if (originalPrice == null || !discounts.length) {
    return { discountedPrice: null, appliedDiscount: null };
  }

  const activeDiscount = discounts[0];
  const discountedPrice = calculateDiscountedPrice(originalPrice, activeDiscount.discount_percentage);

  return { discountedPrice, appliedDiscount: activeDiscount };
};
