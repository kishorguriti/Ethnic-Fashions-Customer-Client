// Loads Razorpay's hosted checkout script on demand and opens the payment modal.
// The script is injected once and cached; subsequent calls resolve immediately.

const RAZORPAY_SRC = "https://checkout.razorpay.com/v1/checkout.js";

declare global {
  interface Window {
    Razorpay?: any;
  }
}

export const loadRazorpayScript = (): Promise<boolean> =>
  new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);

    const existing = document.querySelector<HTMLScriptElement>(`script[src="${RAZORPAY_SRC}"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve(true));
      existing.addEventListener("error", () => resolve(false));
      return;
    }

    const script = document.createElement("script");
    script.src = RAZORPAY_SRC;
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

export interface RazorpayCheckoutOptions {
  key: string;
  orderId: string;      // Razorpay order id (order_...)
  amount: number;       // in paise
  currency: string;
  name: string;
  description?: string;
  prefill?: { name?: string; email?: string; contact?: string };
  onSuccess: (response: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }) => void;
  onDismiss?: () => void;
}

// Opens the Razorpay checkout modal. Assumes loadRazorpayScript() already resolved true.
export const openRazorpayCheckout = (opts: RazorpayCheckoutOptions) => {
  const rzp = new window.Razorpay({
    key: opts.key,
    order_id: opts.orderId,
    amount: opts.amount,
    currency: opts.currency,
    name: opts.name,
    description: opts.description,
    prefill: opts.prefill,
    theme: { color: "#7c3aed" },
    handler: opts.onSuccess,
    modal: {
      ondismiss: () => opts.onDismiss?.(),
    },
  });
  rzp.open();
};
