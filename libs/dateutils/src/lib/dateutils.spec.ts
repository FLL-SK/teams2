import { toUtcDateString, toZonedDateString, toZonedDateTime } from './dateutils';

describe('toUtcDateString', () => {
  test('utc date from date', () => {
    const dateString = toUtcDateString(new Date(2000, 0, 1));
    expect(dateString).toEqual('1999-12-31T23:00:00.000Z');
  });
  test('utc date from string', () => {
    const dateString = toUtcDateString('2000-01-01T01:00:00');
    expect(dateString).toEqual('2000-01-01T00:00:00.000Z');
  });
  test('utc date from string during summer-time', () => {
    const dateString = toUtcDateString('2000-08-01T02:00:00');
    expect(dateString).toEqual('2000-08-01T00:00:00.000Z');
  });
});

describe('toZonedDateTime', () => {
  test('zoned date-time from date', () => {
    const result = toZonedDateTime(new Date(2000, 0, 1));
    expect(result.toISOString()).toEqual('1999-12-31T23:00:00.000Z');
  });
  test('zoned date-time from string', () => {
    const result = toZonedDateTime('2000-01-01T01:00:00');
    expect(result.toISOString()).toEqual('2000-01-01T00:00:00.000Z');
  });
  test('zoned date-time from string during summer-time', () => {
    const result = toZonedDateTime('2000-08-01T02:00:00');
    expect(result.toISOString()).toEqual('2000-08-01T00:00:00.000Z');
  });
});

describe('toZonedDateString', () => {
  test('zoned date from date', () => {
    const dateString = toZonedDateString(new Date(2000, 0, 1));
    expect(dateString).toEqual('2000-01-01 00:00:00+01:00');
  });
  test('zoned date from string', () => {
    const dateString = toZonedDateString('2000-01-01T00:00:00');
    expect(dateString).toEqual('2000-01-01 00:00:00+01:00');
  });
  test('zoned date from string during summer-time', () => {
    const dateString = toZonedDateString('2000-08-01T02:00:00');
    expect(dateString).toEqual('2000-08-01 02:00:00+02:00');
  });
});
