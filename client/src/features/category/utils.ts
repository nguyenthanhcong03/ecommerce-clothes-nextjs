import { Category } from './categoryType';

export function findCategoryById(categories: Category[], targetId: string): Category | null {
  for (const category of categories) {
    if (category._id === targetId) {
      return category;
    }
  }

  return null;
}
