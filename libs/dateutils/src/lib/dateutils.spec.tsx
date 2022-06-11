import { formatDate } from './dateutils';

describe('formatDate', () => {
  it('should render successfully', () => {
    const dateString = formatDate(new Date(2000, 0, 1));
    expect(dateString).toEqual('1.1.2000');
  });
});
