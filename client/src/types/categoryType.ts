export type Category = {
  id: number;
  name: string;
  parentId?: string;
  image: string;
  productsCount: number;
  children?: Category[];
};
