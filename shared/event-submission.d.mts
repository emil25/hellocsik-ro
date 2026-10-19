export function submissionOptions(body: Record<string, unknown>): {
  ticketUrl: string | null;
  newsLinks: string[];
  locationAddress: string | null;
  promotionPlan: "free" | "featured" | "homepage";
  promotionStatus: "none" | "requested";
};
