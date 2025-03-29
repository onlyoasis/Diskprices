import { Router } from 'itty-router';
import { fetchAmazonProducts } from './api';

const router = Router();

// API 路由
router.get('/api/products', async (request, env) => {
  try {
    const products = await env.DISK_PRICES.get('products', 'json');
    return new Response(JSON.stringify(products), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to fetch products' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
});

// 定时任务处理
async function handleScheduled(event: ScheduledEvent, env: any, ctx: ExecutionContext) {
  try {
    const products = await fetchAmazonProducts();
    await env.DISK_PRICES.put('products', JSON.stringify(products));
    console.log('Successfully updated product data');
  } catch (error) {
    console.error('Failed to update product data:', error);
  }
}

// Worker 处理函数
export default {
  // 处理 HTTP 请求
  async fetch(request: Request, env: any, ctx: ExecutionContext) {
    return router.handle(request, env, ctx);
  },

  // 处理定时任务
  scheduled(event: ScheduledEvent, env: any, ctx: ExecutionContext) {
    ctx.waitUntil(handleScheduled(event, env, ctx));
  },
}; 