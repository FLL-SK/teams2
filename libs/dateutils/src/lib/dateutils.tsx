import { format } from 'date-fns';
import { sk } from 'date-fns/locale';
import { formatInTimeZone, utcToZonedTime, zonedTimeToUtc } from 'date-fns-tz';

const timeZone = 'Europe/Bratislava';

export const formatDate = (date: Date | string | number) =>
  format(new Date(date), 'P', { locale: sk });

export const toUtcDateTime = (date: Date | string | number) =>
  zonedTimeToUtc(new Date(date), timeZone);

export const toZonedDateTime = (date: Date | string | number) =>
  utcToZonedTime(new Date(date), timeZone);

export const toZonedDateString = (date: Date | string | number | null | undefined) =>
  date ? formatInTimeZone(date, timeZone, 'yyyy-MM-dd HH:mm:ssXXX') : undefined;

export const toUtcDateString = (date: Date | string | number | null | undefined) =>
  date ? zonedTimeToUtc(date, timeZone).toISOString() : undefined;
