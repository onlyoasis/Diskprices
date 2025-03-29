// 全局变量
let products = [];
let filteredProducts = [];
let currentLang = 'en';
let translations = {};
let currentSort = {
    column: 'capacity',
    direction: 'desc'
};

// DOM 元素
const typeFilter = document.getElementById('typeFilter');
const capacityFilter = document.getElementById('capacityFilter');
const sortBy = document.getElementById('sortBy');
const priceTableBody = document.getElementById('priceTableBody');
const langButtons = document.querySelectorAll('.lang-btn');
const tableHeaders = document.querySelectorAll('#priceTable th');
const lastUpdateElement = document.getElementById('lastUpdate');

// 初始化
async function init() {
    try {
        // 加载数据
        const [productsResponse, translationsResponse] = await Promise.all([
            fetch('data/products.json'),
            fetch('data/languages.json')
        ]);
        
        products = await productsResponse.json();
        translations = await translationsResponse.json();
        filteredProducts = [...products.products];
        
        // 更新最后更新时间
        updateLastUpdateTime(products.lastUpdate);
        
        // 设置语言切换事件监听器
        langButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const lang = btn.dataset.lang;
                switchLanguage(lang);
            });
        });

        // 设置表头排序事件监听器
        setupTableSorting();
        
        // 渲染表格
        renderTable();
        
        // 添加事件监听器
        typeFilter.addEventListener('change', filterProducts);
        capacityFilter.addEventListener('change', filterProducts);
        sortBy.addEventListener('change', handleDropdownSort);

        // 添加产品结构化数据
        addProductStructuredData();
    } catch (error) {
        console.error('加载数据失败:', error);
    }
}

// 更新最后更新时间
function updateLastUpdateTime(timestamp) {
    const date = new Date(timestamp);
    const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZoneName: 'short'
    };
    lastUpdateElement.textContent = date.toLocaleDateString(currentLang === 'zh' ? 'zh-CN' : 'en-US', options);
}

// 添加产品结构化数据
function addProductStructuredData() {
    const productStructuredData = {
        "@context": "https://schema.org",
        "@type": "ItemList",
        "itemListElement": filteredProducts.map((product, index) => ({
            "@type": "ListItem",
            "position": index + 1,
            "item": {
                "@type": "Product",
                "name": product.title,
                "description": `${product.capacity}GB ${product.type} ${product.technology}`,
                "brand": {
                    "@type": "Brand",
                    "name": product.title.split(' ')[0]
                },
                "offers": {
                    "@type": "Offer",
                    "price": product.price,
                    "priceCurrency": "CNY",
                    "itemCondition": `https://schema.org/${product.condition}`,
                    "availability": "https://schema.org/InStock"
                }
            }
        }))
    };

    // 添加结构化数据到页面
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(productStructuredData);
    document.head.appendChild(script);
}

// 设置表头排序
function setupTableSorting() {
    const sortableColumns = {
        0: 'title',
        1: 'pricePerTB',
        2: 'price',
        3: 'capacity',
        4: 'warranty',
        5: 'formFactor',
        6: 'technology',
        7: 'condition'
    };

    tableHeaders.forEach((header, index) => {
        if (index in sortableColumns) {
            header.addEventListener('click', () => {
                const column = sortableColumns[index];
                handleHeaderSort(column, header);
            });
        }
    });
}

// 处理表头排序
function handleHeaderSort(column, header) {
    // 清除其他表头的排序状态
    tableHeaders.forEach(h => {
        h.classList.remove('sorted-asc', 'sorted-desc');
    });

    // 切换排序方向
    if (currentSort.column === column) {
        currentSort.direction = currentSort.direction === 'asc' ? 'desc' : 'asc';
    } else {
        currentSort.column = column;
        currentSort.direction = 'asc';
    }

    // 更新表头样式
    header.classList.add(`sorted-${currentSort.direction}`);

    // 更新下拉框选项
    updateSortDropdown(column, currentSort.direction);

    // 排序并重新渲染
    sortProducts();
}

// 更新排序下拉框
function updateSortDropdown(column, direction) {
    const sortMap = {
        'price': {'asc': 'price-asc', 'desc': 'price-desc'},
        'pricePerTB': {'asc': 'pricePerTB-asc', 'desc': 'pricePerTB-desc'},
        'capacity': {'asc': 'capacity-asc', 'desc': 'capacity-desc'}
    };

    if (column in sortMap) {
        sortBy.value = sortMap[column][direction];
    }
}

// 处理下拉框排序
function handleDropdownSort() {
    const [column, direction] = sortBy.value.split('-');
    currentSort.column = column;
    currentSort.direction = direction;

    // 更新表头样式
    tableHeaders.forEach(header => {
        header.classList.remove('sorted-asc', 'sorted-desc');
        if (header.textContent === translations[currentLang].table[column]) {
            header.classList.add(`sorted-${direction}`);
        }
    });

    sortProducts();
}

// 切换语言
function switchLanguage(lang) {
    currentLang = lang;
    document.documentElement.lang = lang;
    
    // 更新语言按钮状态
    langButtons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.lang === lang);
    });
    
    // 更新界面文本
    updateUIText();
    
    // 重新渲染表格
    renderTable();
}

// 更新界面文本
function updateUIText() {
    const t = translations[currentLang];
    
    // 更新标题
    document.querySelector('h1').textContent = t.title;
    
    // 更新筛选器
    typeFilter.querySelector('option[value=""]').textContent = t.filters.allTypes;
    capacityFilter.querySelector('option[value=""]').textContent = t.filters.allCapacities;
    
    // 更新类型选项
    typeFilter.querySelector('option[value="SSD"]').textContent = t.types.SSD;
    typeFilter.querySelector('option[value="HDD"]').textContent = t.types.HDD;
    
    // 更新容量选项
    Object.entries(t.capacities).forEach(([value, text]) => {
        const option = capacityFilter.querySelector(`option[value="${value}"]`);
        if (option) option.textContent = text;
    });
    
    // 更新排序选项
    sortBy.querySelector('option[value="price-asc"]').textContent = t.sort.priceAsc;
    sortBy.querySelector('option[value="price-desc"]').textContent = t.sort.priceDesc;
    sortBy.querySelector('option[value="pricePerTB-asc"]').textContent = t.sort.pricePerTBAsc;
    sortBy.querySelector('option[value="pricePerTB-desc"]').textContent = t.sort.pricePerTBDesc;
    sortBy.querySelector('option[value="capacity-asc"]').textContent = t.sort.capacityAsc;
    sortBy.querySelector('option[value="capacity-desc"]').textContent = t.sort.capacityDesc;
    
    // 更新表格标题
    const headers = document.querySelectorAll('#priceTable th');
    headers[0].textContent = t.table.productName;
    headers[1].textContent = t.table.pricePerTB;
    headers[2].textContent = t.table.price;
    headers[3].textContent = t.table.capacity;
    headers[4].textContent = t.table.warranty;
    headers[5].textContent = t.table.formFactor;
    headers[6].textContent = t.table.technology;
    headers[7].textContent = t.table.condition;
    headers[8].textContent = t.table.action;
}

// 过滤产品
function filterProducts() {
    const type = typeFilter.value;
    const capacity = capacityFilter.value;
    
    filteredProducts = products.products.filter(product => {
        const typeMatch = !type || product.type === type;
        const capacityMatch = !capacity || product.capacity === parseInt(capacity);
        return typeMatch && capacityMatch;
    });
    
    sortProducts();
}

// 排序产品
function sortProducts() {
    filteredProducts.sort((a, b) => {
        let aValue = a[currentSort.column];
        let bValue = b[currentSort.column];

        // 特殊处理字符串类型的比较
        if (typeof aValue === 'string') {
            aValue = aValue.toLowerCase();
            bValue = bValue.toLowerCase();
        }

        if (aValue < bValue) return currentSort.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return currentSort.direction === 'asc' ? 1 : -1;
        return 0;
    });
    
    renderTable();
}

// 渲染表格
function renderTable() {
    const t = translations[currentLang];
    priceTableBody.innerHTML = '';
    
    filteredProducts.forEach(product => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${product.title}</td>
            <td class="price">${formatPrice(product.pricePerTB)}</td>
            <td class="price">${formatPrice(product.price)}</td>
            <td>${formatCapacity(product.capacity)}</td>
            <td>${product.warranty}</td>
            <td>${product.formFactor}</td>
            <td>${product.technology}</td>
            <td>${product.condition}</td>
            <td>
                <a href="${product.url}" target="_blank" class="btn">${t.table.viewDetails}</a>
            </td>
        `;
        priceTableBody.appendChild(row);
    });
}

// 格式化容量
function formatCapacity(capacity) {
    if (capacity >= 1000) {
        return `${capacity/1000}TB`;
    }
    return `${capacity}GB`;
}

// 格式化价格
function formatPrice(price) {
    return `¥${price.toFixed(2)}`;
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', init); 