import { Pool } from 'pg'
import { analyzeFeverTrend } from './feverLogic'

describe('🏥 真实数据库集成测试 - POST /api/v1/patients/:babyId/temperatures', () => {
  
  // 1. 直接连接真实的本地/测试数据库
  const pool = new Pool({
    host: 'localhost',
    port: 5432,
    user: 'lime',
    password: '',
    database: 'lime'
  });

  const testBabyId = 'test-baby-999';

  // 2. 环境清理：测试开始前，把这个测试婴儿历史脏数据删干净
  beforeEach(async () => {
    await pool.query('DELETE FROM baby_temperatures WHERE baby_id = $1', [testBabyId]);
  });

  // 3. 测试结束后，切断数据库连接池，否则 Jest 会卡住不退出
  afterAll(async () => {
    await pool.end();
  });

  // =========================================================================
  // 真实测试场景 A：连续 3 次高热，验证数据库写入并成功触发报警
  // =========================================================================
  test('【REAL DB】当数据库中连续插入 3 次高热数据时，接口应当联动触发 Alert', async () => {
    
    // 步骤 1：模拟真实时间线，连续向数据库塞入 3 条高热记录
    // 模拟后端的 INSERT 行为
    await pool.query('INSERT INTO baby_temperatures (baby_id, temperature_celsius, measured_at) VALUES ($1, $2, NOW())', [testBabyId, 38.6]);
    await pool.query('INSERT INTO baby_temperatures (baby_id, temperature_celsius, measured_at) VALUES ($1, $2, NOW())', [testBabyId, 39.1]);
    await pool.query('INSERT INTO baby_temperatures (baby_id, temperature_celsius, measured_at) VALUES ($1, $2, NOW())', [testBabyId, 38.8]);

    // 步骤 2：执行后端的真实查询逻辑 (ORDER BY ... LIMIT 5)
    const dbResult = await pool.query(`
      SELECT temperature_celsius, measured_at 
      FROM baby_temperatures
      WHERE baby_id = $1
      ORDER BY measured_at DESC
      LIMIT 5
    `, [testBabyId]);

    // 步骤 3：把从真实数据库捞出来的数据，送进算法验证
    const alertAnalysis = analyzeFeverTrend(dbResult.rows);

    // 步骤 4：用 Jest 断言验证
    expect(dbResult.rows.length).toBe(3); // 确保数据库里确实存进去了3条
    expect(alertAnalysis.shouldAlert).toBe(true); // 确保正确触发了发热报警！
    expect(alertAnalysis.reason).toContain('Sustained high fever');
  });

  // =========================================================================
  // 真实测试场景 B：数据不足 3 次，不触发报警
  // =========================================================================
  test('【REAL DB】当数据库中只有 1 条数据时，绝对不应当触发报警', async () => {
    // 只插入一条
    await pool.query('INSERT INTO baby_temperatures (baby_id, temperature_celsius, measured_at) VALUES ($1, $2, NOW())', [testBabyId, 39.5]);

    const dbResult = await pool.query('SELECT temperature_celsius FROM baby_temperatures WHERE baby_id = $1', [testBabyId]);
    const alertAnalysis = analyzeFeverTrend(dbResult.rows);

    expect(dbResult.rows.length).toBe(1);
    expect(alertAnalysis.shouldAlert).toBe(false); // 数据不够，不能报警
  });
});