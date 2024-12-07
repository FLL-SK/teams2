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
    updatedOn?: string | null;
    note?: string | null;
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

  aoa.push([
    'Názov tímu',
    'Organizácia',
    'Mesto',
    'Ulica',
    'PSČ',
    'Objednané dňa',
    ...ftA,
    'Poznámka',
  ]);
  for (const reg of registrations) {
    const row: ArrayOfSDN = [
      reg.name,
      reg.address.name,
      reg.address.city,
      reg.address.street,
      reg.address.zip,
    ];
    if (reg.foodOrder) {
      row.push(new Date(reg.foodOrder.updatedOn ?? reg.foodOrder.createdOn));
      for (const ft of ftA) {
        row.push(reg.foodOrder.items.find((i) => i.name === ft)?.quantity ?? '');
      }
      row.push(reg.foodOrder.note ?? '');
    }

    aoa.push(row);
  }

  const today = new Date().toISOString().substring(0, 10);
  saveXlsx(aoa, `Objednavky stravovania (${eventName}) ${today}.xlsx`);
}
