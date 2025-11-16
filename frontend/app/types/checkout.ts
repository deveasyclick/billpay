export type InterSwitchCheckoutResponse = {
  amount?: number;
  apprAmt?: number;
  bpResp?: string;
  bpTrxnRef?: string;
  cardNum: string;
  desc?: string;
  mac: string;
  payRef?: string;
  rechPin?: string;
  resp: string;
  retRef?: string;
  txnref: string;
};

export type InterswitchPaymentResponse = {
  amount: number;
  apprAmt: number;
  bpResp?: string;
  bpTrxnRef?: string;
  cardNum: string;
  desc: string;
  mac: string;
  payRef: string;
  rechPin?: string;
  resp: string;
  retRef: string;
  txnref: string;
};
