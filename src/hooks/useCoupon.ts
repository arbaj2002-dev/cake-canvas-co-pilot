import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ValidateCouponParams {
  code: string;
  cartTotal: number;
  userId?: string;
}

interface ValidateCouponResult {
  isValid: boolean;
  discountAmount: number;
  message: string;
  couponId?: string;
}

export const useCoupon = () => {
  const { toast } = useToast();
  const [isValidating, setIsValidating] = useState(false);

  const validateCoupon = async ({
    code,
    cartTotal,
    userId,
  }: ValidateCouponParams): Promise<ValidateCouponResult> => {
    setIsValidating(true);

    try {
      // Fetch coupon from database
      const { data: coupon, error: couponError } = await supabase
        .from("coupons")
        .select("*")
        .eq("code", code.toUpperCase())
        .single();

      if (couponError || !coupon) {
        return {
          isValid: false,
          discountAmount: 0,
          message: "Invalid coupon code",
        };
      }

      // Check if coupon is active
      if (!coupon.is_active) {
        return {
          isValid: false,
          discountAmount: 0,
          message: "This coupon is no longer active",
        };
      }

      // Check expiry date
      if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
        return {
          isValid: false,
          discountAmount: 0,
          message: "This coupon has expired",
        };
      }

      // Check minimum order amount
      if (coupon.min_order_amount && cartTotal < coupon.min_order_amount) {
        return {
          isValid: false,
          discountAmount: 0,
          message: `Minimum order amount of ₹${coupon.min_order_amount} required`,
        };
      }

      // Check global usage limit
      if (coupon.max_uses) {
        const { count: usageCount } = await supabase
          .from("coupon_usages")
          .select("*", { count: "exact", head: true })
          .eq("coupon_id", coupon.id);

        if (usageCount && usageCount >= coupon.max_uses) {
          return {
            isValid: false,
            discountAmount: 0,
            message: "This coupon has reached its usage limit",
          };
        }
      }

      // Check per-user usage limit (if user is logged in)
      if (userId && coupon.max_uses_per_user) {
        const { count: userUsageCount } = await supabase
          .from("coupon_usages")
          .select("*", { count: "exact", head: true })
          .eq("coupon_id", coupon.id)
          .eq("user_id", userId);

        if (userUsageCount && userUsageCount >= coupon.max_uses_per_user) {
          return {
            isValid: false,
            discountAmount: 0,
            message: "You have already used this coupon",
          };
        }
      }

      // Check if first-time only (if user is logged in)
      if (userId && coupon.is_first_time_only) {
        const { count: orderCount } = await supabase
          .from("orders")
          .select("*", { count: "exact", head: true })
          .eq("customer_id", userId);

        if (orderCount && orderCount > 0) {
          return {
            isValid: false,
            discountAmount: 0,
            message: "This coupon is only valid for first-time customers",
          };
        }
      }

      // Calculate discount
      let discountAmount = 0;
      if (coupon.discount_type === "percentage") {
        discountAmount = (cartTotal * coupon.discount_value) / 100;
      } else {
        discountAmount = coupon.discount_value;
      }

      // Ensure discount doesn't exceed cart total
      discountAmount = Math.min(discountAmount, cartTotal);

      return {
        isValid: true,
        discountAmount,
        message: `Coupon applied! You saved ₹${discountAmount.toFixed(2)}`,
        couponId: coupon.id,
      };
    } catch (error) {
      console.error("Error validating coupon:", error);
      return {
        isValid: false,
        discountAmount: 0,
        message: "Error validating coupon",
      };
    } finally {
      setIsValidating(false);
    }
  };

  return {
    validateCoupon,
    isValidating,
  };
};
