// 全局变量
let products = [];
let filteredProducts = [];
let currentLanguage = 'zh';
let translations = {};
let currentSort = { field: 'pricePerTB', direction: 'asc' };

// DOM 元素
const productTable = document.getElementById('productTable');
const languageSelect = document.getElementById('languageSelect');
const typeFilter = document.getElementById('typeFilter');
const capacityFilter = document.getElementById('capacityFilter');
const formFactorFilter = document.getElementById('formFactorFilter');
const sortButtons = document.querySelectorAll('.sort-btn');

// 初始化
async function init() {
  try {
    // 加载静态数据
    products = [
      {
        id: '1',
        title: 'Seagate IronWolf Pro 16TB NAS HDD',
        type: 'HDD',
        capacity: 16000,
        price: 299.99,
        pricePerTB: 18.75,
        warranty: '5年',
        formFactor: '3.5"',
        technology: 'SATA HDD',
        condition: 'New',
        url: '#',
        imageUrl: 'https://example.com/hdd1.jpg'
      },
      {
        id: '2',
        title: 'Samsung 870 EVO 2TB SSD',
        type: 'SSD',
        capacity: 2000,
        price: 199.99,
        pricePerTB: 100,
        warranty: '5年',
        formFactor: '2.5"',
        technology: 'SATA SSD',
        condition: 'New',
        url: '#',
        imageUrl: 'https://example.com/ssd1.jpg'
      }
    ];

    // 加载语言文件
    const response = await fetch('/data/languages.json');
    translations = await response.json();

    // 设置事件监听器
    setupEventListeners();

    // 渲染产品表格
    renderProductTable();
  } catch (error) {
    console.error('Error initializing:', error);
    showError('加载数据失败，请刷新页面重试');
  }
}

// 设置事件监听器
function setupEventListeners() {
  // 语言切换
  languageSelect.addEventListener('change', (e) => {
    currentLanguage = e.target.value;
    renderProductTable();
  });

  // 类型筛选
  typeFilter.addEventListener('change', filterProducts);

  // 容量筛选
  capacityFilter.addEventListener('change', filterProducts);

  // 规格筛选
  formFactorFilter.addEventListener('change', filterProducts);

  // 排序按钮
  sortButtons.forEach(button => {
    button.addEventListener('click', () => {
      const field = button.dataset.field;
      if (currentSort.field === field) {
        currentSort.direction = currentSort.direction === 'asc' ? 'desc' : 'asc';
      } else {
        currentSort.field = field;
        currentSort.direction = 'asc';
      }
      renderProductTable();
    });
  });
}

// 筛选产品
function filterProducts() {
  const type = typeFilter.value;
  const capacity = capacityFilter.value;
  const formFactor = formFactorFilter.value;

  filteredProducts = products.filter(product => {
    const typeMatch = type === 'all' || product.type === type;
    const capacityMatch = capacity === 'all' || 
      (capacity === 'small' && product.capacity < 1000) ||
      (capacity === 'medium' && product.capacity >= 1000 && product.capacity < 4000) ||
      (capacity === 'large' && product.capacity >= 4000);
    const formFactorMatch = formFactor === 'all' || product.formFactor === formFactor;

    return typeMatch && capacityMatch && formFactorMatch;
  });

  renderProductTable();
}

// 渲染产品表格
function renderProductTable() {
  const tbody = productTable.querySelector('tbody');
  tbody.innerHTML = '';

  // 排序产品
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const multiplier = currentSort.direction === 'asc' ? 1 : -1;
    return (a[currentSort.field] - b[currentSort.field]) * multiplier;
  });

  // 渲染产品行
  sortedProducts.forEach(product => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>
        <img src="${product.imageUrl}" alt="${product.title}" class="product-image">
        <a href="${product.url}" target="_blank">${product.title}</a>
      </td>
      <td>${product.type}</td>
      <td>${formatCapacity(product.capacity)}</td>
      <td>${formatPrice(product.price)}</td>
      <td>${formatPrice(product.pricePerTB)}/TB</td>
      <td>${product.warranty}</td>
      <td>${product.formFactor}</td>
      <td>${product.technology}</td>
      <td>${product.condition}</td>
    `;
    tbody.appendChild(row);
  });
}

// 格式化容量
function formatCapacity(capacity) {
  if (capacity >= 1000) {
    return `${capacity / 1000} TB`;
  }
  return `${capacity} GB`;
}

// 格式化价格
function formatPrice(price) {
  return `$${price.toFixed(2)}`;
}

// 显示错误信息
function showError(message) {
  const errorDiv = document.createElement('div');
  errorDiv.className = 'error-message';
  errorDiv.textContent = message;
  document.body.insertBefore(errorDiv, document.body.firstChild);
  setTimeout(() => errorDiv.remove(), 5000);
}

// 初始化应用
init(); 