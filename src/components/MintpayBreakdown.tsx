import { useMemo } from "react";
import { usePaymentMethods } from "@/hooks/use-payment-methods";
import { API_BASE_URL } from "@/lib/auth";

const INSTALLMENTS = 3;

const formatLkr = (value: number) =>
  new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

const getInstallmentAmount = (price: number) => {
  const raw = price / INSTALLMENTS;
  return Math.round((raw + Number.EPSILON) * 100) / 100;
};

type MintpayBreakdownProps = {
  price?: number | string | null;
  className?: string;
  label?: string;
};

const resolveLogoSrc = (path?: string | null) => {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;
  if (path.startsWith("/")) return `${API_BASE_URL}${path}`;
  if (path.startsWith("storage/")) return `${API_BASE_URL}/${path}`;
  return `${API_BASE_URL}/storage/${path}`;
};

const MintpayBreakdown = ({ price, className, label = "Mintpay" }: MintpayBreakdownProps) => {
  const numericPrice = typeof price === "string" ? Number(price) : price;
  if (numericPrice == null || !Number.isFinite(numericPrice) || numericPrice <= 0) return null;

  const installment = getInstallmentAmount(numericPrice);
  const { data: paymentMethods } = usePaymentMethods();
  const mintpayLogo = useMemo(() => {
    if (!paymentMethods?.length) return null;
    const match = paymentMethods.find((method) => {
      const probe = `${method.name ?? ""} ${method.slug ?? ""} ${method.provider ?? ""}`.toLowerCase();
      return probe.includes("mintpay");
    });
    const icon = (match?.icon_path as string | undefined) ?? (match?.logo as string | undefined);
    return resolveLogoSrc(icon ?? null);
  }, [paymentMethods]);

  return (
    <div className={["flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground", className].filter(Boolean).join(" ")}>
      {mintpayLogo ? (
        <span className="inline-flex items-center">
          <img src={mintpayLogo} alt={label} className="h-6 w-auto" />
        </span>
      ) : (
        <span className="font-medium text-emerald-600">{label}</span>
      )}
      <span>Pay in {INSTALLMENTS} installments</span>
      <span>·</span>
      <span className="font-medium text-foreground">{INSTALLMENTS} x {formatLkr(installment)}</span>
    </div>
  );
};

export default MintpayBreakdown;
