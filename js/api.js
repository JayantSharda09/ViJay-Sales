/**
 * API Endpoints Configuration
 * This file contains all API endpoints for Ligma Grocery Management System
 */

const API_BASE_URL = 'http://localhost:3000/api'; // Change this to your actual API base URL

// API Endpoints Configuration
const API_ENDPOINTS = {
    // Customer endpoints
    customers: {
        getAll: `${API_BASE_URL}/customers`,
        getById: (id) => `${API_BASE_URL}/customers/${id}`,
        create: `${API_BASE_URL}/customers`,
        update: (id) => `${API_BASE_URL}/customers/${id}`,
        delete: (id) => `${API_BASE_URL}/customers/${id}`,
        getCount: `${API_BASE_URL}/customers/count`
    },

    // Product endpoints
    products: {
        getAll: `${API_BASE_URL}/products`,
        getById: (id) => `${API_BASE_URL}/products/${id}`,
        create: `${API_BASE_URL}/products`,
        update: (id) => `${API_BASE_URL}/products/${id}`,
        delete: (id) => `${API_BASE_URL}/products/${id}`,
        getCount: `${API_BASE_URL}/products/count`
    },

    // Supplier endpoints
    suppliers: {
        getAll: `${API_BASE_URL}/suppliers`,
        getById: (id) => `${API_BASE_URL}/suppliers/${id}`,
        create: `${API_BASE_URL}/suppliers`,
        update: (id) => `${API_BASE_URL}/suppliers/${id}`,
        delete: (id) => `${API_BASE_URL}/suppliers/${id}`,
        getCount: `${API_BASE_URL}/suppliers/count`
    },

    // Employee endpoints
    employees: {
        getAll: `${API_BASE_URL}/employees`,
        getById: (id) => `${API_BASE_URL}/employees/${id}`,
        create: `${API_BASE_URL}/employees`,
        update: (id) => `${API_BASE_URL}/employees/${id}`,
        delete: (id) => `${API_BASE_URL}/employees/${id}`,
        getCount: `${API_BASE_URL}/employees/count`
    },

    // Invoice endpoints
    invoices: {
        getAll: `${API_BASE_URL}/invoices`,
        getById: (id) => `${API_BASE_URL}/invoices/${id}`,
        create: `${API_BASE_URL}/invoices`,
        update: (id) => `${API_BASE_URL}/invoices/${id}`,
        delete: (id) => `${API_BASE_URL}/invoices/${id}`,
        getCount: `${API_BASE_URL}/invoices/count`
    },

    // Purchase Order endpoints
    purchaseOrders: {
        getAll: `${API_BASE_URL}/purchase-orders`,
        getById: (id) => `${API_BASE_URL}/purchase-orders/${id}`,
        create: `${API_BASE_URL}/purchase-orders`,
        update: (id) => `${API_BASE_URL}/purchase-orders/${id}`,
        delete: (id) => `${API_BASE_URL}/purchase-orders/${id}`,
        getCount: `${API_BASE_URL}/purchase-orders/count`
    },

    // Order Details endpoints
    orderDetails: {
        getAll: `${API_BASE_URL}/order-details`,
        getById: (id) => `${API_BASE_URL}/order-details/${id}`,
        create: `${API_BASE_URL}/order-details`,
        update: (id) => `${API_BASE_URL}/order-details/${id}`,
        delete: (id) => `${API_BASE_URL}/order-details/${id}`,
        getCount: `${API_BASE_URL}/order-details/count`
    }
};

/**
 * API Hook - Generic fetch function with error handling
 */
async function apiFetch(url, options = {}) {
    try {
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
            },
        };

        const config = {
            ...defaultOptions,
            ...options,
            headers: {
                ...defaultOptions.headers,
                ...options.headers,
            },
        };

        const response = await fetch(url, config);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return { success: true, data };
    } catch (error) {
        console.error('API Error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * API Hooks - Custom hooks for each entity
 */
const useCustomers = () => {
    const getAll = async () => {
        return await apiFetch(API_ENDPOINTS.customers.getAll);
    };

    const getById = async (id) => {
        return await apiFetch(API_ENDPOINTS.customers.getById(id));
    };

    const create = async (customerData) => {
        return await apiFetch(API_ENDPOINTS.customers.create, {
            method: 'POST',
            body: JSON.stringify(customerData),
        });
    };

    const update = async (id, customerData) => {
        return await apiFetch(API_ENDPOINTS.customers.update(id), {
            method: 'PUT',
            body: JSON.stringify(customerData),
        });
    };

    const remove = async (id) => {
        return await apiFetch(API_ENDPOINTS.customers.delete(id), {
            method: 'DELETE',
        });
    };

    const getCount = async () => {
        return await apiFetch(API_ENDPOINTS.customers.getCount);
    };

    return { getAll, getById, create, update, remove, getCount };
};

const useProducts = () => {
    const getAll = async () => {
        return await apiFetch(API_ENDPOINTS.products.getAll);
    };

    const getById = async (id) => {
        return await apiFetch(API_ENDPOINTS.products.getById(id));
    };

    const create = async (productData) => {
        return await apiFetch(API_ENDPOINTS.products.create, {
            method: 'POST',
            body: JSON.stringify(productData),
        });
    };

    const update = async (id, productData) => {
        return await apiFetch(API_ENDPOINTS.products.update(id), {
            method: 'PUT',
            body: JSON.stringify(productData),
        });
    };

    const remove = async (id) => {
        return await apiFetch(API_ENDPOINTS.products.delete(id), {
            method: 'DELETE',
        });
    };

    const getCount = async () => {
        return await apiFetch(API_ENDPOINTS.products.getCount);
    };

    return { getAll, getById, create, update, remove, getCount };
};

const useSuppliers = () => {
    const getAll = async () => {
        return await apiFetch(API_ENDPOINTS.suppliers.getAll);
    };

    const getById = async (id) => {
        return await apiFetch(API_ENDPOINTS.suppliers.getById(id));
    };

    const create = async (supplierData) => {
        return await apiFetch(API_ENDPOINTS.suppliers.create, {
            method: 'POST',
            body: JSON.stringify(supplierData),
        });
    };

    const update = async (id, supplierData) => {
        return await apiFetch(API_ENDPOINTS.suppliers.update(id), {
            method: 'PUT',
            body: JSON.stringify(supplierData),
        });
    };

    const remove = async (id) => {
        return await apiFetch(API_ENDPOINTS.suppliers.delete(id), {
            method: 'DELETE',
        });
    };

    const getCount = async () => {
        return await apiFetch(API_ENDPOINTS.suppliers.getCount);
    };

    return { getAll, getById, create, update, remove, getCount };
};

const useEmployees = () => {
    const getAll = async () => {
        return await apiFetch(API_ENDPOINTS.employees.getAll);
    };

    const getById = async (id) => {
        return await apiFetch(API_ENDPOINTS.employees.getById(id));
    };

    const create = async (employeeData) => {
        return await apiFetch(API_ENDPOINTS.employees.create, {
            method: 'POST',
            body: JSON.stringify(employeeData),
        });
    };

    const update = async (id, employeeData) => {
        return await apiFetch(API_ENDPOINTS.employees.update(id), {
            method: 'PUT',
            body: JSON.stringify(employeeData),
        });
    };

    const remove = async (id) => {
        return await apiFetch(API_ENDPOINTS.employees.delete(id), {
            method: 'DELETE',
        });
    };

    const getCount = async () => {
        return await apiFetch(API_ENDPOINTS.employees.getCount);
    };

    return { getAll, getById, create, update, remove, getCount };
};

const useInvoices = () => {
    const getAll = async () => {
        return await apiFetch(API_ENDPOINTS.invoices.getAll);
    };

    const getById = async (id) => {
        return await apiFetch(API_ENDPOINTS.invoices.getById(id));
    };

    const create = async (invoiceData) => {
        return await apiFetch(API_ENDPOINTS.invoices.create, {
            method: 'POST',
            body: JSON.stringify(invoiceData),
        });
    };

    const update = async (id, invoiceData) => {
        return await apiFetch(API_ENDPOINTS.invoices.update(id), {
            method: 'PUT',
            body: JSON.stringify(invoiceData),
        });
    };

    const remove = async (id) => {
        return await apiFetch(API_ENDPOINTS.invoices.delete(id), {
            method: 'DELETE',
        });
    };

    const getCount = async () => {
        return await apiFetch(API_ENDPOINTS.invoices.getCount);
    };

    return { getAll, getById, create, update, remove, getCount };
};

const usePurchaseOrders = () => {
    const getAll = async () => {
        return await apiFetch(API_ENDPOINTS.purchaseOrders.getAll);
    };

    const getById = async (id) => {
        return await apiFetch(API_ENDPOINTS.purchaseOrders.getById(id));
    };

    const create = async (purchaseOrderData) => {
        return await apiFetch(API_ENDPOINTS.purchaseOrders.create, {
            method: 'POST',
            body: JSON.stringify(purchaseOrderData),
        });
    };

    const update = async (id, purchaseOrderData) => {
        return await apiFetch(API_ENDPOINTS.purchaseOrders.update(id), {
            method: 'PUT',
            body: JSON.stringify(purchaseOrderData),
        });
    };

    const remove = async (id) => {
        return await apiFetch(API_ENDPOINTS.purchaseOrders.delete(id), {
            method: 'DELETE',
        });
    };

    const getCount = async () => {
        return await apiFetch(API_ENDPOINTS.purchaseOrders.getCount);
    };

    return { getAll, getById, create, update, remove, getCount };
};

const useOrderDetails = () => {
    const getAll = async () => {
        return await apiFetch(API_ENDPOINTS.orderDetails.getAll);
    };

    const getById = async (id) => {
        return await apiFetch(API_ENDPOINTS.orderDetails.getById(id));
    };

    const create = async (orderDetailsData) => {
        return await apiFetch(API_ENDPOINTS.orderDetails.create, {
            method: 'POST',
            body: JSON.stringify(orderDetailsData),
        });
    };

    const update = async (id, orderDetailsData) => {
        return await apiFetch(API_ENDPOINTS.orderDetails.update(id), {
            method: 'PUT',
            body: JSON.stringify(orderDetailsData),
        });
    };

    const remove = async (id) => {
        return await apiFetch(API_ENDPOINTS.orderDetails.delete(id), {
            method: 'DELETE',
        });
    };

    const getCount = async () => {
        return await apiFetch(API_ENDPOINTS.orderDetails.getCount);
    };

    return { getAll, getById, create, update, remove, getCount };
};

// Export hooks for use in main.js
window.useCustomers = useCustomers;
window.useProducts = useProducts;
window.useSuppliers = useSuppliers;
window.useEmployees = useEmployees;
window.useInvoices = useInvoices;
window.usePurchaseOrders = usePurchaseOrders;
window.useOrderDetails = useOrderDetails;
window.API_ENDPOINTS = API_ENDPOINTS;

