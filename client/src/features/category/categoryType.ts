export type Category = {
  id: number;
  name: string;
  parentId?: string;
  images: string[];
  productsCount: number;
  children?: Category[];
};
