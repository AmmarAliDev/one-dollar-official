export type ReorderActionIssue = {
  productName: string;
  requestedQuantity: number;
  addedQuantity: number;
  reason: "UNAVAILABLE" | "OUT_OF_STOCK" | "QUANTITY_ADJUSTED";
  message: string;
};

export type ReorderActionState = {
  ok: boolean;
  message: string;
  addedQuantity: number;
  issueCount: number;
  issues: ReorderActionIssue[];
};

export const initialReorderActionState: ReorderActionState = {
  ok: false,
  message: "",
  addedQuantity: 0,
  issueCount: 0,
  issues: [],
};
