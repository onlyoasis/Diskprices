import { ProductAdvertisingAPIClient } from '@aws-sdk/client-product-advertising-api';
import { Product } from './types';

// Amazon API 客户端配置
const client = new ProductAdvertisingAPIClient({
  region: 'us-east-1',
  credentials: {
    accessKeyId: process.env.AMAZON_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AMAZON_SECRET_ACCESS_KEY || '',
  },
});

// 获取硬盘产品数据
export async function fetchAmazonProducts(): Promise<Product[]> {
  try {
    // TODO: 实现 Amazon API 调用
    // 这里是示例数据，实际实现时需要替换为真实的 API 调用
    return [
      {
        id: '1',
        title: 'Samsung 970 EVO Plus NVMe M.2 SSD',
        type: 'SSD',
        capacity: 1000,
        price: 699.00,
        pricePerTB: 699.00,
        warranty: '5 years',
        formFactor: 'M.2 2280',
        technology: 'NVMe PCIe 3.0 x4',
        condition: 'New',
        url: 'https://www.amazon.com/dp/B07MFZY2F2',
        imageUrl: 'https://example.com/samsung-970-evo-plus.jpg'
      },
      // ... 其他产品数据
    ];
  } catch (error) {
    console.error('Error fetching Amazon products:', error);
    throw error;
  }
} 