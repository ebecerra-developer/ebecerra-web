import bookingTenantConfig from "./bookingTenantConfig";
import bookingService from "./bookingService";
import weeklyScheduleItem from "./weeklyScheduleItem";
import availabilityOverrideItem from "./availabilityOverrideItem";

export const bookingSchemas = [
  // Object types (deben ir antes de los documents que los referencian)
  weeklyScheduleItem,
  availabilityOverrideItem,
  // Documents
  bookingTenantConfig,
  bookingService,
];
