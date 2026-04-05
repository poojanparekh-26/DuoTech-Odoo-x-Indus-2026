// client/src/pages/dashboard/ProductsPage.jsx

import React, { useState, useEffect } from "react"
import { useProducts } from "../../hooks/useProducts"
import { useCategories } from "../../hooks/useCategories"
import { DataTable } from "../../components/ui/DataTable"
import { Button } from "../../components/ui/Button"
import { Badge } from "../../components/ui/Badge"
import { Modal } from "../../components/ui/Modal"
import { Input } from "../../components/ui/Input"
import api from "../../lib/api"

export const ProductsPage = () => {
  const { products, fetchProducts, loading } = useProducts()
  const { categories, fetchCategories } = useCategories()
  const [isModalOpen, setModalOpen] = useState(false)
  const [selectedRows, setSelectedRows] = useState([])
  const [form, setForm] = useState({
    name: "",
    price: "",
    tax: 0,
    category_id: ""
  })

  useEffect(() => {
    fetchProducts()
    fetchCategories()
  }, [fetchProducts, fetchCategories])

  const columns = [

    {
      key: "name",
      label: "Product Name"
    },

    {
      key: "price",
      label: "Sale Price",
      render: (row) => (
        <span className="font-medium text-amber-500">
          ₹{Number(row.price).toFixed(2)}
        </span>
      )
    },

    {
      key: "tax",
      label: "Tax",
      render: (row) => `${row.tax ?? 0}%`
    },

    {
      key: "category_name",
      label: "Category",
      render: (row) =>
        row.category_name
          ? <Badge label={row.category_name} variant="info" />
          : "—"
    },

    {
      key: "is_active",
      label: "Status",
      render: (row) =>
        row.is_active
          ? <Badge label="Active" variant="success" />
          : <Badge label="Inactive" variant="danger" />
    }

  ]

  const handleChange = (e) => {

    setForm({

      ...form,
      [e.target.name]: e.target.value

    })

  }

  const handleSubmit = async () => {
    try {
      await api.post("/products", {
        name: form.name,
        price: Number(form.price),
        tax: Number(form.tax),
        category_id: form.category_id
      })
      fetchProducts()
      setModalOpen(false)
      setForm({ name: "", price: "", tax: 0, category_id: "" })
    } catch (err) {
      console.log(err)
    }
  }

  return (

    <div className="space-y-6 max-w-7xl mx-auto">

      <div className="flex justify-between items-center">

        <h1 className="text-2xl font-bold text-white">

          Products Catalog

        </h1>

        <Button

          variant="primary"

          onClick={() => setModalOpen(true)}

        >

          + New Product

        </Button>

      </div>

      <DataTable

        columns={columns}

        data={products}

        loading={loading}

        selectable

        selectedRows={selectedRows}

        onSelectRow={(id, checked) => {

          if (checked)

            setSelectedRows([...selectedRows, id])

          else

            setSelectedRows(

              selectedRows.filter(r => r !== id)

            )

        }}

        onSelectAll={(checked) => {

          if (checked)

            setSelectedRows(products.map(p => p.id))

          else

            setSelectedRows([])

        }}

      />

    <Modal
  isOpen={isModalOpen}
  onClose={() => setModalOpen(false)}
  title="Add Product"
>

<div className="space-y-5">

<div className="grid grid-cols-2 gap-4">

<input
  name="name"
  placeholder="Ice Latte"
  value={form.name}
  onChange={handleChange}
  className="bg-gray-800 p-2 rounded text-white"
/>

<input
  name="price"
  type="number"
  placeholder="5"
  value={form.price}
  onChange={handleChange}
  className="bg-gray-800 p-2 rounded text-white"
/>

<select
  name="tax"
  value={form.tax}
  onChange={handleChange}
  className="bg-gray-800 p-2 rounded text-white"
>

<option value="0">0%</option>
<option value="5">5%</option>
<option value="18">18%</option>

</select>

<select
  name="category_id"
  value={form.category_id}
  onChange={handleChange}
  className="bg-gray-800 p-2 rounded text-white"
>
<option value="">Select Category</option>
{categories.map(c => (
  <option key={c.id} value={c.id}>{c.name}</option>
))}
</select>

</div>

<div className="flex justify-end gap-3">

<Button onClick={() => setModalOpen(false)}>
Cancel
</Button>

<Button
 onClick={handleSubmit}
>
Save Product
</Button>

</div>

</div>
</Modal>

    </div>

  )

}