import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Package,
  LogOut,
  Boxes,
  Warehouse,
  AlertTriangle,
  Plus,
  Pencil,
  Trash2,
  X,
  Eye,
  EyeOff,
  CheckCircle2,
  Search
} from "lucide-react";
import "./App.css";

const API_URL = "http://127.0.0.1:8000";

const emptyProduct = {
  name: "",
  sku: "",
  description: "",
  quantity_on_hand: 0,
  cost_price: "",
  selling_price: "",
  low_stock_threshold: ""
};

function App() {
  const [token, setToken] = useState(localStorage.getItem("access_token"));
  const [isSignup, setIsSignup] = useState(false);
  const [organizationName, setOrganizationName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [products, setProducts] = useState([]);
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [productForm, setProductForm] = useState(emptyProduct);
  const [activePage, setActivePage] = useState("Overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  async function apiRequest(path, options = {}) {
    const response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...options.headers
      }
    });

    const data = response.status === 204 ? null : await response.json();

    if (!response.ok) {
      throw new Error(data?.detail || "Request failed");
    }

    return data;
  }

  async function loadData() {
    if (!token) return;

    setLoading(true);
    setError("");

    try {
      const [productData, dashboardData] = await Promise.all([
        apiRequest("/products/"),
        apiRequest("/dashboard/")
      ]);

      setProducts(productData);
      setDashboard(dashboardData);
    } catch (err) {
      setError(err.message);

      if (err.message.toLowerCase().includes("token")) {
        logout();
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (token) loadData();
  }, [token]);

  async function handleAuth(event) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const endpoint = isSignup ? "/auth/signup" : "/auth/login";
    const payload = isSignup
      ? { organization_name: organizationName, email, password }
      : { email, password };

    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Authentication failed");
      }

      localStorage.setItem("access_token", data.access_token);
      setToken(data.access_token);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function logout() {
  localStorage.removeItem("access_token");
  setToken(null);
  setEmail("");
  setPassword("");
  setOrganizationName("");
  setProducts([]);
  setDashboard(null);
  setActivePage("Overview");
  setSearchTerm("");
}

  function openAddForm() {
    setEditingId(null);
    setProductForm(emptyProduct);
    setError("");
    setShowForm(true);
  }

  function openEditForm(product) {
    setEditingId(product.id);
    setProductForm({
      name: product.name,
      sku: product.sku,
      description: product.description || "",
      quantity_on_hand: product.quantity_on_hand,
      cost_price: product.cost_price ?? "",
      selling_price: product.selling_price ?? "",
      low_stock_threshold: product.low_stock_threshold ?? ""
    });
    setError("");
    setShowForm(true);
  }

  async function saveProduct(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    const payload = {
      ...productForm,
      quantity_on_hand: Number(productForm.quantity_on_hand),
      cost_price:
        productForm.cost_price === ""
          ? null
          : Number(productForm.cost_price),
      selling_price:
        productForm.selling_price === ""
          ? null
          : Number(productForm.selling_price),
      low_stock_threshold:
        productForm.low_stock_threshold === ""
          ? null
          : Number(productForm.low_stock_threshold)
    };

    try {
      await apiRequest(
        editingId ? `/products/${editingId}` : "/products/",
        {
          method: editingId ? "PUT" : "POST",
          body: JSON.stringify(payload)
        }
      );

      setShowForm(false);
      setProductForm(emptyProduct);
      setSuccess(
        editingId
          ? "Product updated successfully"
          : "Product added successfully"
      );

      await loadData();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function deleteProduct(productId) {
    if (!window.confirm("Are you sure you want to delete this product?")) {
      return;
    }

    setError("");
    setSuccess("");

    try {
      await apiRequest(`/products/${productId}`, {
        method: "DELETE"
      });

      setSuccess("Product deleted successfully");
      await loadData();
    } catch (err) {
      setError(err.message);
    }
  }

  function isLowStock(product) {
    const threshold = product.low_stock_threshold ?? 5;
    return product.quantity_on_hand <= threshold;
  }

  const filteredProducts = products.filter(product => {
    const search = searchTerm.toLowerCase().trim();

    return (
      product.name.toLowerCase().includes(search) ||
      product.sku.toLowerCase().includes(search)
    );
  });

  if (!token) {
    return (
      <main className="auth-page">
        <section className="auth-card">
          <div className="brand">
          <span className="brand-icon">
          <img src="/stockflow-logo.png" alt="StockFlow" className="stockflow-logo" />
          </span>
          <span>StockFlow</span>
          </div>
          <div className="auth-heading">
            <h1>{isSignup ? "Create your account" : "Welcome back"}</h1>
            <p>
              {isSignup
                ? "Start managing your inventory with ease."
                : "Sign in to manage your inventory."}
            </p>
          </div>

          <form onSubmit={handleAuth}
            autoComplete="off">
            {isSignup && (
              <div className="form-group">
                <label>Organization name</label>
                <input
                  value={organizationName}
                  onChange={event =>
                    setOrganizationName(event.target.value)
                  }
                  required
                  minLength={2}
                />
              </div>
            )}

            <div className="form-group">
              <label>Email address</label>
              <input
                type="email"
                name="login-email"
                autoComplete="off"
                value={email}
                onChange={event => setEmail(event.target.value)}
                required
              />
            </div>

              <div className="form-group">
  <label>Password</label>

  <div className="password-input-wrapper">
    <input
      type={showPassword ? "text" : "password"}
      name="login-password"
      autoComplete={isSignup ? "new-password" : "current-password"}
      value={password}
      onChange={event => setPassword(event.target.value)}
      minLength={8}
      required
    />

    <button
      type="button"
      className="password-toggle"
      onClick={() => setShowPassword(!showPassword)}
      aria-label={showPassword ? "Hide password" : "Show password"}
    >
      {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
    </button>
  </div>
</div>


            {error && <div className="error-message">{error}</div>}

            <button className="primary-button" disabled={loading}>
              {loading
                ? "Please wait..."
                : isSignup
                  ? "Create account"
                  : "Sign in"}
            </button>
          </form>

          <div className="auth-footer">
            {isSignup
              ? "Already have an account?"
              : "New to StockFlow?"}

            <button
              className="text-button"
              onClick={() => {
                setIsSignup(!isSignup);
                setError("");
              }}
            >
              {isSignup ? "Sign in" : "Create an account"}
            </button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="app-layout">
      <style>{`
        .account-avatar-animated {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 42px;
          height: 42px;
          min-width: 42px;
          border-radius: 50%;
          color: #fff;
          font-weight: 700;
          font-size: 17px;
          text-transform: uppercase;
          background: linear-gradient(135deg, #2563eb, #7c3aed, #06b6d4);
          background-size: 200% 200%;
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.13);
          animation: accountAvatarGlow 3s ease-in-out infinite,
                     accountAvatarGradient 6s ease infinite;
        }

        @keyframes accountAvatarGlow {
          0%, 100% { box-shadow: 0 0 0 3px rgba(99, 102, 241, .13), 0 0 0 0 rgba(99, 102, 241, 0); }
          50% { box-shadow: 0 0 0 5px rgba(99, 102, 241, .20), 0 0 14px 2px rgba(99, 102, 241, .25); }
        }
        @keyframes accountAvatarGradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        .overview-view-all {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          padding: 9px 13px;
          border: 1px solid #dbe3ef;
          border-radius: 9px;
          background: #fff;
          color: #2563eb;
          font-size: 13px;
          font-weight: 600;
          line-height: 1;
          white-space: nowrap;
          cursor: pointer;
          transition: background .2s ease, border-color .2s ease, transform .2s ease;
        }
        .overview-view-all:hover {
          background: #eff6ff;
          border-color: #93c5fd;
          transform: translateY(-1px);
        }

        .product-modal .modal-actions {
          display: flex;
          justify-content: flex-end;
          align-items: center;
          gap: 10px;
          margin-top: 24px;
          padding-top: 18px;
          border-top: 1px solid #e8edf4;
        }
        .product-modal .modal-actions button {
          min-height: 40px;
          padding: 9px 18px;
          border-radius: 8px;
          font: inherit;
          font-size: 14px;
          font-weight: 600;
          line-height: 1.2;
          cursor: pointer;
          transition: background .2s ease, border-color .2s ease, transform .2s ease;
        }
        .product-modal .modal-actions .secondary-button {
          color: #334155;
          background: #fff;
          border: 1px solid #cbd5e1;
          box-shadow: none;
        }
        .product-modal .modal-actions .secondary-button:hover {
          color: #0f172a;
          background: #f1f5f9;
          border-color: #94a3b8;
        }
        .product-modal .modal-actions .primary-button:hover,
        .product-modal .modal-actions .secondary-button:hover {
          transform: translateY(-1px);
        }
        .product-modal .close-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          padding: 0;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          background: #fff;
          color: #64748b;
          cursor: pointer;
        }
        .product-modal .close-button:hover {
          color: #0f172a;
          background: #f1f5f9;
        }
        @media (max-width: 520px) {
          .product-modal .modal-actions {
            flex-direction: column-reverse;
            align-items: stretch;
          }
          .product-modal .modal-actions button {
            width: 100%;
          }
        }
      `}</style>
      <aside className="sidebar">
        <div className="brand sidebar-brand">
        <span className="brand-icon">
       <img src="/stockflow-logo.png" alt="StockFlow" className="stockflow-logo" />
       </span>
       <span>StockFlow</span>
       </div>

        <p className="sidebar-label">WORKSPACE</p>

        <nav className="sidebar-nav">
          <button
            className={
              activePage === "Overview"
                ? "nav-item active"
                : "nav-item"
            }
            onClick={() => setActivePage("Overview")}
          >
            <LayoutDashboard size={18} />
            <span>Overview</span>
          </button>

          <button
            className={
              activePage === "Products"
                ? "nav-item active"
                : "nav-item"
            }
            onClick={() => setActivePage("Products")}
          >
            <Package size={18} />
            <span>Products</span>
          </button>
        </nav>

        <div className="sidebar-bottom">
          <div className="user-info">
            <div
              className="user-avatar account-avatar-animated"
              title={email}
              aria-label={`Account for ${email}`}
            >
              {(email.split("@")[0].split(/[._-]/)[0].charAt(0) || "U").toUpperCase()}
            </div>
            <div>
              <strong>Account</strong>
              <span>{email}</span>
            </div>
          </div>

          <button className="logout-button" onClick={logout}>
            <LogOut size={17} />
            <span>Log out</span>
          </button>
        </div>
      </aside>

      <section className="main-content">
        <header className="topbar">
          <div>
            <p className="breadcrumb">
              Workspace / {activePage}
            </p>
            <h1>{activePage}</h1>
          </div>
        </header>

        <div className="page-content">
          {error && <div className="error-message">{error}</div>}

          {success && (
            <div className="success-message">
              <CheckCircle2 size={16} />
              {success}
            </div>
          )}

          {activePage === "Overview" && (
            <>
              <div className="welcome-section">
                <div>
                  <h2>Inventory overview</h2>
                  <p>
                    Here's what's happening with your inventory today.
                  </p>
                </div>
              </div>

              <div className="stats-grid">
                <div className="stat-card">
                  <span className="stat-icon green">
                    <Boxes size={21} />
                  </span>
                  <p>Total products</p>
                  <h2>{dashboard?.total_products ?? 0}</h2>
                  <span className="stat-caption">
                    Products in your inventory
                  </span>
                </div>

                <div className="stat-card">
                  <span className="stat-icon blue">
                    <Warehouse size={21} />
                  </span>
                  <p>Total stock quantity</p>
                  <h2>{dashboard?.total_quantity ?? 0}</h2>
                  <span className="stat-caption">
                    Units currently available
                  </span>
                </div>

                <div className="stat-card">
                  <span className="stat-icon gold">
                    <AlertTriangle size={21} />
                  </span>
                  <p>Low-stock products</p>
                  <h2>{dashboard?.low_stock_count ?? 0}</h2>
                  <span className="stat-caption">
                    Products needing attention
                  </span>
                </div>
              </div>

              <section className="content-card">
                <div className="section-heading">
                  <div>
                    <h2>
                      <AlertTriangle
                        size={18}
                        className="heading-icon"
                      />
                      Low-stock alerts
                    </h2>
                    <p>
                      Products that have reached their stock threshold.
                    </p>
                  </div>

                  <button
                    className="overview-view-all"
                    onClick={() => setActivePage("Products")}
                  >
                    <Eye size={16} />
                    <span>View all</span>
                  </button>
                </div>

                {dashboard?.low_stock_products?.length ? (
                  <div className="table-wrapper">
                    <table>
                      <thead>
                        <tr>
                          <th>Product</th>
                          <th>SKU</th>
                          <th>Quantity</th>
                          <th>Threshold</th>
                          <th>Status</th>
                        </tr>
                      </thead>

                      <tbody>
                        {dashboard.low_stock_products.map(product => (
                          <tr key={product.id}>
                            <td>{product.name}</td>
                            <td>{product.sku}</td>
                            <td>{product.quantity_on_hand}</td>
                            <td>
                              {product.low_stock_threshold ?? 5}
                            </td>
                            <td>
                              <span className="status-badge low">
                                Low stock
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="empty-state">
                    No low-stock products. Your inventory looks good.
                  </p>
                )}
              </section>
            </>
          )}

          {activePage === "Products" && (
            <section className="content-card">
              <div className="section-heading">
                <div>
                  <h2>All products</h2>
                  <p>
                    Manage your organization's inventory.
                  </p>
                </div>

              </div>

              <div className="product-search-section">
                <div className="product-search-wrapper">
                  <Search size={18} />
                  <input
                    type="search"
                    className="product-search"
                    placeholder="Search by product name or SKU..."
                    value={searchTerm}
                    onChange={event => setSearchTerm(event.target.value)}
                  />
                </div>

                <span className="product-count">
                  {filteredProducts.length} of {products.length} products
                </span>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  marginBottom: "16px"
                }}
              >
                <button
                  className="primary-button add-button"
                  onClick={openAddForm}
                >
                  <Plus size={18} />
                  Add Product
                </button>
              </div>

              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>SKU</th>
                      <th>Quantity</th>
                      <th>Selling price</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredProducts.map(product => (
                      <tr key={product.id}>
                        <td>
                          <strong>{product.name}</strong>
                          <span className="product-description">
                            {product.description}
                          </span>
                        </td>

                        <td>{product.sku}</td>
                        <td>{product.quantity_on_hand}</td>

                        <td>
                          {product.selling_price == null
                            ? "—"
                            : `₹${Number(
                                product.selling_price
                              ).toFixed(2)}`}
                        </td>

                        <td>
                          <span
                            className={
                              isLowStock(product)
                                ? "status-badge low"
                                : "status-badge healthy"
                            }
                          >
                            {isLowStock(product)
                              ? "Low stock"
                              : "In stock"}
                          </span>
                        </td>

                        <td>
                          <div className="action-buttons">
                            <button
                              className="edit-button"
                              onClick={() => openEditForm(product)}
                              title="Edit product"
                            >
                              <Pencil size={15} />
                              Edit
                            </button>

                            <button
                              className="delete-button"
                              onClick={() =>
                                deleteProduct(product.id)
                              }
                              title="Delete product"
                            >
                              <Trash2 size={15} />
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {!filteredProducts.length && !loading && (
                  <p className="empty-state">
                    {products.length
                      ? "No products match your search."
                      : "No products yet. Add your first product."}
                  </p>
                )}
              </div>
            </section>
          )}

          {loading && (
            <p className="loading-message">
              Loading inventory...
            </p>
          )}
        </div>
      </section>

      {showForm && (
        <div
          className="modal-overlay"
          onClick={event => {
            if (event.target === event.currentTarget) {
              setShowForm(false);
            }
          }}
        >
          <section className="product-modal">
            <div className="section-heading">
              <div>
                <h2>
                  {editingId ? "Edit product" : "Add a product"}
                </h2>
                <p>Enter the product details below.</p>
              </div>

              <button
                className="close-button"
                onClick={() => setShowForm(false)}
                aria-label="Close"
              >
                <X size={19} />
              </button>
            </div>

            <form onSubmit={saveProduct}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Product name *</label>
                  <input
                    value={productForm.name}
                    onChange={event =>
                      setProductForm({
                        ...productForm,
                        name: event.target.value
                      })
                    }
                    required
                  />
                </div>

                <div className="form-group">
                  <label>SKU *</label>
                  <input
                    value={productForm.sku}
                    onChange={event =>
                      setProductForm({
                        ...productForm,
                        sku: event.target.value
                      })
                    }
                    required
                  />
                </div>

                <div className="form-group full-width">
                  <label>Description</label>
                  <input
                    value={productForm.description}
                    onChange={event =>
                      setProductForm({
                        ...productForm,
                        description: event.target.value
                      })
                    }
                  />
                </div>

                <div className="form-group">
                  <label>Quantity on hand *</label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={productForm.quantity_on_hand}
                    onChange={event =>
                      setProductForm({
                        ...productForm,
                        quantity_on_hand: event.target.value
                      })
                    }
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Low stock threshold</label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={productForm.low_stock_threshold}
                    onChange={event =>
                      setProductForm({
                        ...productForm,
                        low_stock_threshold: event.target.value
                      })
                    }
                  />
                </div>

                <div className="form-group">
                  <label>Cost price</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={productForm.cost_price}
                    onChange={event =>
                      setProductForm({
                        ...productForm,
                        cost_price: event.target.value
                      })
                    }
                  />
                </div>

                <div className="form-group">
                  <label>Selling price</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={productForm.selling_price}
                    onChange={event =>
                      setProductForm({
                        ...productForm,
                        selling_price: event.target.value
                      })
                    }
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="secondary-button cancel-product-button"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary-button"
                  disabled={loading}
                >
                  {loading
                    ? "Saving..."
                    : editingId
                      ? "Save Changes"
                      : "Add Product"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </main>
  );
}

export default App;
