import { format } from 'date-fns';
import { sk } from 'date-fns/locale';
import { formatInTimeZone, utcToZonedTime, zonedTimeToUtc } from 'date-fns-tz';

const timeZone = 'Europe/Bratislava';

export const formatDate = (date: Date | string | number | null | undefined) =>
  date ? format(new Date(date), 'P', { locale: sk }) : undefined;

export const toZonedDateTime = (date: Date | string | number | null | undefined) =>
  date ? utcToZonedTime(new Date(date), timeZone) : undefined;

export const toZonedDateString = (date: Date | string | number | null | undefined) =>
  date ? formatInTimeZone(date, timeZone, 'yyyy-MM-dd HH:mm:ssXXX') : undefined;

export const toUtcDateString = (date: Date | string | number | null | undefined) =>
  date ? zonedTimeToUtc(date, timeZone).toISOString() : undefined;
