from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional, List
import psycopg2
import psycopg2.extras
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

# ---------------------- DATABASE CONNECTION ----------------------

def get_connection():
    return psycopg2.connect(
        host="localhost",
        database="Grocery",
        user="postgres",
        password="Sector@20",
        port=5432
    )

# ---------------------- FASTAPI SETUP ----------------------

app = FastAPI(title="PostgreSQL API", description="API to manage database tables", version="1.0")

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------- PYDANTIC MODELS ----------------------

# Frontend request models
class CustomerName(BaseModel):
    firstName: str
    secondName: str

class CustomerRequest(BaseModel):
    name: CustomerName
    email: str
    phone: List[str]
    address: str

class ProductRequest(BaseModel):
    name: str
    category: str
    stock: int
    price: float
    s_id: Optional[int] = None

class SupplierRequest(BaseModel):
    name: str
    address: str
    email: str
    phone: List[str]

class EmployeeRequest(BaseModel):
    name: str
    role: str
    phone: List[str]

class InvoiceRequest(BaseModel):
    date: str
    amount: float
    paymentMethod: str
    c_id: Optional[int] = None
    e_id: Optional[int] = None

class PurchaseOrderRequest(BaseModel):
    date: str
    amount: float
    s_id: Optional[int] = None

class OrderDetailsRequest(BaseModel):
    Order_Id: str
    quantity: int
    cost: float
    i_id: Optional[int] = None
    p_id: Optional[int] = None

# ---------------------- HELPER FUNCTIONS ----------------------

def transform_customer_to_frontend(row):
    """Transform database row to frontend format"""
    phone_str = row.get('phone', '')
    phone_list = phone_str.split(',') if phone_str else []
    phone_list = [p.strip() for p in phone_list if p.strip()]
    
    return {
        "C_id": str(row.get('c_id', '')),
        "name": {
            "firstName": row.get('first_name', ''),
            "secondName": row.get('second_name', '')
        },
        "email": row.get('email', ''),
        "phone": phone_list if phone_list else [phone_str] if phone_str else [],
        "address": row.get('address', '')
    }

def transform_product_to_frontend(row):
    """Transform database row to frontend format"""
    return {
        "P_id": str(row.get('p_id', '')),
        "name": row.get('name', ''),
        "category": row.get('category', ''),
        "stock": row.get('stock', 0),
        "price": float(row.get('price', 0))
    }

def transform_supplier_to_frontend(row):
    """Transform database row to frontend format"""
    phone_str = row.get('phone', '')
    phone_list = phone_str.split(',') if phone_str else []
    phone_list = [p.strip() for p in phone_list if p.strip()]
    
    return {
        "S_id": str(row.get('s_id', '')),
        "name": row.get('name', ''),
        "address": row.get('address', ''),
        "email": row.get('email', ''),
        "phone": phone_list if phone_list else [phone_str] if phone_str else []
    }

def transform_employee_to_frontend(row):
    """Transform database row to frontend format"""
    phone_str = row.get('phone', '')
    phone_list = phone_str.split(',') if phone_str else []
    phone_list = [p.strip() for p in phone_list if p.strip()]
    
    return {
        "E_id": str(row.get('e_id', '')),
        "name": row.get('name', ''),
        "role": row.get('role', ''),
        "phone": phone_list if phone_list else [phone_str] if phone_str else []
    }

def transform_invoice_to_frontend(row):
    """Transform database row to frontend format"""
    return {
        "Lid": str(row.get('i_id', '')),
        "date": str(row.get('date', '')),
        "amount": float(row.get('amount', 0)),
        "paymentMethod": row.get('payment_method', '') or row.get('paymentMethod', '')
    }

def transform_purchase_order_to_frontend(row):
    """Transform database row to frontend format"""
    return {
        "Purchase_id": str(row.get('purchase_id', '')),
        "date": str(row.get('date', '')),
        "amount": float(row.get('amount', 0))
    }

def transform_order_details_to_frontend(row):
    """Transform database row to frontend format"""
    return {
        "Order_Id": str(row.get('order_id', '')),
        "quantity": row.get('quantity', 0),
        "cost": float(row.get('cost', 0))
    }

# ---------------------- ROUTES ----------------------

@app.get("/")
def root():
    return {"message": "PostgreSQL API is running!"}

@app.get("/api")
def api_root():
    return {"message": "API is running!"}

@app.get("/api/test-db")
def test_db_connection():
    try:
        conn = get_connection()
        cur = conn.cursor()
        cur.execute('SELECT version();')
        db_version = cur.fetchone()
        cur.close()
        conn.close()
        return {
            "status": "success",
            "message": "Database connection successful",
            "database_version": db_version[0]
        }
    except Exception as e:
        return {
            "status": "error",
            "message": f"Database connection failed: {str(e)}"
        }

# ==================== CUSTOMER ENDPOINTS ====================

@app.get("/api/customers")
def get_customers():
    conn = get_connection()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    try:
        cur.execute("SELECT * FROM customer ORDER BY c_id;")
        rows = cur.fetchall()
        customers = [transform_customer_to_frontend(row) for row in rows]
        return customers
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cur.close()
        conn.close()

@app.get("/api/customers/count")
def get_customer_count():
    conn = get_connection()
    cur = conn.cursor()
    try:
        cur.execute("SELECT COUNT(*) FROM customer;")
        count = cur.fetchone()[0]
        return {"count": count}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cur.close()
        conn.close()

@app.get("/api/customers/{customer_id}")
def get_customer_by_id(customer_id: int):
    conn = get_connection()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    try:
        cur.execute("SELECT * FROM customer WHERE c_id = %s;", (customer_id,))
        row = cur.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Customer not found")
        return transform_customer_to_frontend(row)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cur.close()
        conn.close()

@app.post("/api/customers")
def create_customer(customer: CustomerRequest):
    conn = get_connection()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    try:
        phone_str = ', '.join(customer.phone) if customer.phone else ''
        cur.execute("""
            INSERT INTO customer (first_name, second_name, email, phone, address)
            VALUES (%s, %s, %s, %s, %s)
            RETURNING *;
        """, (customer.name.firstName, customer.name.secondName, customer.email, phone_str, customer.address))
        row = cur.fetchone()
        conn.commit()
        return transform_customer_to_frontend(row)
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        cur.close()
        conn.close()

@app.put("/api/customers/{customer_id}")
def update_customer(customer_id: int, customer: CustomerRequest):
    conn = get_connection()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    try:
        phone_str = ', '.join(customer.phone) if customer.phone else ''
        cur.execute("""
            UPDATE customer 
            SET first_name = %s, second_name = %s, email = %s, phone = %s, address = %s
            WHERE c_id = %s
            RETURNING *;
        """, (customer.name.firstName, customer.name.secondName, customer.email, phone_str, customer.address, customer_id))
        row = cur.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Customer not found")
        conn.commit()
        return transform_customer_to_frontend(row)
    except HTTPException:
        raise
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        cur.close()
        conn.close()

@app.delete("/api/customers/{customer_id}")
def delete_customer(customer_id: int):
    conn = get_connection()
    cur = conn.cursor()
    try:
        cur.execute("DELETE FROM customer WHERE c_id = %s RETURNING c_id;", (customer_id,))
        result = cur.fetchone()
        if not result:
            raise HTTPException(status_code=404, detail="Customer not found")
        conn.commit()
        return {"message": "Customer deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        cur.close()
        conn.close()

# ==================== PRODUCT ENDPOINTS ====================

@app.get("/api/products")
def get_products():
    conn = get_connection()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    try:
        cur.execute("SELECT * FROM product ORDER BY p_id;")
        rows = cur.fetchall()
        products = [transform_product_to_frontend(row) for row in rows]
        return products
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cur.close()
        conn.close()

@app.get("/api/products/count")
def get_product_count():
    conn = get_connection()
    cur = conn.cursor()
    try:
        cur.execute("SELECT COUNT(*) FROM product;")
        count = cur.fetchone()[0]
        return {"count": count}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cur.close()
        conn.close()

@app.get("/api/products/{product_id}")
def get_product_by_id(product_id: int):
    conn = get_connection()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    try:
        cur.execute("SELECT * FROM product WHERE p_id = %s;", (product_id,))
        row = cur.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Product not found")
        return transform_product_to_frontend(row)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cur.close()
        conn.close()

@app.post("/api/products")
def create_product(product: ProductRequest):
    conn = get_connection()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    try:
        s_id = product.s_id if product.s_id else None
        cur.execute("""
            INSERT INTO product (name, category, stock, price, s_id)
            VALUES (%s, %s, %s, %s, %s)
            RETURNING *;
        """, (product.name, product.category, product.stock, product.price, s_id))
        row = cur.fetchone()
        conn.commit()
        return transform_product_to_frontend(row)
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        cur.close()
        conn.close()

@app.put("/api/products/{product_id}")
def update_product(product_id: int, product: ProductRequest):
    conn = get_connection()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    try:
        s_id = product.s_id if product.s_id else None
        cur.execute("""
            UPDATE product 
            SET name = %s, category = %s, stock = %s, price = %s, s_id = %s
            WHERE p_id = %s
            RETURNING *;
        """, (product.name, product.category, product.stock, product.price, s_id, product_id))
        row = cur.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Product not found")
        conn.commit()
        return transform_product_to_frontend(row)
    except HTTPException:
        raise
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        cur.close()
        conn.close()

@app.delete("/api/products/{product_id}")
def delete_product(product_id: int):
    conn = get_connection()
    cur = conn.cursor()
    try:
        cur.execute("DELETE FROM product WHERE p_id = %s RETURNING p_id;", (product_id,))
        result = cur.fetchone()
        if not result:
            raise HTTPException(status_code=404, detail="Product not found")
        conn.commit()
        return {"message": "Product deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        cur.close()
        conn.close()

# ==================== SUPPLIER ENDPOINTS ====================

@app.get("/api/suppliers")
def get_suppliers():
    conn = get_connection()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    try:
        cur.execute("SELECT * FROM supplier ORDER BY s_id;")
        rows = cur.fetchall()
        suppliers = [transform_supplier_to_frontend(row) for row in rows]
        return suppliers
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cur.close()
        conn.close()

@app.get("/api/suppliers/count")
def get_supplier_count():
    conn = get_connection()
    cur = conn.cursor()
    try:
        cur.execute("SELECT COUNT(*) FROM supplier;")
        count = cur.fetchone()[0]
        return {"count": count}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cur.close()
        conn.close()

@app.get("/api/suppliers/{supplier_id}")
def get_supplier_by_id(supplier_id: int):
    conn = get_connection()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    try:
        cur.execute("SELECT * FROM supplier WHERE s_id = %s;", (supplier_id,))
        row = cur.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Supplier not found")
        return transform_supplier_to_frontend(row)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cur.close()
        conn.close()

@app.post("/api/suppliers")
def create_supplier(supplier: SupplierRequest):
    conn = get_connection()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    try:
        phone_str = ', '.join(supplier.phone) if supplier.phone else ''
        cur.execute("""
            INSERT INTO supplier (name, address, email, phone)
            VALUES (%s, %s, %s, %s)
            RETURNING *;
        """, (supplier.name, supplier.address, supplier.email, phone_str))
        row = cur.fetchone()
        conn.commit()
        return transform_supplier_to_frontend(row)
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        cur.close()
        conn.close()

@app.put("/api/suppliers/{supplier_id}")
def update_supplier(supplier_id: int, supplier: SupplierRequest):
    conn = get_connection()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    try:
        phone_str = ', '.join(supplier.phone) if supplier.phone else ''
        cur.execute("""
            UPDATE supplier 
            SET name = %s, address = %s, email = %s, phone = %s
            WHERE s_id = %s
            RETURNING *;
        """, (supplier.name, supplier.address, supplier.email, phone_str, supplier_id))
        row = cur.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Supplier not found")
        conn.commit()
        return transform_supplier_to_frontend(row)
    except HTTPException:
        raise
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        cur.close()
        conn.close()

@app.delete("/api/suppliers/{supplier_id}")
def delete_supplier(supplier_id: int):
    conn = get_connection()
    cur = conn.cursor()
    try:
        cur.execute("DELETE FROM supplier WHERE s_id = %s RETURNING s_id;", (supplier_id,))
        result = cur.fetchone()
        if not result:
            raise HTTPException(status_code=404, detail="Supplier not found")
        conn.commit()
        return {"message": "Supplier deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        cur.close()
        conn.close()

# ==================== EMPLOYEE ENDPOINTS ====================

@app.get("/api/employees")
def get_employees():
    conn = get_connection()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    try:
        cur.execute("SELECT * FROM employee ORDER BY e_id;")
        rows = cur.fetchall()
        employees = [transform_employee_to_frontend(row) for row in rows]
        return employees
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cur.close()
        conn.close()

@app.get("/api/employees/count")
def get_employee_count():
    conn = get_connection()
    cur = conn.cursor()
    try:
        cur.execute("SELECT COUNT(*) FROM employee;")
        count = cur.fetchone()[0]
        return {"count": count}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cur.close()
        conn.close()

@app.get("/api/employees/{employee_id}")
def get_employee_by_id(employee_id: int):
    conn = get_connection()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    try:
        cur.execute("SELECT * FROM employee WHERE e_id = %s;", (employee_id,))
        row = cur.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Employee not found")
        return transform_employee_to_frontend(row)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cur.close()
        conn.close()

@app.post("/api/employees")
def create_employee(employee: EmployeeRequest):
    conn = get_connection()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    try:
        phone_str = ', '.join(employee.phone) if employee.phone else ''
        cur.execute("""
            INSERT INTO employee (name, role, phone)
            VALUES (%s, %s, %s)
            RETURNING *;
        """, (employee.name, employee.role, phone_str))
        row = cur.fetchone()
        conn.commit()
        return transform_employee_to_frontend(row)
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        cur.close()
        conn.close()

@app.put("/api/employees/{employee_id}")
def update_employee(employee_id: int, employee: EmployeeRequest):
    conn = get_connection()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    try:
        phone_str = ', '.join(employee.phone) if employee.phone else ''
        cur.execute("""
            UPDATE employee 
            SET name = %s, role = %s, phone = %s
            WHERE e_id = %s
            RETURNING *;
        """, (employee.name, employee.role, phone_str, employee_id))
        row = cur.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Employee not found")
        conn.commit()
        return transform_employee_to_frontend(row)
    except HTTPException:
        raise
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        cur.close()
        conn.close()

@app.delete("/api/employees/{employee_id}")
def delete_employee(employee_id: int):
    conn = get_connection()
    cur = conn.cursor()
    try:
        cur.execute("DELETE FROM employee WHERE e_id = %s RETURNING e_id;", (employee_id,))
        result = cur.fetchone()
        if not result:
            raise HTTPException(status_code=404, detail="Employee not found")
        conn.commit()
        return {"message": "Employee deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        cur.close()
        conn.close()

# ==================== INVOICE ENDPOINTS ====================

@app.get("/api/invoices")
def get_invoices():
    conn = get_connection()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    try:
        cur.execute("SELECT * FROM invoice ORDER BY i_id;")
        rows = cur.fetchall()
        invoices = [transform_invoice_to_frontend(row) for row in rows]
        return invoices
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cur.close()
        conn.close()

@app.get("/api/invoices/count")
def get_invoice_count():
    conn = get_connection()
    cur = conn.cursor()
    try:
        cur.execute("SELECT COUNT(*) FROM invoice;")
        count = cur.fetchone()[0]
        return {"count": count}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cur.close()
        conn.close()

@app.get("/api/invoices/{invoice_id}")
def get_invoice_by_id(invoice_id: int):
    conn = get_connection()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    try:
        cur.execute("SELECT * FROM invoice WHERE i_id = %s;", (invoice_id,))
        row = cur.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Invoice not found")
        return transform_invoice_to_frontend(row)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cur.close()
        conn.close()

@app.post("/api/invoices")
def create_invoice(invoice: InvoiceRequest):
    conn = get_connection()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    try:
        cur.execute("""
            INSERT INTO invoice (date, amount, payment_method, c_id, e_id)
            VALUES (%s, %s, %s, %s, %s)
            RETURNING *;
        """, (invoice.date, invoice.amount, invoice.paymentMethod, invoice.c_id, invoice.e_id))
        row = cur.fetchone()
        conn.commit()
        return transform_invoice_to_frontend(row)
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        cur.close()
        conn.close()

@app.put("/api/invoices/{invoice_id}")
def update_invoice(invoice_id: int, invoice: InvoiceRequest):
    conn = get_connection()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    try:
        cur.execute("""
            UPDATE invoice 
            SET date = %s, amount = %s, payment_method = %s, c_id = %s, e_id = %s
            WHERE i_id = %s
            RETURNING *;
        """, (invoice.date, invoice.amount, invoice.paymentMethod, invoice.c_id, invoice.e_id, invoice_id))
        row = cur.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Invoice not found")
        conn.commit()
        return transform_invoice_to_frontend(row)
    except HTTPException:
        raise
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        cur.close()
        conn.close()

@app.delete("/api/invoices/{invoice_id}")
def delete_invoice(invoice_id: int):
    conn = get_connection()
    cur = conn.cursor()
    try:
        cur.execute("DELETE FROM invoice WHERE i_id = %s RETURNING i_id;", (invoice_id,))
        result = cur.fetchone()
        if not result:
            raise HTTPException(status_code=404, detail="Invoice not found")
        conn.commit()
        return {"message": "Invoice deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        cur.close()
        conn.close()

# ==================== PURCHASE ORDER ENDPOINTS ====================

@app.get("/api/purchase-orders")
def get_purchase_orders():
    conn = get_connection()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    try:
        cur.execute("SELECT * FROM purchaseorder ORDER BY purchase_id;")
        rows = cur.fetchall()
        purchase_orders = [transform_purchase_order_to_frontend(row) for row in rows]
        return purchase_orders
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cur.close()
        conn.close()

@app.get("/api/purchase-orders/count")
def get_purchase_order_count():
    conn = get_connection()
    cur = conn.cursor()
    try:
        cur.execute("SELECT COUNT(*) FROM purchaseorder;")
        count = cur.fetchone()[0]
        return {"count": count}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cur.close()
        conn.close()

@app.get("/api/purchase-orders/{purchase_order_id}")
def get_purchase_order_by_id(purchase_order_id: int):
    conn = get_connection()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    try:
        cur.execute("SELECT * FROM purchaseorder WHERE purchase_id = %s;", (purchase_order_id,))
        row = cur.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Purchase order not found")
        return transform_purchase_order_to_frontend(row)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cur.close()
        conn.close()

@app.post("/api/purchase-orders")
def create_purchase_order(purchase_order: PurchaseOrderRequest):
    conn = get_connection()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    try:
        cur.execute("""
            INSERT INTO purchaseorder (date, amount, s_id)
            VALUES (%s, %s, %s)
            RETURNING *;
        """, (purchase_order.date, purchase_order.amount, purchase_order.s_id))
        row = cur.fetchone()
        conn.commit()
        return transform_purchase_order_to_frontend(row)
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        cur.close()
        conn.close()

@app.put("/api/purchase-orders/{purchase_order_id}")
def update_purchase_order(purchase_order_id: int, purchase_order: PurchaseOrderRequest):
    conn = get_connection()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    try:
        cur.execute("""
            UPDATE purchaseorder 
            SET date = %s, amount = %s, s_id = %s
            WHERE purchase_id = %s
            RETURNING *;
        """, (purchase_order.date, purchase_order.amount, purchase_order.s_id, purchase_order_id))
        row = cur.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Purchase order not found")
        conn.commit()
        return transform_purchase_order_to_frontend(row)
    except HTTPException:
        raise
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        cur.close()
        conn.close()

@app.delete("/api/purchase-orders/{purchase_order_id}")
def delete_purchase_order(purchase_order_id: int):
    conn = get_connection()
    cur = conn.cursor()
    try:
        cur.execute("DELETE FROM purchaseorder WHERE purchase_id = %s RETURNING purchase_id;", (purchase_order_id,))
        result = cur.fetchone()
        if not result:
            raise HTTPException(status_code=404, detail="Purchase order not found")
        conn.commit()
        return {"message": "Purchase order deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        cur.close()
        conn.close()

# ==================== ORDER DETAILS ENDPOINTS ====================

@app.get("/api/order-details")
def get_order_details():
    conn = get_connection()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    try:
        cur.execute("SELECT * FROM orderdetails ORDER BY order_id;")
        rows = cur.fetchall()
        order_details = [transform_order_details_to_frontend(row) for row in rows]
        return order_details
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cur.close()
        conn.close()

@app.get("/api/order-details/count")
def get_order_detail_count():
    conn = get_connection()
    cur = conn.cursor()
    try:
        cur.execute("SELECT COUNT(*) FROM orderdetails;")
        count = cur.fetchone()[0]
        return {"count": count}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cur.close()
        conn.close()

@app.get("/api/order-details/{order_id}")
def get_order_detail_by_id(order_id: int):
    conn = get_connection()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    try:
        cur.execute("SELECT * FROM orderdetails WHERE order_id = %s;", (order_id,))
        row = cur.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Order detail not found")
        return transform_order_details_to_frontend(row)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cur.close()
        conn.close()

@app.post("/api/order-details")
def create_order_detail(order_detail: OrderDetailsRequest):
    conn = get_connection()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    try:
        # Convert Order_Id string to int if it's numeric
        order_id = int(order_detail.Order_Id) if order_detail.Order_Id.isdigit() else None
        if order_id is None:
            raise HTTPException(status_code=400, detail="Order_Id must be a valid integer")
        
        cur.execute("""
            INSERT INTO orderdetails (order_id, quantity, cost, i_id, p_id)
            VALUES (%s, %s, %s, %s, %s)
            RETURNING *;
        """, (order_id, order_detail.quantity, order_detail.cost, order_detail.i_id, order_detail.p_id))
        row = cur.fetchone()
        conn.commit()
        return transform_order_details_to_frontend(row)
    except ValueError:
        conn.rollback()
        raise HTTPException(status_code=400, detail="Order_Id must be a valid integer")
    except HTTPException:
        raise
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        cur.close()
        conn.close()

@app.put("/api/order-details/{order_id}")
def update_order_detail(order_id: int, order_detail: OrderDetailsRequest):
    conn = get_connection()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    try:
        # Convert Order_Id string to int if it's numeric
        new_order_id = int(order_detail.Order_Id) if order_detail.Order_Id.isdigit() else None
        if new_order_id is None:
            raise HTTPException(status_code=400, detail="Order_Id must be a valid integer")
        
        cur.execute("""
            UPDATE orderdetails 
            SET order_id = %s, quantity = %s, cost = %s, i_id = %s, p_id = %s
            WHERE order_id = %s
            RETURNING *;
        """, (new_order_id, order_detail.quantity, order_detail.cost, order_detail.i_id, order_detail.p_id, order_id))
        row = cur.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Order detail not found")
        conn.commit()
        return transform_order_details_to_frontend(row)
    except ValueError:
        conn.rollback()
        raise HTTPException(status_code=400, detail="Order_Id must be a valid integer")
    except HTTPException:
        raise
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        cur.close()
        conn.close()

@app.delete("/api/order-details/{order_id}")
def delete_order_detail(order_id: int):
    conn = get_connection()
    cur = conn.cursor()
    try:
        cur.execute("DELETE FROM orderdetails WHERE order_id = %s RETURNING order_id;", (order_id,))
        result = cur.fetchone()
        if not result:
            raise HTTPException(status_code=404, detail="Order detail not found")
        conn.commit()
        return {"message": "Order detail deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        cur.close()
        conn.close()
