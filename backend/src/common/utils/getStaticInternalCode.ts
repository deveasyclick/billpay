import { BillCategory } from '@prisma/client';

export const isStaticCategory = (category: BillCategory) => {
  return (
    category === BillCategory.AIRTIME ||
    category === BillCategory.ELECTRICITY ||
    category === BillCategory.GAMING
  );
};

export const getStaticInternalCode = (billerName: string, category) => {
  return `${billerName} ${category}`.split(' ').join('-').toLowerCase();
};
