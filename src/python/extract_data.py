import pandas as pd
from bs4 import BeautifulSoup
import re
from urllib.parse import urlparse, parse_qs, urlencode

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
        
        # 组合数据
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
    
    # 创建DataFrame并保存到Excel
    df = pd.DataFrame(data)
    df.to_excel('diskprices_data.xlsx', index=False)
    print(f"数据已保存到 diskprices_data.xlsx，共提取 {len(data)} 条记录")

if __name__ == "__main__":
    extract_data() 