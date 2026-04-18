import { useState } from "react";
import ProductForm from "../../features/admin/ProductForm";

export default function Dashboard() {
  const [products, setProducts] = useState<any[]>([]);

  const addProduct = (data: any) => {
    setProducts([...products, { ...data, id: Date.now() }]);
  };

  return (
    <div className="container mt-4">
      <h2>Admin Panel</h2>

      <ProductForm onSubmit={addProduct} />

      <div className="mt-4">
        {products.map((p) => (
          <div key={p.id}>{p.title}</div>
        ))}
      </div>
    </div>
  );
}