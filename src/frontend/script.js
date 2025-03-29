// 全局变量
let products = [];
let filteredProducts = [];
let currentLang = 'en';
let translations = {};
let currentSort = {
    column: 'capacity',
    direction: 'desc'
};

// API 配置
const API_BASE_URL = 'https://diskprices-worker.your-subdomain.workers.dev';

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
            fetch(`${API_BASE_URL}/api/products`),
            fetch('data/languages.json')
        ]);
        
        const productsData = await productsResponse.json();
        products = productsData;
        translations = await translationsResponse.json();
        filteredProducts = [...products];
        
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
        showError('Failed to load data. Please try again later.');
    }
}

// 显示错误信息
function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    document.querySelector('.container').prepend(errorDiv);
}

// 其他现有函数保持不变...

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', init); 