/**
 * Main Application Logic
 * Grocery Management System
 */

// Initialize hooks
const customersHook = useCustomers();
const productsHook = useProducts();
const suppliersHook = useSuppliers();
const employeesHook = useEmployees();
const invoicesHook = useInvoices();
const purchaseOrdersHook = usePurchaseOrders();
const orderDetailsHook = useOrderDetails();

// Navigation
document.addEventListener('DOMContentLoaded', () => {
    initializeNavigation();
    loadDashboard();
    
    // Initialize forms
    initializeForms();
    
    // Mobile menu toggle
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (hamburger) {
        hamburger.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });
    }
});

// Navigation
function initializeNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = link.getAttribute('data-page');
            switchPage(page);
            
            // Update active nav
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            
            // Close mobile menu
            document.querySelector('.nav-menu').classList.remove('active');
        });
    });
}

function switchPage(pageName) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    // Show selected page - page IDs match the pageName exactly
    const pageElement = document.getElementById(pageName);
    if (pageElement) {
        pageElement.classList.add('active');
        
        // Load data for the page
        switch(pageName) {
            case 'dashboard':
                loadDashboard();
                break;
            case 'customers':
                loadCustomers();
                break;
            case 'products':
                loadProducts();
                break;
            case 'suppliers':
                loadSuppliers();
                break;
            case 'employees':
                loadEmployees();
                break;
            case 'invoices':
                loadInvoices();
                break;
            case 'purchase-orders':
                loadPurchaseOrders();
                break;
            case 'order-details':
                loadOrderDetails();
                break;
        }
    }
}

// Dashboard
async function loadDashboard() {
    try {
        const [customers, products, suppliers, employees, invoices, purchaseOrders] = await Promise.all([
            customersHook.getCount(),
            productsHook.getCount(),
            suppliersHook.getCount(),
            employeesHook.getCount(),
            invoicesHook.getCount(),
            purchaseOrdersHook.getCount()
        ]);
        
        // Helper function to safely extract count with logging
        const getCount = (result, name) => {
            if (!result) {
                console.warn(`Dashboard: ${name} - No result returned`);
                return 0;
            }
            if (!result.success) {
                console.warn(`Dashboard: ${name} - Request failed:`, result.error);
                return 0;
            }
            if (!result.data) {
                console.warn(`Dashboard: ${name} - No data in response`);
                return 0;
            }
            const count = result.data.count ?? 0;
            console.log(`Dashboard: ${name} - Count: ${count}`);
            return count;
        };
        
        document.getElementById('stat-customers').textContent = getCount(customers, 'customers');
        document.getElementById('stat-products').textContent = getCount(products, 'products');
        document.getElementById('stat-suppliers').textContent = getCount(suppliers, 'suppliers');
        document.getElementById('stat-employees').textContent = getCount(employees, 'employees');
        document.getElementById('stat-invoices').textContent = getCount(invoices, 'invoices');
        document.getElementById('stat-purchase-orders').textContent = getCount(purchaseOrders, 'purchase-orders');
    } catch (error) {
        console.error('Error loading dashboard:', error);
        // Set defaults if API fails
        ['customers', 'products', 'suppliers', 'employees', 'invoices', 'purchase-orders'].forEach(stat => {
            document.getElementById(`stat-${stat}`).textContent = '0';
        });
    }
}

// Customers
async function loadCustomers() {
    const tbody = document.getElementById('customers-table-body');
    tbody.innerHTML = '<tr><td colspan="7" class="loading">Loading customers...</td></tr>';
    
    const result = await customersHook.getAll();
    
    if (result.success && result.data) {
        const customers = Array.isArray(result.data) ? result.data : result.data.customers || [];
        
        if (customers.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="empty">No customers found</td></tr>';
            return;
        }
        
        tbody.innerHTML = customers.map(customer => {
            const phones = Array.isArray(customer.phone) ? customer.phone.join(', ') : customer.phone || '';
            return `
                <tr>
                    <td>${customer.C_id || customer.id || ''}</td>
                    <td>${customer.name?.firstName || customer.firstName || ''}</td>
                    <td>${customer.name?.secondName || customer.secondName || ''}</td>
                    <td>${customer.email || ''}</td>
                    <td>${phones}</td>
                    <td>${customer.address || ''}</td>
                    <td>
                        <div class="btn-group">
                            <button class="btn btn-edit" onclick="editCustomer('${customer.C_id || customer.id}')">Edit</button>
                            <button class="btn btn-danger" onclick="deleteCustomer('${customer.C_id || customer.id}')">Delete</button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    } else {
        tbody.innerHTML = '<tr><td colspan="7" class="empty">Error loading customers. Please check API connection.</td></tr>';
    }
}

function openCustomerModal(id = null) {
    const modal = document.getElementById('customer-modal');
    const form = document.getElementById('customer-form');
    const title = document.getElementById('customer-modal-title');
    
    form.reset();
    document.getElementById('customer-id').value = id || '';
    title.textContent = id ? 'Edit Customer' : 'Add Customer';
    modal.classList.add('active');
    
    if (id) {
        loadCustomerForEdit(id);
    }
}

async function loadCustomerForEdit(id) {
    const result = await customersHook.getById(id);
    if (result.success && result.data) {
        const customer = result.data;
        document.getElementById('customer-id').value = customer.C_id || customer.id || '';
        document.getElementById('customer-first-name').value = customer.name?.firstName || customer.firstName || '';
        document.getElementById('customer-second-name').value = customer.name?.secondName || customer.secondName || '';
        document.getElementById('customer-email').value = customer.email || '';
        document.getElementById('customer-phone').value = Array.isArray(customer.phone) ? customer.phone.join(', ') : customer.phone || '';
        document.getElementById('customer-address').value = customer.address || '';
    }
}

function editCustomer(id) {
    openCustomerModal(id);
}

async function deleteCustomer(id) {
    if (!confirm('Are you sure you want to delete this customer?')) return;
    
    const result = await customersHook.remove(id);
    if (result.success) {
        alert('Customer deleted successfully');
        loadCustomers();
        loadDashboard();
    } else {
        alert('Error deleting customer: ' + result.error);
    }
}

// Products
async function loadProducts() {
    const tbody = document.getElementById('products-table-body');
    tbody.innerHTML = '<tr><td colspan="6" class="loading">Loading products...</td></tr>';
    
    const result = await productsHook.getAll();
    
    if (result.success && result.data) {
        const products = Array.isArray(result.data) ? result.data : result.data.products || [];
        
        if (products.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="empty">No products found</td></tr>';
            return;
        }
        
        tbody.innerHTML = products.map(product => `
            <tr>
                <td>${product.P_id || product.id || ''}</td>
                <td>${product.name || ''}</td>
                <td>${product.category || ''}</td>
                <td>${product.stock || 0}</td>
                <td>$${parseFloat(product.price || 0).toFixed(2)}</td>
                <td>
                    <div class="btn-group">
                        <button class="btn btn-edit" onclick="editProduct('${product.P_id || product.id}')">Edit</button>
                        <button class="btn btn-danger" onclick="deleteProduct('${product.P_id || product.id}')">Delete</button>
                    </div>
                </td>
            </tr>
        `).join('');
    } else {
        tbody.innerHTML = '<tr><td colspan="6" class="empty">Error loading products. Please check API connection.</td></tr>';
    }
}

function openProductModal(id = null) {
    const modal = document.getElementById('product-modal');
    const form = document.getElementById('product-form');
    const title = document.getElementById('product-modal-title');
    
    form.reset();
    document.getElementById('product-id').value = id || '';
    title.textContent = id ? 'Edit Product' : 'Add Product';
    modal.classList.add('active');
    
    if (id) {
        loadProductForEdit(id);
    }
}

async function loadProductForEdit(id) {
    const result = await productsHook.getById(id);
    if (result.success && result.data) {
        const product = result.data;
        document.getElementById('product-id').value = product.P_id || product.id || '';
        document.getElementById('product-name').value = product.name || '';
        document.getElementById('product-category').value = product.category || '';
        document.getElementById('product-stock').value = product.stock || 0;
        document.getElementById('product-price').value = product.price || 0;
    }
}

function editProduct(id) {
    openProductModal(id);
}

async function deleteProduct(id) {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    const result = await productsHook.remove(id);
    if (result.success) {
        alert('Product deleted successfully');
        loadProducts();
        loadDashboard();
    } else {
        alert('Error deleting product: ' + result.error);
    }
}

// Suppliers
async function loadSuppliers() {
    const tbody = document.getElementById('suppliers-table-body');
    tbody.innerHTML = '<tr><td colspan="6" class="loading">Loading suppliers...</td></tr>';
    
    const result = await suppliersHook.getAll();
    
    if (result.success && result.data) {
        const suppliers = Array.isArray(result.data) ? result.data : result.data.suppliers || [];
        
        if (suppliers.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="empty">No suppliers found</td></tr>';
            return;
        }
        
        tbody.innerHTML = suppliers.map(supplier => {
            const phones = Array.isArray(supplier.phone) ? supplier.phone.join(', ') : supplier.phone || '';
            return `
                <tr>
                    <td>${supplier.S_id || supplier.id || ''}</td>
                    <td>${supplier.name || ''}</td>
                    <td>${supplier.address || ''}</td>
                    <td>${supplier.email || ''}</td>
                    <td>${phones}</td>
                    <td>
                        <div class="btn-group">
                            <button class="btn btn-edit" onclick="editSupplier('${supplier.S_id || supplier.id}')">Edit</button>
                            <button class="btn btn-danger" onclick="deleteSupplier('${supplier.S_id || supplier.id}')">Delete</button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    } else {
        tbody.innerHTML = '<tr><td colspan="6" class="empty">Error loading suppliers. Please check API connection.</td></tr>';
    }
}

function openSupplierModal(id = null) {
    const modal = document.getElementById('supplier-modal');
    const form = document.getElementById('supplier-form');
    const title = document.getElementById('supplier-modal-title');
    
    form.reset();
    document.getElementById('supplier-id').value = id || '';
    title.textContent = id ? 'Edit Supplier' : 'Add Supplier';
    modal.classList.add('active');
    
    if (id) {
        loadSupplierForEdit(id);
    }
}

async function loadSupplierForEdit(id) {
    const result = await suppliersHook.getById(id);
    if (result.success && result.data) {
        const supplier = result.data;
        document.getElementById('supplier-id').value = supplier.S_id || supplier.id || '';
        document.getElementById('supplier-name').value = supplier.name || '';
        document.getElementById('supplier-address').value = supplier.address || '';
        document.getElementById('supplier-email').value = supplier.email || '';
        document.getElementById('supplier-phone').value = Array.isArray(supplier.phone) ? supplier.phone.join(', ') : supplier.phone || '';
    }
}

function editSupplier(id) {
    openSupplierModal(id);
}

async function deleteSupplier(id) {
    if (!confirm('Are you sure you want to delete this supplier?')) return;
    
    const result = await suppliersHook.remove(id);
    if (result.success) {
        alert('Supplier deleted successfully');
        loadSuppliers();
        loadDashboard();
    } else {
        alert('Error deleting supplier: ' + result.error);
    }
}

// Employees
async function loadEmployees() {
    const tbody = document.getElementById('employees-table-body');
    tbody.innerHTML = '<tr><td colspan="5" class="loading">Loading employees...</td></tr>';
    
    const result = await employeesHook.getAll();
    
    if (result.success && result.data) {
        const employees = Array.isArray(result.data) ? result.data : result.data.employees || [];
        
        if (employees.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="empty">No employees found</td></tr>';
            return;
        }
        
        tbody.innerHTML = employees.map(employee => {
            const phones = Array.isArray(employee.phone) ? employee.phone.join(', ') : employee.phone || '';
            return `
                <tr>
                    <td>${employee.E_id || employee.id || ''}</td>
                    <td>${employee.name || ''}</td>
                    <td>${employee.role || ''}</td>
                    <td>${phones}</td>
                    <td>
                        <div class="btn-group">
                            <button class="btn btn-edit" onclick="editEmployee('${employee.E_id || employee.id}')">Edit</button>
                            <button class="btn btn-danger" onclick="deleteEmployee('${employee.E_id || employee.id}')">Delete</button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    } else {
        tbody.innerHTML = '<tr><td colspan="5" class="empty">Error loading employees. Please check API connection.</td></tr>';
    }
}

function openEmployeeModal(id = null) {
    const modal = document.getElementById('employee-modal');
    const form = document.getElementById('employee-form');
    const title = document.getElementById('employee-modal-title');
    
    form.reset();
    document.getElementById('employee-id').value = id || '';
    title.textContent = id ? 'Edit Employee' : 'Add Employee';
    modal.classList.add('active');
    
    if (id) {
        loadEmployeeForEdit(id);
    }
}

async function loadEmployeeForEdit(id) {
    const result = await employeesHook.getById(id);
    if (result.success && result.data) {
        const employee = result.data;
        document.getElementById('employee-id').value = employee.E_id || employee.id || '';
        document.getElementById('employee-name').value = employee.name || '';
        document.getElementById('employee-role').value = employee.role || '';
        document.getElementById('employee-phone').value = Array.isArray(employee.phone) ? employee.phone.join(', ') : employee.phone || '';
    }
}

function editEmployee(id) {
    openEmployeeModal(id);
}

async function deleteEmployee(id) {
    if (!confirm('Are you sure you want to delete this employee?')) return;
    
    const result = await employeesHook.remove(id);
    if (result.success) {
        alert('Employee deleted successfully');
        loadEmployees();
        loadDashboard();
    } else {
        alert('Error deleting employee: ' + result.error);
    }
}

// Invoices
async function loadInvoices() {
    const tbody = document.getElementById('invoices-table-body');
    tbody.innerHTML = '<tr><td colspan="5" class="loading">Loading invoices...</td></tr>';
    
    const result = await invoicesHook.getAll();
    
    if (result.success && result.data) {
        const invoices = Array.isArray(result.data) ? result.data : result.data.invoices || [];
        
        if (invoices.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="empty">No invoices found</td></tr>';
            return;
        }
        
        tbody.innerHTML = invoices.map(invoice => `
            <tr>
                <td>${invoice.Lid || invoice.id || ''}</td>
                <td>${invoice.date || ''}</td>
                <td>$${parseFloat(invoice.amount || 0).toFixed(2)}</td>
                <td>${invoice.paymentMethod || invoice.payment_method || ''}</td>
                <td>
                    <div class="btn-group">
                        <button class="btn btn-edit" onclick="editInvoice('${invoice.Lid || invoice.id}')">Edit</button>
                        <button class="btn btn-danger" onclick="deleteInvoice('${invoice.Lid || invoice.id}')">Delete</button>
                    </div>
                </td>
            </tr>
        `).join('');
    } else {
        tbody.innerHTML = '<tr><td colspan="5" class="empty">Error loading invoices. Please check API connection.</td></tr>';
    }
}

function openInvoiceModal(id = null) {
    const modal = document.getElementById('invoice-modal');
    const form = document.getElementById('invoice-form');
    const title = document.getElementById('invoice-modal-title');
    
    form.reset();
    document.getElementById('invoice-id').value = id || '';
    title.textContent = id ? 'Edit Invoice' : 'Add Invoice';
    modal.classList.add('active');
    
    if (id) {
        loadInvoiceForEdit(id);
    }
}

async function loadInvoiceForEdit(id) {
    const result = await invoicesHook.getById(id);
    if (result.success && result.data) {
        const invoice = result.data;
        document.getElementById('invoice-id').value = invoice.Lid || invoice.id || '';
        document.getElementById('invoice-date').value = invoice.date || '';
        document.getElementById('invoice-amount').value = invoice.amount || 0;
        document.getElementById('invoice-payment-method').value = invoice.paymentMethod || invoice.payment_method || '';
    }
}

function editInvoice(id) {
    openInvoiceModal(id);
}

async function deleteInvoice(id) {
    if (!confirm('Are you sure you want to delete this invoice?')) return;
    
    const result = await invoicesHook.remove(id);
    if (result.success) {
        alert('Invoice deleted successfully');
        loadInvoices();
        loadDashboard();
    } else {
        alert('Error deleting invoice: ' + result.error);
    }
}

// Purchase Orders
async function loadPurchaseOrders() {
    const tbody = document.getElementById('purchase-orders-table-body');
    tbody.innerHTML = '<tr><td colspan="4" class="loading">Loading purchase orders...</td></tr>';
    
    const result = await purchaseOrdersHook.getAll();
    
    if (result.success && result.data) {
        const purchaseOrders = Array.isArray(result.data) ? result.data : result.data.purchaseOrders || [];
        
        if (purchaseOrders.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" class="empty">No purchase orders found</td></tr>';
            return;
        }
        
        tbody.innerHTML = purchaseOrders.map(po => `
            <tr>
                <td>${po.Purchase_id || po.PurchaseId || po.id || ''}</td>
                <td>${po.date || ''}</td>
                <td>$${parseFloat(po.amount || 0).toFixed(2)}</td>
                <td>
                    <div class="btn-group">
                        <button class="btn btn-edit" onclick="editPurchaseOrder('${po.Purchase_id || po.PurchaseId || po.id}')">Edit</button>
                        <button class="btn btn-danger" onclick="deletePurchaseOrder('${po.Purchase_id || po.PurchaseId || po.id}')">Delete</button>
                    </div>
                </td>
            </tr>
        `).join('');
    } else {
        tbody.innerHTML = '<tr><td colspan="4" class="empty">Error loading purchase orders. Please check API connection.</td></tr>';
    }
}

function openPurchaseOrderModal(id = null) {
    const modal = document.getElementById('purchase-order-modal');
    const form = document.getElementById('purchase-order-form');
    const title = document.getElementById('purchase-order-modal-title');
    
    form.reset();
    document.getElementById('purchase-order-id').value = id || '';
    title.textContent = id ? 'Edit Purchase Order' : 'Add Purchase Order';
    modal.classList.add('active');
    
    if (id) {
        loadPurchaseOrderForEdit(id);
    }
}

async function loadPurchaseOrderForEdit(id) {
    const result = await purchaseOrdersHook.getById(id);
    if (result.success && result.data) {
        const po = result.data;
        document.getElementById('purchase-order-id').value = po.Purchase_id || po.PurchaseId || po.id || '';
        document.getElementById('purchase-order-date').value = po.date || '';
        document.getElementById('purchase-order-amount').value = po.amount || 0;
    }
}

function editPurchaseOrder(id) {
    openPurchaseOrderModal(id);
}

async function deletePurchaseOrder(id) {
    if (!confirm('Are you sure you want to delete this purchase order?')) return;
    
    const result = await purchaseOrdersHook.remove(id);
    if (result.success) {
        alert('Purchase order deleted successfully');
        loadPurchaseOrders();
        loadDashboard();
    } else {
        alert('Error deleting purchase order: ' + result.error);
    }
}

// Order Details
async function loadOrderDetails() {
    const tbody = document.getElementById('order-details-table-body');
    tbody.innerHTML = '<tr><td colspan="4" class="loading">Loading order details...</td></tr>';
    
    const result = await orderDetailsHook.getAll();
    
    if (result.success && result.data) {
        const orderDetails = Array.isArray(result.data) ? result.data : result.data.orderDetails || [];
        
        if (orderDetails.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" class="empty">No order details found</td></tr>';
            return;
        }
        
        tbody.innerHTML = orderDetails.map(od => `
            <tr>
                <td>${od.Order_Id || od.OrderId || od.id || ''}</td>
                <td>${od.quantity || 0}</td>
                <td>$${parseFloat(od.cost || 0).toFixed(2)}</td>
                <td>
                    <div class="btn-group">
                        <button class="btn btn-edit" onclick="editOrderDetails('${od.Order_Id || od.OrderId || od.id}')">Edit</button>
                        <button class="btn btn-danger" onclick="deleteOrderDetails('${od.Order_Id || od.OrderId || od.id}')">Delete</button>
                    </div>
                </td>
            </tr>
        `).join('');
    } else {
        tbody.innerHTML = '<tr><td colspan="4" class="empty">Error loading order details. Please check API connection.</td></tr>';
    }
}

function openOrderDetailsModal(id = null) {
    const modal = document.getElementById('order-details-modal');
    const form = document.getElementById('order-details-form');
    const title = document.getElementById('order-details-modal-title');
    
    form.reset();
    document.getElementById('order-details-id').value = id || '';
    title.textContent = id ? 'Edit Order Detail' : 'Add Order Detail';
    modal.classList.add('active');
    
    if (id) {
        loadOrderDetailsForEdit(id);
    }
}

async function loadOrderDetailsForEdit(id) {
    const result = await orderDetailsHook.getById(id);
    if (result.success && result.data) {
        const od = result.data;
        document.getElementById('order-details-id').value = od.Order_Id || od.OrderId || od.id || '';
        document.getElementById('order-details-order-id').value = od.Order_Id || od.OrderId || od.id || '';
        document.getElementById('order-details-quantity').value = od.quantity || 0;
        document.getElementById('order-details-cost').value = od.cost || 0;
    }
}

function editOrderDetails(id) {
    openOrderDetailsModal(id);
}

async function deleteOrderDetails(id) {
    if (!confirm('Are you sure you want to delete this order detail?')) return;
    
    const result = await orderDetailsHook.remove(id);
    if (result.success) {
        alert('Order detail deleted successfully');
        loadOrderDetails();
        loadDashboard();
    } else {
        alert('Error deleting order detail: ' + result.error);
    }
}

// Modal functions
function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        if (event.target === modal) {
            modal.classList.remove('active');
        }
    });
}

// Initialize forms
function initializeForms() {
    // Customer form
    document.getElementById('customer-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('customer-id').value;
        const customerData = {
            name: {
                firstName: document.getElementById('customer-first-name').value,
                secondName: document.getElementById('customer-second-name').value
            },
            email: document.getElementById('customer-email').value,
            phone: document.getElementById('customer-phone').value.split(',').map(p => p.trim()),
            address: document.getElementById('customer-address').value
        };
        
        const result = id ? await customersHook.update(id, customerData) : await customersHook.create(customerData);
        
        if (result.success) {
            alert(id ? 'Customer updated successfully' : 'Customer created successfully');
            closeModal('customer-modal');
            loadCustomers();
            loadDashboard();
        } else {
            alert('Error: ' + result.error);
        }
    });
    
    // Product form
    document.getElementById('product-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('product-id').value;
        const productData = {
            name: document.getElementById('product-name').value,
            category: document.getElementById('product-category').value,
            stock: parseInt(document.getElementById('product-stock').value),
            price: parseFloat(document.getElementById('product-price').value)
        };
        
        const result = id ? await productsHook.update(id, productData) : await productsHook.create(productData);
        
        if (result.success) {
            alert(id ? 'Product updated successfully' : 'Product created successfully');
            closeModal('product-modal');
            loadProducts();
            loadDashboard();
        } else {
            alert('Error: ' + result.error);
        }
    });
    
    // Supplier form
    document.getElementById('supplier-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('supplier-id').value;
        const supplierData = {
            name: document.getElementById('supplier-name').value,
            address: document.getElementById('supplier-address').value,
            email: document.getElementById('supplier-email').value,
            phone: document.getElementById('supplier-phone').value.split(',').map(p => p.trim())
        };
        
        const result = id ? await suppliersHook.update(id, supplierData) : await suppliersHook.create(supplierData);
        
        if (result.success) {
            alert(id ? 'Supplier updated successfully' : 'Supplier created successfully');
            closeModal('supplier-modal');
            loadSuppliers();
            loadDashboard();
        } else {
            alert('Error: ' + result.error);
        }
    });
    
    // Employee form
    document.getElementById('employee-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('employee-id').value;
        const employeeData = {
            name: document.getElementById('employee-name').value,
            role: document.getElementById('employee-role').value,
            phone: document.getElementById('employee-phone').value.split(',').map(p => p.trim())
        };
        
        const result = id ? await employeesHook.update(id, employeeData) : await employeesHook.create(employeeData);
        
        if (result.success) {
            alert(id ? 'Employee updated successfully' : 'Employee created successfully');
            closeModal('employee-modal');
            loadEmployees();
            loadDashboard();
        } else {
            alert('Error: ' + result.error);
        }
    });
    
    // Invoice form
    document.getElementById('invoice-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('invoice-id').value;
        const invoiceData = {
            date: document.getElementById('invoice-date').value,
            amount: parseFloat(document.getElementById('invoice-amount').value),
            paymentMethod: document.getElementById('invoice-payment-method').value
        };
        
        const result = id ? await invoicesHook.update(id, invoiceData) : await invoicesHook.create(invoiceData);
        
        if (result.success) {
            alert(id ? 'Invoice updated successfully' : 'Invoice created successfully');
            closeModal('invoice-modal');
            loadInvoices();
            loadDashboard();
        } else {
            alert('Error: ' + result.error);
        }
    });
    
    // Purchase Order form
    document.getElementById('purchase-order-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('purchase-order-id').value;
        const purchaseOrderData = {
            date: document.getElementById('purchase-order-date').value,
            amount: parseFloat(document.getElementById('purchase-order-amount').value)
        };
        
        const result = id ? await purchaseOrdersHook.update(id, purchaseOrderData) : await purchaseOrdersHook.create(purchaseOrderData);
        
        if (result.success) {
            alert(id ? 'Purchase order updated successfully' : 'Purchase order created successfully');
            closeModal('purchase-order-modal');
            loadPurchaseOrders();
            loadDashboard();
        } else {
            alert('Error: ' + result.error);
        }
    });
    
    // Order Details form
    document.getElementById('order-details-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('order-details-id').value;
        const orderDetailsData = {
            Order_Id: document.getElementById('order-details-order-id').value,
            quantity: parseInt(document.getElementById('order-details-quantity').value),
            cost: parseFloat(document.getElementById('order-details-cost').value)
        };
        
        const result = id ? await orderDetailsHook.update(id, orderDetailsData) : await orderDetailsHook.create(orderDetailsData);
        
        if (result.success) {
            alert(id ? 'Order detail updated successfully' : 'Order detail created successfully');
            closeModal('order-details-modal');
            loadOrderDetails();
            loadDashboard();
        } else {
            alert('Error: ' + result.error);
        }
    });
}

// Make functions globally available
window.switchPage = switchPage;
window.openCustomerModal = openCustomerModal;
window.editCustomer = editCustomer;
window.deleteCustomer = deleteCustomer;
window.openProductModal = openProductModal;
window.editProduct = editProduct;
window.deleteProduct = deleteProduct;
window.openSupplierModal = openSupplierModal;
window.editSupplier = editSupplier;
window.deleteSupplier = deleteSupplier;
window.openEmployeeModal = openEmployeeModal;
window.editEmployee = editEmployee;
window.deleteEmployee = deleteEmployee;
window.openInvoiceModal = openInvoiceModal;
window.editInvoice = editInvoice;
window.deleteInvoice = deleteInvoice;
window.openPurchaseOrderModal = openPurchaseOrderModal;
window.editPurchaseOrder = editPurchaseOrder;
window.deletePurchaseOrder = deletePurchaseOrder;
window.openOrderDetailsModal = openOrderDetailsModal;
window.editOrderDetails = editOrderDetails;
window.deleteOrderDetails = deleteOrderDetails;
window.closeModal = closeModal;

