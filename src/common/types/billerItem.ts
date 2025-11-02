export type BillerItemV2 = {
  internalCode: string;
  category: string; // 'data' | 'tv' | 'electricity' | 'airtime'
  billerName: string; // e.g mtn | dstv
  provider: string; // e.g 'vtpass' | 'interswitch'
  billerId: string; //  service id in vtpass
  paymentCode: string;
  name: string; // "MTN 500" or "DSTV YANGA"
  amount: number;
  amountType: number;
  active: boolean;
  image?: string;
};
