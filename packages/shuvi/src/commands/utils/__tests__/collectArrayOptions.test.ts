import { collectArrayOptions } from '../collectArrayOptions';

describe('collectArrayOptions', () => {
  it('should return collected element', () => {
    let collected: string[] = [];
    collected = collectArrayOptions('new1', collected);
    collected = collectArrayOptions('new2', collected);
    collected = collectArrayOptions('new2', collected);
    expect(collected).toEqual(['new1', 'new2', 'new2']);
  });
});
