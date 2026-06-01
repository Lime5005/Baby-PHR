import { validateBabyWeight } from './weightLogic';

describe('👶 婴儿健康档案 (PHR) - 体重算法 Jest 单元测试', () => {

  test('【GREEN】当输入标准合法体重时，应当校验通过并正确解析为数字', () => {
    const result = validateBabyWeight("4.25");
    expect(result.isValid).toBe(true);
    expect(result.parsedWeight).toBe(4.25);
    expect(result.error).toBeUndefined();
  });

  describe('防御性边界拦截验证', () => {
    test('【RED ➡️ GREEN】输入为空、负数、或暴增体重时，应当精准拦截', () => {
      const spaceInput = validateBabyWeight("   ");
      expect(spaceInput.isValid).toBe(false);
      expect(spaceInput.error).toBe('Missing required field: weightKg');

      const negativeResult = validateBabyWeight("-1.5");
      expect(negativeResult.isValid).toBe(false);
      expect(negativeResult.error).toContain('greater than 0 kg');

      const giantResult = validateBabyWeight("35.5");
      expect(giantResult.isValid).toBe(false);
      expect(giantResult.error).toContain('exceeds realistic limits');
    });
  });
});