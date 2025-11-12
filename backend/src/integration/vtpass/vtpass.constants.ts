import { BillCategory, Providers } from '@prisma/client';

export const STATIC_BILL_ITEMS = [
  {
    category: BillCategory.AIRTIME,
    name: 'MTN',
    providers: [
      {
        name: Providers.VTPASS,
        billerId: 'mtn',
      },
    ],
  },
  {
    category: BillCategory.AIRTIME,
    name: 'GLO',
    providers: [
      {
        name: Providers.VTPASS,
        billerId: 'glo',
      },
    ],
  },
  {
    category: BillCategory.AIRTIME,
    name: 'AIRTEL',
    providers: [
      {
        name: Providers.VTPASS,
        billerId: 'airtel',
      },
    ],
  },
  {
    category: BillCategory.AIRTIME,
    name: '9MOBILE',
    providers: [
      {
        name: Providers.VTPASS,
        billerId: 'etisalat',
      },
    ],
  },
  {
    category: BillCategory.DATA,
    name: 'MTN',
    providers: [
      {
        name: Providers.VTPASS,
        billerId: 'mtn-data',
      },
    ],
  },
  {
    category: BillCategory.DATA,
    name: 'GLO',
    providers: [
      {
        name: Providers.VTPASS,
        billerId: 'glo-data',
      },
    ],
  },
  {
    category: BillCategory.DATA,
    name: 'AIRTEL',
    providers: [
      {
        name: Providers.VTPASS,
        billerId: 'airtel-data',
      },
    ],
  },
  {
    category: BillCategory.DATA,
    name: '9MOBILE',
    providers: [
      {
        name: Providers.VTPASS,
        billerId: 'etisalat-data',
      },
    ],
  },
  {
    category: BillCategory.DATA,
    name: 'SPECTRANET',
    providers: [
      {
        name: Providers.VTPASS,
        billerId: 'spectranet',
      },
    ],
  },
  {
    category: BillCategory.DATA,
    name: 'SMILE',
    providers: [
      {
        name: Providers.VTPASS,
        billerId: 'smile-direct',
      },
    ],
  },
  {
    category: BillCategory.TV,
    name: 'DSTV',
    providers: [
      {
        name: Providers.VTPASS,
        billerId: 'dstv',
      },
    ],
  },
  {
    category: BillCategory.TV,
    name: 'GOTV',
    providers: [
      {
        name: Providers.VTPASS,
        billerId: 'gotv',
      },
    ],
  },
  {
    category: BillCategory.TV,
    name: 'STARTIMES',
    providers: [
      {
        name: Providers.VTPASS,
        billerId: 'startimes',
      },
    ],
  },
  {
    category: BillCategory.TV,
    name: 'SHOWMAX',
    providers: [
      {
        name: Providers.VTPASS,
        billerId: 'showmax',
      },
    ],
  },
  {
    category: BillCategory.ELECTRICITY,
    name: 'Ikeja Electric',
    image:
      'https://sandbox.vtpass.com/resources/products/200X200/Ikeja-Electric-Payment-PHCN.jpg',
    providers: [
      {
        name: Providers.VTPASS,
        billerId: 'ikeja-electric',
      },
    ],
  },
  {
    category: BillCategory.ELECTRICITY,
    name: 'Eko Electric',
    image:
      'https://sandbox.vtpass.com/resources/products/200X200/Eko-Electric-Payment-PHCN.jpg',
    providers: [
      {
        name: Providers.VTPASS,
        billerId: 'eko-electric',
      },
    ],
  },
  {
    category: BillCategory.ELECTRICITY,
    name: 'Abuja Electric',
    image:
      'https://sandbox.vtpass.com/resources/products/200X200/Abuja-Electric.jpg',
    providers: [
      {
        name: Providers.VTPASS,
        billerId: 'abuja-electric',
      },
    ],
  },
  {
    category: BillCategory.ELECTRICITY,
    name: 'Kano Electric',
    image:
      'https://sandbox.vtpass.com/resources/products/200X200/Kano-Electric.jpg',
    providers: [
      {
        name: Providers.VTPASS,
        billerId: 'kano-electric',
      },
    ],
  },
  {
    category: BillCategory.ELECTRICITY,
    name: 'Portharcourt Electric',
    image:
      'https://sandbox.vtpass.com/resources/products/200X200/Port-Harcourt-Electric.jpg',
    providers: [
      {
        name: Providers.VTPASS,
        billerId: 'portharcourt-electric',
      },
    ],
  },
  {
    category: BillCategory.ELECTRICITY,
    name: 'Jos Electric',
    image:
      'https://sandbox.vtpass.com/resources/products/200X200/Jos-Electric-JED.jpg',
    providers: [
      {
        name: Providers.VTPASS,
        billerId: 'jos-electric',
      },
    ],
  },
  {
    category: BillCategory.ELECTRICITY,
    name: 'Kaduna Electric',
    image:
      'https://sandbox.vtpass.com/resources/products/200X200/Kaduna-Electric-KAEDCO.jpg',
    providers: [
      {
        name: Providers.VTPASS,
        billerId: 'kaduna-electric',
      },
    ],
  },
  {
    category: BillCategory.ELECTRICITY,
    name: 'Enugu Electric',
    image:
      'https://sandbox.vtpass.com/resources/products/200X200/Enugu-Electric-EEDC.jpg',
    providers: [
      {
        name: Providers.VTPASS,
        billerId: 'enugu-electric',
      },
    ],
  },
  {
    category: BillCategory.ELECTRICITY,
    name: 'Ibadan Electric',
    image: '',
    providers: [
      {
        name: Providers.VTPASS,
        billerId: 'ibadan-electric',
      },
    ],
  },
  {
    category: BillCategory.ELECTRICITY,
    name: 'Benin Electric',
    image:
      'https://sandbox.vtpass.com/resources/products/200X200/Benin-Electricity-BEDC.jpg',
    providers: [
      {
        name: Providers.VTPASS,
        billerId: 'benin-electric',
      },
    ],
  },
  {
    category: BillCategory.ELECTRICITY,
    name: 'Aba Electric',
    image:
      'https://sandbox.vtpass.com/resources/products/200X200/Aba-Electric-Payment-ABEDC.jpg',
    providers: [
      {
        name: Providers.VTPASS,
        billerId: 'aba-electric',
      },
    ],
  },
  {
    category: BillCategory.ELECTRICITY,
    name: 'Yola Electric',
    image:
      'https://sandbox.vtpass.com/resources/products/200X200/Yola-Electric-Payment-IKEDC.jpg',
    providers: [
      {
        name: Providers.VTPASS,
        billerId: 'yola-electric',
      },
    ],
  },
];
