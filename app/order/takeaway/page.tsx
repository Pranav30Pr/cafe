import { CartProvider } from "@/context/CartContext";
import { CustomerAppView } from "@/components/customer/CustomerAppView";

export default function TakeawayPage() {
  return (
    <CartProvider>
      <CustomerAppView orderType="takeaway" />
    </CartProvider>
  );
}
