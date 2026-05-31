export interface FilterableAttribute {
  key: string;
  label: string;
  type: "select" | "color" | "range";
  options: string[];
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  parent: string | null;
  image: { _id: string; url: string } | null;
  displayOrder: number;
  isActive: boolean;
  filterableAttributes: FilterableAttribute[];
  subcategories?: Category[];
  createdAt: string;
  updatedAt: string;
}
