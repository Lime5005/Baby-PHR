import express, { Request, Response } from 'express';
import { validateBabyWeight } from './weightLogic';
import { analyzeFeverTrend } from './feverLogic';
import { Pool } from 'pg';

const app = express();
app.use(express.json()); // 关键：允许 Express 解析前端传来的 JSON

const pool = new Pool ({
  host: 'localhost',
  port: 5432,
  user: 'root',
  password: 'postGres',
  database: 'lime'
})

app.post('/api/v1/patients/:babyId/temperatures', async (req, res) => {
  const { babyId } = req.params
  const { temperatureCelsius, measuredAt } = req.body

  // basic validation
  const temp = parseFloat(temperatureCelsius)
  if (isNaN(temp) || temp < 30 || temp > 45) {
    return res.status(400).json({error: 'Invalid temperature data.'})
  }

  try {
    // insert data
    const insertQuery = `
     INSERT INTO baby_temperatures (baby_id, temperature_celsius, measured_at) VALUES ($1, $2, $3);
    `
    await pool.query(insertQuery, [babyId, temperatureCelsius, measuredAt])

    // check the last 5 measures 
    const selectQuery = `
      SELECT temperature_celsius, measured_at FROM baby_temperatures
      WHERE baby_id = $1
      ORDER BY measured_at DESC
      LIMIT 5;
    `

    const dbResult = await pool.query(selectQuery, [babyId])
    const historyRecords = dbResult.rows

    // analyze for fever 
    const alertAnalysis = analyzeFeverTrend(historyRecords)

    return res.status(201).json({
      message: 'Temperature recorded successfully',
      currentReading: temp,
      alertStatus: alertAnalysis
    })

  } catch (error) {
    console.log('Database operations failed:', error)
    return res.status(500).json({error: 'Internal error occured'})
  }
})

const PORT = 3000
app.listen(PORT, () => {
  console.log(`Medical fever alert system is started!`)
})

// // 模拟数据库表结构（内存数据库）
// interface WeightRecord {
//   id: string;
//   weight_kg: number;
//   measured_at: string;
// }
// const dbMockTable: WeightRecord[] = [
//   { id: "1", weight_kg: 3.5, measured_at: "2026-05-01T08:00:00Z" }
// ];

// // 接口 1：GET 获取历史记录
// app.get('/api/v1/patients/:babyId/weights', (req: Request, res: Response) => {
//   return res.json(dbMockTable);
// });

// // 接口 2：POST 提交新记录 (全栈连接核心)
// app.post('/api/v1/patients/:babyId/weights', (req: Request, res: Response) => {
//   const { weightKg, measuredAt } = req.body;

//   // 1. 调用业务校验
//   const validation = validateBabyWeight(weightKg);
//   if (!validation.isValid) {
//     return res.status(400).json({ error: validation.error });
//   }

//   if (!measuredAt) {
//     return res.status(400).json({ error: 'Missing required field: measuredAt' });
//   }

//   // 2. 模拟数据库 INSERT INTO 和 RETURNING 行为
//   const newRecord: WeightRecord = {
//     id: Math.floor(Math.random() * 1000).toString(), // 模拟数据库自增ID
//     weight_kg: validation.parsedWeight!,
//     measured_at: measuredAt
//   };
  
//   dbMockTable.push(newRecord); // 存盘

//   // 3. 返回 201 和新对象
//   return res.status(201).json(newRecord);
// });

// const PORT = 3000;
// app.listen(PORT, () => {
//   console.log(`🚀 模拟全栈练习服务器已在 http://localhost:${PORT} 启动！`);
// });