import React, { useEffect, useState } from 'react';
import { api, SalesSummary } from '../services/api';
import { StaffProfile, MenuItem, CafeTable, Customer, PrivacyRequest } from '../types';
import { formatRupees } from '../utils/formatters';
import { generateQrPngDataUrl, generateQrSvgString } from '../utils/qr';
import { Icons } from '../components/SvgIcon';
import { StaffLoginModal } from '../components/StaffLoginModal';

export const Admin: React.FC = () => {
  const [profile, setProfile] = useState<StaffProfile | null>(api.getCurrentStaff());
  const [activeTab, setActiveTab] = useState<'menu' | 'tables' | 'sales' | 'customers' | 'privacy'>('menu');

  // Tab 1: Menu Items
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
  const [editPriceRupees, setEditPriceRupees] = useState<string>('');

  // Tab 2: Tables
  const [tables, setTables] = useState<CafeTable[]>([]);
  const [selectedTableQr, setSelectedTableQr] = useState<{ label: string; url: string; pngData: string; svgData: string } | null>(null);

  // Tab 3: Sales
  const [sales, setSales] = useState<SalesSummary | null>(null);

  // Tab 4: Consented Customers
  const [customers, setCustomers] = useState<Customer[]>([]);

  // Tab 5: Privacy Requests
  const [privacyRequests, setPrivacyRequests] = useState<PrivacyRequest[]>([]);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.title = 'Owner Admin | Artisan Roast Cafe';
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [allMenu, allTables, salesSummary, consentedCusts, reqs] = await Promise.all([
        api.getAllMenuItems(),
        api.getTables(),
        api.getSalesSummary(),
        api.getConsentedCustomers(),
        api.getPrivacyRequests(),
      ]);
      setMenuItems(allMenu.items);
      setTables(allTables);
      setSales(salesSummary);
      setCustomers(consentedCusts);
      setPrivacyRequests(reqs);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (profile && profile.role === 'owner') {
      loadData();
    }
  }, [profile]);

  if (!profile || profile.role !== 'owner') {
    return (
      <div className="max-w-md mx-auto px-4 py-16">
        <div className="mb-4 text-center">
          <p className="text-xs text-cafe-danger font-semibold">
            Owner authorization required to access the administrative dashboard.
          </p>
        </div>
        <StaffLoginModal
          roleRequired="owner"
          onLoginSuccess={(prof) => setProfile(prof)}
        />
      </div>
    );
  }

  // --- Handlers ---
  const handleToggleAvailable = async (item: MenuItem) => {
    await api.updateMenuItem(item.id, { is_available: !item.is_available });
    loadData();
  };

  const handleSavePrice = async (itemId: string) => {
    const rupees = parseFloat(editPriceRupees);
    if (isNaN(rupees) || rupees < 0) {
      alert('Please enter a valid price in Rupees.');
      return;
    }
    const paise = Math.round(rupees * 100);
    await api.updateMenuItem(itemId, { price_paise: paise });
    setEditingPriceId(null);
    loadData();
  };

  const handleRegenerateToken = async (table: CafeTable) => {
    if (confirm(`Regenerate token for ${table.label}? The existing printed QR code will be invalidated.`)) {
      await api.regenerateTableToken(table.id);
      loadData();
      if (selectedTableQr?.label === table.label) {
        setSelectedTableQr(null);
      }
    }
  };

  const handleViewQr = async (table: CafeTable) => {
    const origin = window.location.origin;
    const url = `${origin}/t/${table.token}`;
    const pngData = await generateQrPngDataUrl(url);
    const svgData = await generateQrSvgString(url);
    setSelectedTableQr({ label: table.label, url, pngData, svgData });
  };

  const handleDownloadQrPng = () => {
    if (!selectedTableQr) return;
    const a = document.createElement('a');
    a.href = selectedTableQr.pngData;
    a.download = `${selectedTableQr.label.replace(/\s+/g, '_')}_QR.png`;
    a.click();
  };

  const handleDownloadQrSvg = () => {
    if (!selectedTableQr) return;
    const blob = new Blob([selectedTableQr.svgData], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedTableQr.label.replace(/\s+/g, '_')}_QR.svg`;
    a.click();
  };

  const handleExportConsentedCsv = () => {
    // Section 5.4 & 11 Phase 3: Only consented customers appear in export
    const headers = ['Name', 'Phone', 'Consent Granted At', 'Consent Version', 'Loyalty Points'];
    const rows = customers.map((c) => [
      `"${c.name || ''}"`,
      `"${c.phone || ''}"`,
      `"${c.marketing_consent_at || ''}"`,
      `"${c.consent_text_version || ''}"`,
      c.loyalty_points,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `consented_customers_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleEraseCustomer = async (customerId: string, name: string | null) => {
    if (confirm(`Permanently erase customer details for "${name || 'Customer'}"? This clears all personal fields under DPDP Act.`)) {
      await api.eraseCustomer(customerId);
      loadData();
    }
  };

  const handleResolveRequest = async (id: string) => {
    await api.resolvePrivacyRequest(id);
    loadData();
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 pb-20">
      {/* Admin Header */}
      <div className="border border-cafe-border bg-cafe-surface p-5 rounded mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-cafe-accent tracking-tight">
              Owner Dashboard {loading && <span className="text-xs text-cafe-textMuted font-normal">(Refreshing...)</span>}
            </h1>
            <span className="px-2 py-0.5 text-xs font-semibold bg-cafe-muted text-cafe-accent border border-cafe-border rounded">
              Role: Owner ({profile.email})
            </span>
          </div>
          <p className="text-xs text-cafe-textMuted mt-0.5">
            Configure menu availability, manage table QR codes, view real sales metrics, and handle privacy operations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="/kitchen"
            className="touch-target px-3 py-1.5 bg-cafe-surface border border-cafe-border text-cafe-text hover:bg-cafe-muted text-xs font-medium rounded transition-colors duration-150 flex items-center"
          >
            Kitchen Screen
          </a>
          <button
            type="button"
            onClick={() => {
              api.logoutStaff();
              setProfile(null);
            }}
            className="touch-target px-3 py-1.5 text-xs text-cafe-danger hover:bg-cafe-dangerBg border border-cafe-border rounded transition-colors duration-150"
          >
            Sign out
          </button>
        </div>
      </div>

      {/* Tabs */}
      <nav className="flex flex-wrap gap-2 mb-6" aria-label="Admin Navigation Tabs">
        {[
          { id: 'menu', label: 'Menu & Prices' },
          { id: 'tables', label: 'Tables & QR Codes' },
          { id: 'sales', label: 'Sales Summary' },
          { id: 'customers', label: `Consented Customers (${customers.length})` },
          { id: 'privacy', label: `Privacy Requests (${privacyRequests.filter((r) => r.status === 'pending').length} Pending)` },
        ].map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`touch-target px-4 py-2 text-xs font-semibold rounded border transition-colors duration-150 ${
                active
                  ? 'bg-cafe-accent text-white border-cafe-accent'
                  : 'bg-cafe-surface text-cafe-text border-cafe-border hover:bg-cafe-muted'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </nav>

      {/* TAB 1: MENU & PRICES */}
      {activeTab === 'menu' && (
        <section aria-labelledby="heading-menu-mgmt" className="border border-cafe-border bg-cafe-surface p-6 rounded">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 id="heading-menu-mgmt" className="text-lg font-semibold text-cafe-text">
                Menu Item Availability and Prices
              </h2>
              <p className="text-xs text-cafe-textMuted">
                Section 5.4: Owner can adjust prices and toggle item availability.
              </p>
            </div>
            <button
              type="button"
              onClick={loadData}
              className="touch-target px-3 py-1.5 text-xs text-cafe-text border border-cafe-border rounded hover:bg-cafe-muted flex items-center gap-1.5"
            >
              <Icons.Refresh className="w-3.5 h-3.5" />
              <span>Refresh</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-cafe-muted border-b border-cafe-border font-semibold text-cafe-text">
                <tr>
                  <th className="p-3">Item Name</th>
                  <th className="p-3">Diet</th>
                  <th className="p-3">Current Price</th>
                  <th className="p-3">Availability</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cafe-border">
                {menuItems.map((item) => {
                  const isEditingPrice = editingPriceId === item.id;

                  return (
                    <tr key={item.id} className="hover:bg-cafe-muted/30">
                      <td className="p-3 font-medium text-cafe-text">{item.name}</td>
                      <td className="p-3 uppercase text-[10px] font-bold text-cafe-textMuted">{item.diet}</td>
                      <td className="p-3">
                        {isEditingPrice ? (
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-cafe-text">₹</span>
                            <input
                              type="number"
                              step="1"
                              value={editPriceRupees}
                              onChange={(e) => setEditPriceRupees(e.target.value)}
                              className="w-20 px-2 py-1 border border-cafe-border rounded text-xs"
                            />
                            <button
                              type="button"
                              onClick={() => handleSavePrice(item.id)}
                              className="px-2 py-1 bg-cafe-accent text-white rounded text-xs"
                            >
                              Save
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingPriceId(null)}
                              className="px-2 py-1 bg-cafe-muted text-cafe-text border border-cafe-border rounded text-xs"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-cafe-accent">
                              {formatRupees(item.price_paise)}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingPriceId(item.id);
                                setEditPriceRupees((item.price_paise / 100).toString());
                              }}
                              className="text-[11px] text-cafe-accent underline hover:text-cafe-accentHover"
                            >
                              Edit Price
                            </button>
                          </div>
                        )}
                      </td>
                      <td className="p-3">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${
                            item.is_available
                              ? 'bg-cafe-successBg text-cafe-success border border-cafe-success'
                              : 'bg-cafe-dangerBg text-cafe-danger border border-cafe-danger'
                          }`}
                        >
                          {item.is_available ? 'Available' : 'Unavailable'}
                        </span>
                      </td>
                      <td className="p-3">
                        <button
                          type="button"
                          onClick={() => handleToggleAvailable(item)}
                          className={`touch-target px-3 py-1 text-xs font-medium rounded border transition-colors duration-150 ${
                            item.is_available
                              ? 'text-cafe-danger border-cafe-danger/30 hover:bg-cafe-dangerBg'
                              : 'text-cafe-success border-cafe-success/30 hover:bg-cafe-successBg'
                          }`}
                        >
                          {item.is_available ? 'Mark Unavailable' : 'Mark Available'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* TAB 2: TABLES & QR */}
      {activeTab === 'tables' && (
        <section aria-labelledby="heading-tables-mgmt" className="space-y-6">
          <div className="border border-cafe-border bg-cafe-surface p-6 rounded">
            <h2 id="heading-tables-mgmt" className="text-lg font-semibold text-cafe-text mb-1">
              Table QR Code Management
            </h2>
            <p className="text-xs text-cafe-textMuted mb-6">
              Regenerate tokens to invalidate older printed QR codes. Download high-resolution PNG or SVG for physical printing.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {tables.map((table) => (
                <div key={table.id} className="border border-cafe-border bg-cafe-surface p-4 rounded flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-base text-cafe-accent">{table.label}</span>
                      <span className="text-[10px] px-2 py-0.5 bg-cafe-successBg text-cafe-success border border-cafe-success rounded">
                        Active
                      </span>
                    </div>
                    <div className="text-[11px] font-mono text-cafe-textMuted truncate mb-3" title={table.token}>
                      Token: {table.token}
                    </div>
                  </div>

                  <div className="space-y-2 pt-3 border-t border-cafe-border">
                    <button
                      type="button"
                      onClick={() => handleViewQr(table)}
                      className="touch-target w-full py-1.5 text-xs font-semibold bg-cafe-accent text-white rounded hover:bg-cafe-accentHover flex items-center justify-center gap-1.5 transition-colors duration-150"
                    >
                      <Icons.QrCode className="w-3.5 h-3.5" />
                      <span>View & Download QR</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRegenerateToken(table)}
                      className="touch-target w-full py-1.5 text-xs text-cafe-textMuted hover:text-cafe-danger border border-cafe-border rounded transition-colors duration-150 flex items-center justify-center gap-1.5"
                    >
                      <Icons.Refresh className="w-3.5 h-3.5" />
                      <span>Regenerate Token</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* QR Code Modal / Preview */}
          {selectedTableQr && (
            <div className="border border-cafe-accent bg-cafe-surface p-6 rounded text-center">
              <h3 className="text-base font-bold text-cafe-accent mb-1">
                Printable QR Code: {selectedTableQr.label}
              </h3>
              <p className="text-xs text-cafe-textMuted mb-4">
                Encodes: <code className="bg-cafe-muted px-1 py-0.5 rounded">{selectedTableQr.url}</code>
              </p>

              <div className="inline-block p-4 bg-white border border-cafe-border rounded mb-4">
                <img
                  src={selectedTableQr.pngData}
                  alt={`QR Code for ${selectedTableQr.label}`}
                  className="w-48 h-48 mx-auto"
                />
              </div>

              <div className="flex justify-center gap-3">
                <button
                  type="button"
                  onClick={handleDownloadQrPng}
                  className="touch-target px-4 py-2 bg-cafe-accent text-white text-xs font-semibold rounded hover:bg-cafe-accentHover flex items-center gap-1.5"
                >
                  <Icons.Download className="w-4 h-4" />
                  <span>Download PNG</span>
                </button>
                <button
                  type="button"
                  onClick={handleDownloadQrSvg}
                  className="touch-target px-4 py-2 bg-cafe-surface border border-cafe-border text-cafe-text text-xs font-semibold rounded hover:bg-cafe-muted flex items-center gap-1.5"
                >
                  <Icons.Download className="w-4 h-4" />
                  <span>Download SVG</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedTableQr(null)}
                  className="touch-target px-3 py-2 text-xs text-cafe-textMuted hover:text-cafe-text"
                >
                  Close Preview
                </button>
              </div>
            </div>
          )}
        </section>
      )}

      {/* TAB 3: SALES SUMMARY */}
      {activeTab === 'sales' && (
        <section aria-labelledby="heading-sales-mgmt" className="space-y-6">
          <div className="border border-cafe-border bg-cafe-surface p-6 rounded">
            <h2 id="heading-sales-mgmt" className="text-lg font-semibold text-cafe-text mb-1">
              Today's Real Data Sales Summary
            </h2>
            <p className="text-xs text-cafe-textMuted mb-6">
              Section 5.4: Computed strictly from real orders. No fake sample data.
            </p>

            {sales && sales.todayOrderCount === 0 ? (
              <div className="p-8 border border-cafe-border bg-cafe-muted text-center rounded text-sm text-cafe-textMuted">
                No orders recorded today yet.
              </div>
            ) : (
              <div className="space-y-6">
                {/* Metric Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="border border-cafe-border bg-cafe-muted p-5 rounded">
                    <span className="text-xs text-cafe-textMuted uppercase tracking-wider block mb-1">
                      Today's Orders
                    </span>
                    <span className="text-3xl font-bold text-cafe-accent">
                      {sales?.todayOrderCount || 0}
                    </span>
                  </div>
                  <div className="border border-cafe-border bg-cafe-muted p-5 rounded">
                    <span className="text-xs text-cafe-textMuted uppercase tracking-wider block mb-1">
                      Today's Sales Value
                    </span>
                    <span className="text-3xl font-bold text-cafe-accent">
                      {formatRupees(sales?.todaySalesPaise || 0)}
                    </span>
                  </div>
                </div>

                {/* Top Items Table */}
                <div>
                  <h3 className="text-sm font-semibold text-cafe-text mb-3">
                    Top Ordered Items Today
                  </h3>
                  <div className="overflow-x-auto border border-cafe-border rounded">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-cafe-muted border-b border-cafe-border text-cafe-text font-semibold">
                        <tr>
                          <th className="p-3">Item</th>
                          <th className="p-3">Quantity Sold</th>
                          <th className="p-3">Gross Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-cafe-border">
                        {sales?.topItems.map((item, idx) => (
                          <tr key={idx}>
                            <td className="p-3 font-medium text-cafe-text">{item.name}</td>
                            <td className="p-3 font-semibold text-cafe-accent">{item.quantity}</td>
                            <td className="p-3">{formatRupees(item.totalPaise)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Orders by Hour */}
                <div>
                  <h3 className="text-sm font-semibold text-cafe-text mb-3">
                    Orders by Hour
                  </h3>
                  <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 text-center text-xs">
                    {sales?.ordersByHour.map((slot) => (
                      <div key={slot.hour} className="border border-cafe-border p-2 rounded bg-cafe-muted">
                        <span className="text-[10px] text-cafe-textMuted block">{slot.hour}</span>
                        <span className="font-bold text-cafe-text text-sm">{slot.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* TAB 4: CONSENTED CUSTOMERS & PRIVACY ERASURE */}
      {activeTab === 'customers' && (
        <section aria-labelledby="heading-cust-mgmt" className="border border-cafe-border bg-cafe-surface p-6 rounded">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div>
              <h2 id="heading-cust-mgmt" className="text-lg font-semibold text-cafe-text">
                Customers with Marketing Consent
              </h2>
              <p className="text-xs text-cafe-textMuted">
                Section 5.4 & 11: Customers who gave affirmative WhatsApp marketing consent. Non-consented customers are not exportable.
              </p>
            </div>
            {customers.length > 0 && (
              <button
                type="button"
                onClick={handleExportConsentedCsv}
                className="touch-target px-4 py-2 bg-cafe-accent text-white text-xs font-semibold rounded hover:bg-cafe-accentHover flex items-center gap-1.5 transition-colors duration-150"
              >
                <Icons.Download className="w-3.5 h-3.5" />
                <span>Export Consented CSV</span>
              </button>
            )}
          </div>

          {customers.length === 0 ? (
            <div className="p-8 border border-cafe-border bg-cafe-muted text-center rounded text-sm text-cafe-textMuted">
              No customers with active marketing consent found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-cafe-muted border-b border-cafe-border font-semibold text-cafe-text">
                  <tr>
                    <th className="p-3">Customer Name</th>
                    <th className="p-3">Mobile Number</th>
                    <th className="p-3">Consent Timestamp</th>
                    <th className="p-3">Version</th>
                    <th className="p-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cafe-border">
                  {customers.map((c) => (
                    <tr key={c.id} className="hover:bg-cafe-muted/30">
                      <td className="p-3 font-medium text-cafe-text">{c.name || 'Anonymous'}</td>
                      <td className="p-3 font-mono">{c.phone}</td>
                      <td className="p-3 text-cafe-textMuted">{c.marketing_consent_at ? new Date(c.marketing_consent_at).toLocaleString() : 'N/A'}</td>
                      <td className="p-3 font-mono">{c.consent_text_version}</td>
                      <td className="p-3">
                        <button
                          type="button"
                          onClick={() => handleEraseCustomer(c.id, c.name)}
                          className="touch-target px-2.5 py-1 text-xs text-cafe-danger hover:bg-cafe-dangerBg border border-cafe-danger/30 rounded transition-colors duration-150"
                          title="Erase personal data under DPDP Act"
                        >
                          Erase Record
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {/* TAB 5: PRIVACY REQUESTS */}
      {activeTab === 'privacy' && (
        <section aria-labelledby="heading-priv-mgmt" className="border border-cafe-border bg-cafe-surface p-6 rounded">
          <div className="mb-4">
            <h2 id="heading-priv-mgmt" className="text-lg font-semibold text-cafe-text">
              DPDP Privacy Requests Queue
            </h2>
            <p className="text-xs text-cafe-textMuted">
              Section 5.4: Customer rights requests (access, correction, erasure, withdrawal). Acknowledge in 48h, resolve in 30 days.
            </p>
          </div>

          {privacyRequests.length === 0 ? (
            <div className="p-8 border border-cafe-border bg-cafe-muted text-center rounded text-sm text-cafe-textMuted">
              No privacy requests submitted yet.
            </div>
          ) : (
            <div className="space-y-3">
              {privacyRequests.map((req) => (
                <div key={req.id} className="p-4 border border-cafe-border bg-cafe-surface rounded flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-cafe-text uppercase tracking-wider">
                        {req.request_type.replace('_', ' ')}
                      </span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                          req.status === 'resolved'
                            ? 'bg-cafe-successBg text-cafe-success border border-cafe-success'
                            : 'bg-cafe-warningBg text-cafe-warning border border-cafe-warning'
                        }`}
                      >
                        {req.status}
                      </span>
                      <span className="text-xs text-cafe-textMuted">
                        ({new Date(req.created_at).toLocaleDateString()})
                      </span>
                    </div>
                    <p className="text-xs font-mono text-cafe-accent">
                      Principal: {req.phone_or_email}
                    </p>
                    <p className="text-xs text-cafe-textMuted italic">
                      "{req.message}"
                    </p>
                  </div>

                  {req.status === 'pending' && (
                    <button
                      type="button"
                      onClick={() => handleResolveRequest(req.id)}
                      className="touch-target px-3 py-1.5 bg-cafe-success text-white text-xs font-semibold rounded hover:opacity-90 transition-colors duration-150"
                    >
                      Mark as Resolved
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
};
