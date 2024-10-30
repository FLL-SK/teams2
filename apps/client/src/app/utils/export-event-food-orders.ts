import { NestedObjectLeaves } from '@teams2/common';
import { ArrayOfArraysOfAny, ArrayOfSDN, saveXlsx } from './save-xlsx';

interface ExportSourceType {
  name: string;
  address: {
    name: string;
    city: string;
    street: string;
    zip: string;
  };

  eventName: string;
  foodOrder?: null | {
    createdOn: string;
    items: {
      productId: string;
      name: string;
      quantity: number;
      price?: number;
    }[];
  };
}

type ExportFieldKey = NestedObjectLeaves<ExportSourceType>;

export function exportEventFoodOrders(eventName: string, registrations: ExportSourceType[]) {
  const aoa: ArrayOfArraysOfAny = [];

  const foodTypes = new Set<string>();
  registrations.forEach((r) => {
    if (r.foodOrder) r.foodOrder.items.forEach((i) => foodTypes.add(i.name));
  });

  const ftA: string[] = Array.from(foodTypes).sort();

  aoa.push(
    foodTypes.size > 0
      ? ['Názov tímu', 'Organizácia', 'Mesto', 'Ulica', 'PSČ', 'Objednané dňa', ...ftA]
      : [],
  );
  for (const reg of registrations) {
    const row: ArrayOfSDN = [
      reg.name,
      reg.address.name,
      reg.address.city,
      reg.address.street,
      reg.address.zip,
    ];
    if (reg.foodOrder) {
      row.push(new Date(reg.foodOrder.createdOn));
      for (const ft of ftA) {
        row.push(reg.foodOrder.items.find((i) => i.name === ft)?.quantity ?? '');
      }
    }

    aoa.push(row);
  }

  const today = new Date().toISOString().substring(0, 10);
  saveXlsx(aoa, `Objednavky stravovania (${eventName}) ${today}.xlsx`);
}
