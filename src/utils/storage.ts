export type ProductItem = {
    name: string;
    quantity: number;
};

export type Well = {
    name: string;
    products: ProductItem[];
};

export type Tab = {
    id: string;
    name: string;
    wells: Well[];
};

const STORAGE_KEY = "bar_inventory_tabs";

export function loadTabsFromStorage(): Tab[] {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return [];
        const data = JSON.parse(raw);
        if (Array.isArray(data)) return data;
        return [];
    } catch {
        return [];
    }
}

export function saveTabsToStorage(tabs: Tab[]) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(tabs));
    } catch {
        // ignore
    }
}
