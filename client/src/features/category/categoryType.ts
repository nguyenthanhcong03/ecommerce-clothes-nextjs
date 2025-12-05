export type Category = {
  _id: string;
  name: string;
  parentId?: string;
  images: string[];
  productsCount: number;
  children?: Category[];
};
