import pandas as pd
from bs4 import BeautifulSoup
import re
from urllib.parse import urlparse, parse_qs, urlencode
import json
from datetime import datetime

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

def extract_data():
    # 读取HTML文件
    with open("diskprices_html.txt", "r", encoding="utf-8") as f:
        html_content = f.read()
    
    # 使用BeautifulSoup解析HTML
    soup = BeautifulSoup(html_content, 'html.parser')
    
    # 找到所有class为disk的tr元素
    disk_rows = soup.find_all('tr', class_='disk')
    
    # 准备数据列表
    data = []
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
        
        # Excel数据
        row_data = {
            '产品类型': product_type,
            '状态': condition,
            '容量(TB)': capacity,
            '商品名称': product_name,
            '每GB价格': td_values[0] if len(td_values) > 0 else '',
            '每TB价格': td_values[1] if len(td_values) > 1 else '',
            '总价格': td_values[2] if len(td_values) > 2 else '',
            '容量': td_values[3] if len(td_values) > 3 else '',
            '保修期': td_values[4] if len(td_values) > 4 else '',
            '规格': td_values[5] if len(td_values) > 5 else '',
            '技术': td_values[6] if len(td_values) > 6 else '',
            '链接': href
        }
        data.append(row_data)
        
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
    
    # 保存Excel文件
    df = pd.DataFrame(data)
    df.to_excel('diskprices_data.xlsx', index=False)
    print(f"数据已保存到 diskprices_data.xlsx，共提取 {len(data)} 条记录")
    
    # 创建包含products和lastUpdate的JSON对象
    json_data = {
        'products': products,
        'lastUpdate': datetime.now().isoformat()
    }
    
    # 保存JSON文件到正确的位置
    with open('src/frontend/data/products.json', 'w', encoding='utf-8') as f:
        json.dump(json_data, f, ensure_ascii=False, indent=2)
    print(f"数据已保存到 src/frontend/data/products.json，共提取 {len(products)} 条记录")

if __name__ == "__main__":
    extract_data() 