export interface Product {
    id: string;
    title: string;
    type: 'SSD' | 'HDD';
    capacity: number;
    price: number;
    pricePerTB: number;
    warranty: string;
    formFactor: string;
    technology: string;
    condition: string;
    url: string;
    imageUrl: string;
}

export interface Env {
    DISK_PRICES: KVNamespace;
    ENVIRONMENT: string;
    AMAZON_ACCESS_KEY_ID: string;
    AMAZON_SECRET_ACCESS_KEY: string;
} 