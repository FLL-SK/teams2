import { RegisteredTeamFragmentFragment } from '../../../_generated/graphql';
import { exportEventFoodOrders } from '../../../utils/export-event-food-orders';

interface CoachType {
  name: string;
  email: string;
  phone?: string | null;
}

export const handleExportFoodOrders = (
  programName: string,
  eventName: string,
  regs: RegisteredTeamFragmentFragment[],
) => {
  const teams = regs.map((r) => {
    return { ...r, childrenCount: r.boyCount + r.girlCount, eventName };
  });
  exportEventFoodOrders(eventName, teams);
};
