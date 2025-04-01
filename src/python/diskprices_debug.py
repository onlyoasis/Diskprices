import asyncio
from playwright.async_api import async_playwright
from bs4 import BeautifulSoup
from urllib.parse import urlparse, parse_qs, urlencode
import json
from datetime import datetime
import os

def clean_price(price_str):
    """清理价格字符串，返回数字"""
    if not price_str:
        return 0
    # 移除货币符号和逗号，转换为浮点数
    price_str = price_str.replace('¥', '').replace('$', '').replace(',', '').strip()
    try:
        return float(price_str)
    except ValueError:
        return 0

def extract_data(html_content):
    """从HTML内容中提取数据"""
    # 使用BeautifulSoup解析HTML
    soup = BeautifulSoup(html_content, 'html.parser')
    
    # 找到所有class为disk的tr元素
    disk_rows = soup.find_all('tr', class_='disk')
    
    # 准备数据列表
    products = []
    
    for row in disk_rows:
        # 提取data属性
        product_type = row.get('data-product-type', '')
        condition = row.get('data-condition', '')
        capacity = row.get('data-capacity', '')
        
        # 提取所有td的值
        tds = row.find_all('td')
        td_values = [td.get_text(strip=True) for td in tds]
        
        # 提取最后一个td中的href和商品名称
        last_td = tds[-1] if tds else None
        href = ''
        product_name = ''
        if last_td and last_td.find('a'):
            href = last_td.find('a')['href']
            product_name = last_td.find('a').get_text(strip=True)
            
            # 修改链接中的tag参数
            parsed_url = urlparse(href)
            query_params = parse_qs(parsed_url.query)
            query_params['tag'] = ['diskprices0b6-20']
            new_query = urlencode(query_params, doseq=True)
            href = parsed_url._replace(query=new_query).geturl()
        
        # 前端JSON数据
        price = clean_price(td_values[2]) if len(td_values) > 2 else 0
        price_per_tb = clean_price(td_values[1]) if len(td_values) > 1 else 0
        
        product_json = {
            'id': str(len(products) + 1),
            'title': product_name,
            'type': product_type.upper(),  # SSD 或 HDD
            'capacity': td_values[3] if len(td_values) > 3 else '',
            'price': price,
            'pricePerTB': price_per_tb,
            'warranty': td_values[4] if len(td_values) > 4 else '',
            'formFactor': td_values[5] if len(td_values) > 5 else '',
            'technology': td_values[6] if len(td_values) > 6 else '',
            'condition': condition,
            'url': href,
            'imageUrl': ''  # 暂时为空，因为原始数据中没有图片URL
        }
        products.append(product_json)
    
    return products

def save_data(products):
    """保存数据到JSON文件"""
    # 获取项目根目录路径
    root_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    data_dir = os.path.join(root_dir, 'data')
    
    # 确保data目录存在
    os.makedirs(data_dir, exist_ok=True)
    
    # 创建包含products和lastUpdate的JSON对象
    json_data = {
        'products': products,
        'lastUpdate': datetime.now().isoformat()
    }
    
    # 保存JSON文件到根目录的data文件夹
    json_file_path = os.path.join(data_dir, 'products.json')
    with open(json_file_path, 'w', encoding='utf-8') as f:
        json.dump(json_data, f, ensure_ascii=False, indent=2)
    print(f"数据已保存到 {json_file_path}，共提取 {len(products)} 条记录")

async def fetch_and_process_data():
    """获取并处理数据的主函数"""
    playwright = await async_playwright().start()
    browser = await playwright.chromium.launch(headless=False)
    page = await browser.new_page()
    
    try:
        print("正在访问网站...")
        await page.goto("https://diskprices.com/", timeout=60000)
        print("页面已加载")
        
        # 获取页面HTML内容
        html_content = await page.content()
        
        # 提取数据
        print("正在解析数据...")
        products = extract_data(html_content)
        
        # 保存数据
        print("正在保存数据...")
        save_data(products)
        
        print("数据获取和处理完成！")
        
    except Exception as e:
        print(f"处理过程中出错: {e}")
    finally:
        await browser.close()
        await playwright.stop()

if __name__ == "__main__":
    asyncio.run(fetch_and_process_data()) 