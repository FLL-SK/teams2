import { format } from 'date-fns';
import { TZDateMini, tz } from '@date-fns/tz';
import { sk } from 'date-fns/locale';

const timeZone = 'Europe/Bratislava';

export const formatDate = (date: Date | string | number) =>
  format(new Date(date), 'P', { locale: sk });

export const formatTime = (date: Date | string | number) =>
  format(new Date(date), 'HH:mm', { locale: sk });

export const formatDateTime = (date: Date | string | number) =>
  format(new Date(date), 'P HH:mm', { locale: sk });

export const toZonedDateTime = (date: Date | string | number) =>
  new TZDateMini(new Date(date), timeZone);

export const toZonedDateString = (date: Date | string | number | null | undefined) =>
  date ? format(date, 'yyyy-MM-dd HH:mm:ssXXX', { in: tz(timeZone) }) : undefined;

export const toUtcDateString = (date: Date | string | number | null | undefined) =>
  date ? new TZDateMini(new Date(date), timeZone).withTimeZone('UTC').toISOString() : undefined;

export function formatDateTimeRelative(date: Date | string | number): string {
  const now = new Date();
  const diff = now.getTime() - new Date(date).getTime();
  const day = 1000 * 60 * 60 * 24;
  if (diff < day) {
    return formatTime(date);
  }

  if (diff < day * 7) {
    return format(new Date(date), 'EEEE HH:mm', { locale: sk });
  }
  return formatDateTime(date);
}
