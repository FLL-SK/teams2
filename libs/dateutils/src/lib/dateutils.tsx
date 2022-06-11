import { format } from 'date-fns';
import { sk } from 'date-fns/locale';
import { formatInTimeZone, zonedTimeToUtc } from 'date-fns-tz';

export const formatDate = (date: Date | string | number | null | undefined) =>
  date ? format(new Date(date), 'P', { locale: sk }) : undefined;

export const toZonedDateString = (date: Date | string | number | null | undefined) =>
  date ? formatInTimeZone(date, 'Europe/Bratislava', 'yyyy-MM-dd HH:mm:ssXXX') : undefined;

export const toUtcDateString = (date: Date | string | number | null | undefined) =>
  date ? zonedTimeToUtc(date, 'Europe/Bratislava').toISOString() : undefined;
