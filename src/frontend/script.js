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
        
        const productsData = await productsResponse.json();
        translations = await translationsResponse.json();
        products = productsData.products;
        filteredProducts = [...products];
        
        // 更新最后更新时间
        updateLastUpdateTime(productsData.lastUpdate);
        
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

// 渲染表格
function renderTable() {
    priceTableBody.innerHTML = '';
    
    filteredProducts.forEach(product => {
        const row = document.createElement('tr');
        
        // 添加所有列，优化容量显示格式
        row.innerHTML = `
            <td><a href="${product.url}" class="product-link" target="_blank" rel="noopener noreferrer" title="${product.title}">${product.title}</a></td>
            <td class="price">$${product.pricePerTB.toFixed(2)}</td>
            <td class="price">$${product.price.toFixed(2)}</td>
            <td class="capacity">${product.capacity}</td>
            <td>${product.warranty}</td>
            <td>${product.formFactor}</td>
            <td>${product.technology}</td>
            <td>${product.condition}</td>
        `;
        
        priceTableBody.appendChild(row);
    });
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
                "description": `${product.capacity} ${product.type} ${product.technology}`,
                "brand": {
                    "@type": "Brand",
                    "name": product.title.split(' ')[0]
                },
                "offers": {
                    "@type": "Offer",
                    "price": product.price,
                    "priceCurrency": "USD",
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
    
    // 重新渲染表格以更新"查看详情"按钮文本
    renderTable();
}

// 更新界面文本
function updateUIText() {
    // 更新标题
    document.querySelector('h1').textContent = translations[currentLang].title;
    
    // 更新筛选器
    if (currentLang === 'zh') {
        typeFilter.innerHTML = `
            <option value="">所有类型</option>
            <option value="Tape">磁带</option>
            <option value="LTO-9">LTO-9</option>
            <option value="LTO-8">LTO-8</option>
            <option value="LTO-6">LTO-6</option>
        `;
        
        capacityFilter.innerHTML = `
            <option value="">所有容量</option>
            <option value="18 TB">18 TB</option>
            <option value="12 TB">12 TB</option>
            <option value="2.5 TB">2.5 TB</option>
            <option value="1.4 GB">1.4 GB</option>
            <option value="1 GB">1 GB</option>
            <option value="650 MB">650 MB</option>
        `;
        
        sortBy.innerHTML = `
            <option value="price-asc">价格 (低 → 高)</option>
            <option value="price-desc">价格 (高 → 低)</option>
            <option value="pricePerTB-asc">每TB价格 (低 → 高)</option>
            <option value="pricePerTB-desc">每TB价格 (高 → 低)</option>
            <option value="capacity-asc">容量 (低 → 高)</option>
            <option value="capacity-desc">容量 (高 → 低)</option>
        `;
    } else {
        typeFilter.innerHTML = `
            <option value="">All Types</option>
            <option value="Tape">Tape</option>
            <option value="LTO-9">LTO-9</option>
            <option value="LTO-8">LTO-8</option>
            <option value="LTO-6">LTO-6</option>
        `;
        
        capacityFilter.innerHTML = `
            <option value="">All Capacities</option>
            <option value="18 TB">18 TB</option>
            <option value="12 TB">12 TB</option>
            <option value="2.5 TB">2.5 TB</option>
            <option value="1.4 GB">1.4 GB</option>
            <option value="1 GB">1 GB</option>
            <option value="650 MB">650 MB</option>
        `;
        
        sortBy.innerHTML = `
            <option value="price-asc">Price (Low to High)</option>
            <option value="price-desc">Price (High to Low)</option>
            <option value="pricePerTB-asc">Price per TB (Low to High)</option>
            <option value="pricePerTB-desc">Price per TB (High to Low)</option>
            <option value="capacity-asc">Capacity (Low to High)</option>
            <option value="capacity-desc">Capacity (High to Low)</option>
        `;
    }
    
    // 更新表头
    tableHeaders.forEach((header, index) => {
        const columns = ['productName', 'pricePerTB', 'price', 'capacity', 'warranty', 'formFactor', 'technology', 'condition'];
        if (index < columns.length) {
            header.textContent = translations[currentLang].table[columns[index]];
        }
    });
}

// 筛选产品
function filterProducts() {
    const selectedType = typeFilter.value;
    const selectedCapacity = capacityFilter.value;
    
    filteredProducts = products.filter(product => {
        const typeMatch = !selectedType || 
            (selectedType === 'Tape' ? product.formFactor === 'Tape' : product.technology === selectedType);
        const capacityMatch = !selectedCapacity || product.capacity === selectedCapacity;
        return typeMatch && capacityMatch;
    });
    
    sortProducts();
}

// 排序产品
function sortProducts() {
    const { column, direction } = currentSort;
    
    filteredProducts.sort((a, b) => {
        let comparison = 0;
        
        switch (column) {
            case 'price':
            case 'pricePerTB':
                comparison = a[column] - b[column];
                break;
            case 'capacity':
                comparison = parseFloat(a.capacity) - parseFloat(b.capacity);
                break;
            default:
                comparison = String(a[column]).localeCompare(String(b[column]));
        }
        
        return direction === 'asc' ? comparison : -comparison;
    });
    
    renderTable();
}

// 初始化应用
init(); 