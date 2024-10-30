import { Order } from '../../_generated/graphql';
import { OrderData } from '../../models/order.model';

export const OrderMapper = {
  toOrder(order: OrderData | null | undefined): Order | null {
    if (!order) {
      return null;
    }
    const u: Omit<Required<Order>, '__typename'> = {
      id: order._id,
      createdOn: order.createdOn,
      items: order.items.map((item) => ({
        id: item._id,
        productId: item.productId,
        name: item.name,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        price: item.price,
      })),
    };
    return u;
  },
};
