export type Category = {
  id: number;
  name: string;
  slug: string;
  image?: string;
  imagePublicId?: string;
  parentId?: number | null;
  parent?: {
    id: number;
    name: string;
    slug: string;
  };
  children?: {
    id: number;
    name: string;
    slug: string;
  }[];
  _count?: {
    products: number;
  };
};

export type CreateCategoryInput = {
  name: string;
  slug: string;
  parentId?: number;
};

export type UpdateCategoryInput = {
  name?: string;
  slug?: string;
  parentId?: number | null;
};
