import { useQuery } from "@tanstack/react-query";
import { paymentService, type GetGatewaysParams } from "@/services/paymentService";

export const useGateways = (params?: GetGatewaysParams) => {
  return useQuery({
    queryKey: ["payment-gateways", params?.currency, params?.country],
    queryFn: () => paymentService.getGateways(params),
  });
};
