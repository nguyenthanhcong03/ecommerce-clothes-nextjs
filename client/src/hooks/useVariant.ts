import { Variant } from '@/features/product/productType';
import { findVariant } from '@/features/product/utils';
import { useProductVariantStore } from '@/store/productVariantStore';
import { useEffect, useMemo } from 'react';

const useProductVariants = (variants: Variant[]) => {
  const {
    selectedSize,
    selectedColor,
    quantity,
    setSelectedSize,
    setSelectedColor,
    setQuantity,
    setSelectedVariant,
    setIsProductOutOfStock,
    reset
  } = useProductVariantStore();

  // Kiểm tra xem tất cả variant có hết hàng không
  const isProductOutOfStock = useMemo(() => variants.every((variant) => variant.stock === 0), [variants]);

  // Tính toán size và color có sẵn dựa trên các biến thể của sản phẩm
  const { sizeMap, colorMap } = useMemo(() => {
    const sizeMap = new Map();
    const colorMap = new Map();

    variants.forEach((variant) => {
      if (!sizeMap.has(variant.size)) {
        sizeMap.set(variant.size, new Set());
      }
      sizeMap.get(variant.size).add(variant.color);

      if (!colorMap.has(variant.color)) {
        colorMap.set(variant.color, new Set());
      }
      colorMap.get(variant.color).add(variant.size);
    });

    return { sizeMap, colorMap };
  }, [variants]);

  // Lấy tất cả size và color của sản phẩm
  const allSizes: string[] = useMemo(() => Array.from(sizeMap.keys()), [sizeMap]);
  const allColors: string[] = useMemo(() => Array.from(colorMap.keys()), [colorMap]);

  // Lấy tất cả size của color đã chọn và tất cả color của size đã chọn
  const allSizesForColor: string[] = useMemo(
    () => (selectedColor ? Array.from(colorMap.get(selectedColor) || []) : []),
    [selectedColor, colorMap]
  );
  const allColorsForSize: string[] = useMemo(
    () => (selectedSize ? Array.from(sizeMap.get(selectedSize) || []) : []),
    [selectedSize, sizeMap]
  );

  // Lấy variant đã chọn
  const selectedVariant = useMemo(
    () => findVariant(variants, selectedSize, selectedColor),
    [selectedSize, selectedColor, variants]
  );

  // Lấy các color còn hàng khi chọn size
  const availableColorsForSize = useMemo(() => {
    if (!selectedSize) return allColors || [];

    return allColorsForSize.filter((color) => {
      const variant = findVariant(variants, selectedSize, color);
      return variant && variant.stock > 0;
    });
  }, [selectedSize, allColors, allColorsForSize, variants]);

  // Lấy các size còn hàng khi chọn color
  const availableSizesForColor = useMemo(() => {
    if (!selectedColor) return allSizes || [];

    return allSizesForColor.filter((size) => {
      const variant = findVariant(variants, size, selectedColor);
      return variant && variant.stock > 0;
    });
  }, [selectedColor, allSizes, allSizesForColor, variants]);

  // Xử lý khi thay đổi size
  const handleSizeChange = (size: string) => {
    // Nếu size đã được chọn thì bỏ chọn
    if (selectedSize === size) {
      setSelectedSize('');
      return;
    }
    setSelectedSize(size);
    setQuantity(1);
  };

  // Xử lý khi thay đổi color
  const handleColorChange = (color: string) => {
    // Kiểm tra xem color đã được chọn hay chưa
    if (selectedColor === color) {
      setSelectedColor('');
      return;
    }
    setSelectedColor(color);
    setQuantity(1);
  };

  // Cập nhật selectedVariant trong store khi thay đổi
  useEffect(() => {
    setSelectedVariant(selectedVariant || null);
    setIsProductOutOfStock(isProductOutOfStock);
  }, [selectedVariant, setSelectedVariant, setIsProductOutOfStock, isProductOutOfStock]);

  useEffect(() => {
    // Reset state when variants change
    reset();
  }, [variants, reset]);

  return {
    selectedSize,
    selectedColor,
    quantity,
    isProductOutOfStock,
    setQuantity,
    allSizes,
    allColors,
    availableColorsForSize,
    availableSizesForColor,
    handleSizeChange,
    handleColorChange,
    selectedVariant
  };
};

export default useProductVariants;
