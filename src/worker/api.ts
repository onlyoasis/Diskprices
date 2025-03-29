import { ProductAdvertisingAPIClient } from 'amazon-paapi';
import { Product } from './types';

// Amazon API 客户端配置
const client = new ProductAdvertisingAPIClient({
  accessKey: process.env.AMAZON_ACCESS_KEY_ID || '',
  secretKey: process.env.AMAZON_SECRET_ACCESS_KEY || '',
  partnerTag: process.env.AMAZON_PARTNER_TAG || '',
  region: 'us-east-1'
});

// 获取硬盘产品数据
export async function fetchAmazonProducts(): Promise<Product[]> {
  try {
    const response = await client.searchItems({
      Keywords: 'internal hard drive',
      SearchIndex: 'Electronics',
      ItemCount: 10,
      Resources: [
        'ItemInfo.Title',
        'Offers.Listings.Price',
        'Images.Primary.Large'
      ]
    });

    if (!response.SearchResult?.Items) {
      return [];
    }

    return response.SearchResult.Items.map(item => ({
      id: item.ASIN || '',
      title: item.ItemInfo?.Title?.DisplayValue || '',
      type: item.ItemInfo?.Title?.DisplayValue?.includes('SSD') ? 'SSD' : 'HDD',
      capacity: parseCapacity(item.ItemInfo?.Title?.DisplayValue || ''),
      price: item.Offers?.Listings?.[0]?.Price?.Amount || 0,
      pricePerTB: calculatePricePerTB(
        item.Offers?.Listings?.[0]?.Price?.Amount || 0,
        parseCapacity(item.ItemInfo?.Title?.DisplayValue || '')
      ),
      warranty: '制造商保修',
      formFactor: parseFormFactor(item.ItemInfo?.Title?.DisplayValue || ''),
      technology: item.ItemInfo?.Title?.DisplayValue?.includes('SSD') ? 'SATA SSD' : 'SATA HDD',
      condition: 'New',
      url: item.DetailPageURL || '',
      imageUrl: item.Images?.Primary?.Large?.URL || ''
    }));
  } catch (error) {
    console.error('Error fetching Amazon products:', error);
    throw error;
  }
}

// 解析容量（GB）
function parseCapacity(title: string): number {
  const match = title.match(/(\d+)\s*(TB|GB)/i);
  if (!match) return 0;
  
  const [, size, unit] = match;
  return unit.toLowerCase() === 'tb' ? 
    parseInt(size) * 1000 : 
    parseInt(size);
}

// 计算每 TB 价格
function calculatePricePerTB(price: number, capacityGB: number): number {
  if (capacityGB <= 0) return 0;
  return (price / (capacityGB / 1000));
}

// 解析硬盘规格
function parseFormFactor(title: string): string {
  if (title.includes('2.5')) return '2.5"';
  if (title.includes('3.5')) return '3.5"';
  if (title.includes('M.2')) return 'M.2';
  return '3.5"'; // 默认值
} 