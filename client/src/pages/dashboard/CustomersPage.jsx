// C:/Users/pruthilpatel/Desktop/odoo hacathon/client/src/pages/dashboard/CustomersPage.jsx
import React, { useEffect, useState } from 'react';
import { useCustomers } from '../../hooks/useCustomers';
import { DataTable } from '../../components/ui/DataTable';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

export const CustomersPage = () => {
  const { fetchCustomers, createCustomer, updateCustomer, loading } = useCustomers();
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    city: '',
    state: '',
    country: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => { 
    fetchCustomers().then(res => res?.customers && setCustomers(res.customers)); 
  }, [fetchCustomers]);

  const handleSelectCustomer = (customer) => {
    setSelectedCustomer(customer);
    setFormData({
      name: customer.name || '',
      email: customer.email || '',
      phone: customer.phone || '',
      city: customer.city || '',
      state: customer.state || '',
      country: customer.country || '',
    });
  };

  const handleNewCustomer = () => {
    setSelectedCustomer({});
    setFormData({
      name: '',
      email: '',
      phone: '',
      city: '',
      state: '',
      country: '',
    });
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      alert('Customer name is required');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: formData.name,
        email: formData.email || null,
        phone: formData.phone || null,
        city: formData.city || null,
        state: formData.state || null,
        country: formData.country || null,
      };

      if (selectedCustomer.id) {
        // Update existing customer
        await updateCustomer(selectedCustomer.id, payload);
        setCustomers(prev => prev.map(c => c.id === selectedCustomer.id ? { ...c, ...payload } : c));
      } else {
        // Create new customer
        const newCustomer = await createCustomer(payload);
        setCustomers(prev => [newCustomer, ...prev]);
      }
      setSelectedCustomer(null);
    } catch (err) {
      console.error('Error saving customer:', err);
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    { key: 'name', label: 'Name', render: r => <span className="font-bold text-gray-200">{r.name}</span> },
    { key: 'phone', label: 'Contact', render: r => <span className="text-gray-400 text-sm">{r.phone || 'N/A'}</span> },
    { key: 'total_sales', label: 'Total Sales', render: () => <span className="text-amber-500 font-medium">$0.00</span> },
  ];

  return (
    <div className="flex gap-6 max-w-[1400px] mx-auto h-[calc(100vh-8rem)]">
      <div className={`flex flex-col flex-1 transition-all h-full`}>
        <div className="flex justify-between items-center mb-6 shrink-0">
          <h1 className="text-2xl font-bold text-white">Customers</h1>
          <Button variant="primary" onClick={handleNewCustomer}>+ New Customer</Button>
        </div>
        <div className="mb-4 shrink-0">
           <Input placeholder="Search customers by name or phone..." rightIcon={<div className="w-4 h-4 text-gray-400">🔍</div>} />
        </div>
        <div className="flex-1 overflow-auto">
          <DataTable columns={columns} data={customers} loading={loading} onRowClick={handleSelectCustomer} />
        </div>
      </div>

      {selectedCustomer && (
        <div className="w-1/3 min-w-[320px] max-w-[400px] bg-gray-800 rounded-xl border border-gray-700 p-6 flex flex-col shadow-xl shrink-0 overflow-y-auto">
          <div className="flex justify-between items-center mb-6 shrink-0">
             <h2 className="text-lg font-bold text-white">{selectedCustomer.id ? 'Edit Customer' : 'New Customer'}</h2>
             <button onClick={() => setSelectedCustomer(null)} className="text-gray-400 hover:text-white">✕</button>
          </div>
          
          <div className="space-y-4 flex-1">
             <Input 
               label="Name" 
               value={formData.name}
               onChange={(e) => handleInputChange('name', e.target.value)}
               placeholder="Customer name"
             />
             <Input 
               label="Email" 
               type="email"
               value={formData.email}
               onChange={(e) => handleInputChange('email', e.target.value)}
               placeholder="customer@example.com"
             />
             <Input 
               label="Phone" 
               value={formData.phone}
               onChange={(e) => handleInputChange('phone', e.target.value)}
               placeholder="+1234567890"
             />
             <Input 
               label="City" 
               value={formData.city}
               onChange={(e) => handleInputChange('city', e.target.value)}
               placeholder="City"
             />
             <div className="grid grid-cols-2 gap-4">
                <Input 
                  label="State" 
                  value={formData.state}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                  placeholder="State"
                />
                <Input 
                  label="Country" 
                  value={formData.country}
                  onChange={(e) => handleInputChange('country', e.target.value)}
                  placeholder="Country"
                />
             </div>
          </div>

          <div className="mt-8 pt-4 border-t border-gray-700 flex gap-3 shrink-0">
             <Button variant="ghost" className="flex-1" onClick={() => setSelectedCustomer(null)}>Cancel</Button>
             <Button variant="primary" className="flex-1" onClick={handleSave} disabled={saving}>
               {saving ? 'Saving...' : 'Save'}
             </Button>
          </div>
        </div>
      )}
    </div>
  );
};
