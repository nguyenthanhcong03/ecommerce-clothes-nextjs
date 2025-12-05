'use client';

import Breadcrumb from '@/components/common/Breadcrumb';
import Headline from '@/components/common/Headline';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatDate } from '@/lib/utils';
import { ArrowRight, Calendar, Eye, Search, Tag, User } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

// Mock data cho tin tức
const mockNewsData = {
  featured: {
    id: 1,
    title: 'Xu hướng thời trang Thu Đông 2024: Khám phá phong cách mới',
    excerpt:
      'Những xu hướng thời trang hot nhất mùa Thu Đông 2024 với sự kết hợp hoàn hảo giữa phong cách cổ điển và hiện đại.',
    content: 'Thời trang Thu Đông 2024 mang đến những xu hướng mới mẻ với sự kết hợp tinh tế...',
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80',
    author: 'Nguyễn Thị Lan',
    publishDate: '2024-05-25',
    readTime: '5 phút',
    views: 1240,
    category: 'Xu hướng',
    tags: ['Thời trang', 'Thu Đông 2024', 'Xu hướng']
  },
  articles: [
    {
      id: 2,
      title: 'Cách phối đồ công sở thanh lịch cho phái nữ',
      excerpt:
        'Hướng dẫn chi tiết cách phối đồ công sở chuyên nghiệp và thanh lịch phù hợp với môi trường làm việc hiện đại.',
      image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&q=80',
      author: 'Trần Văn Nam',
      publishDate: '2024-05-20',
      readTime: '4 phút',
      views: 856,
      category: 'Phối đồ',
      tags: ['Công sở', 'Phong cách']
    },
    {
      id: 3,
      title: 'Top 10 món phụ kiện không thể thiếu trong tủ đồ',
      excerpt: 'Khám phá những món phụ kiện thiết yếu giúp bạn tạo nên phong cách riêng và nâng tầm outfit.',
      image: 'https://images.unsplash.com/photo-1492707892479-7bc8d5a4ee93?w=400&q=80',
      author: 'Lê Thị Mai',
      publishDate: '2024-05-18',
      readTime: '6 phút',
      views: 1450,
      category: 'Phụ kiện',
      tags: ['Phụ kiện', 'Thời trang']
    },
    {
      id: 4,
      title: 'Bí quyết chọn trang phục phù hợp với dáng người',
      excerpt: 'Tìm hiểu cách chọn trang phục phù hợp với từng dáng người để tôn lên những ưu điểm của bạn.',
      image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&q=80',
      author: 'Phạm Văn Hùng',
      publishDate: '2024-05-15',
      readTime: '7 phút',
      views: 920,
      category: 'Hướng dẫn',
      tags: ['Dáng người', 'Tư vấn']
    },
    {
      id: 5,
      title: 'Thời trang bền vững: Xu hướng của tương lai',
      excerpt: 'Tìm hiểu về phong trào thời trang bền vững và tác động tích cực đến môi trường.',
      image: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=400&q=80',
      author: 'Nguyễn Thị Hoa',
      publishDate: '2024-05-12',
      readTime: '5 phút',
      views: 1120,
      category: 'Xu hướng',
      tags: ['Bền vững', 'Môi trường']
    },
    {
      id: 6,
      title: 'Làm sao để bảo quản quần áo đúng cách?',
      excerpt: 'Hướng dẫn chi tiết cách bảo quản và chăm sóc quần áo để giữ được chất lượng và độ bền.',
      image: 'https://images.unsplash.com/photo-1582719471384-894fbb16e074?w=400&q=80',
      author: 'Vũ Thị Lan',
      publishDate: '2024-05-10',
      readTime: '4 phút',
      views: 780,
      category: 'Hướng dẫn',
      tags: ['Bảo quản', 'Chăm sóc']
    },
    {
      id: 7,
      title: 'Phong cách street style đang được yêu thích',
      excerpt: 'Khám phá phong cách street style năng động và cách ứng dụng vào trang phục hàng ngày.',
      image: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=400&q=80',
      author: 'Trần Minh Tuấn',
      publishDate: '2024-05-08',
      readTime: '6 phút',
      views: 1680,
      category: 'Phong cách',
      tags: ['Street style', 'Năng động']
    }
  ]
};

const newsCategories = [
  { id: 1, name: 'Tất cả', slug: 'all', count: 15 },
  { id: 2, name: 'Xu hướng', slug: 'trend', count: 5 },
  { id: 3, name: 'Phối đồ', slug: 'styling', count: 4 },
  { id: 4, name: 'Phụ kiện', slug: 'accessories', count: 3 },
  { id: 5, name: 'Hướng dẫn', slug: 'guide', count: 2 },
  { id: 6, name: 'Phong cách', slug: 'style', count: 1 }
];

const popularTags = [
  'Thời trang',
  'Xu hướng',
  'Phối đồ',
  'Phụ kiện',
  'Công sở',
  'Street style',
  'Thu Đông 2024',
  'Bền vững',
  'Chăm sóc'
];

export default function NewsPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');

  // --- Featured Article ---
  const FeaturedArticle = ({ article }: { article: typeof mockNewsData.featured }) => (
    <div className='relative overflow-hidden rounded-md bg-white shadow-lg'>
      <div className='grid grid-cols-1 lg:grid-cols-2'>
        <div className='relative h-64 lg:h-full'>
          <Image src={article.image} alt={article.title} fill className='object-cover' />
          <div className='absolute top-4 left-4'>
            <Badge variant='secondary'>Nổi bật</Badge>
          </div>
        </div>
        <div className='p-6'>
          <div className='mb-3 flex items-center gap-4 text-sm text-gray-500'>
            <Badge variant='outline'>{article.category}</Badge>
            <div className='flex items-center gap-1'>
              <Calendar className='h-4 w-4' />
              {formatDate(article.publishDate)}
            </div>
          </div>
          <h2 className='mb-4 text-2xl font-bold text-gray-900 lg:text-3xl'>{article.title}</h2>
          <p className='mb-6 text-gray-600'>{article.excerpt}</p>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-4 text-sm text-gray-500'>
              <div className='flex items-center gap-1'>
                <User className='h-4 w-4' /> {article.author}
              </div>
              <div className='flex items-center gap-1'>
                <Eye className='h-4 w-4' /> {article.views}
              </div>
            </div>
            <Button variant='outline' size='sm' className='flex items-center gap-2'>
              Đọc tiếp <ArrowRight className='h-4 w-4' />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  // --- Article Card ---
  const ArticleCard = ({ article }: { article: (typeof mockNewsData.articles)[0] }) => (
    <div className='group overflow-hidden rounded-md bg-white shadow-sm transition hover:shadow-lg'>
      <div className='relative h-48 overflow-hidden'>
        <Image
          src={article.image}
          alt={article.title}
          fill
          className='object-cover transition-transform duration-300 group-hover:scale-105'
        />
        <div className='absolute top-3 left-3'>
          <Badge variant='outline'>{article.category}</Badge>
        </div>
      </div>
      <div className='p-5'>
        <h3 className='group-hover:text-primary mb-3 text-lg font-semibold text-gray-900'>{article.title}</h3>
        <p className='mb-4 line-clamp-3 text-sm text-gray-600'>{article.excerpt}</p>
        <div className='flex items-center justify-between text-xs text-gray-500'>
          <div className='flex gap-3'>
            <div className='flex items-center gap-1'>
              <User className='h-3 w-3' /> {article.author}
            </div>
            <div className='flex items-center gap-1'>
              <Calendar className='h-3 w-3' /> {formatDate(article.publishDate)}
            </div>
          </div>
          <div className='flex items-center gap-2'>
            <div className='flex items-center gap-1'>
              <Eye className='h-3 w-3' /> {article.views}
            </div>
          </div>
        </div>
        <Button variant='ghost' size='sm' className='group-hover:text-primary mt-4 w-full justify-between'>
          Đọc thêm
          <ArrowRight className='h-4 w-4 transition-transform group-hover:translate-x-1' />
        </Button>
      </div>
    </div>
  );

  // --- Sidebar Components ---
  const CategorySidebar = () => (
    <div className='rounded-md bg-white p-6 shadow-sm'>
      <h3 className='mb-4 text-lg font-semibold text-gray-900'>Danh mục</h3>
      <div className='space-y-2'>
        {newsCategories.map((cat) => (
          <Button
            key={cat.id}
            variant={selectedCategory === cat.slug ? 'default' : 'outline'}
            size='sm'
            onClick={() => setSelectedCategory(cat.slug)}
            className='w-full justify-between'
          >
            <span>{cat.name}</span>
            <span className='text-xs'>{cat.count}</span>
          </Button>
        ))}
      </div>
    </div>
  );

  const PopularTags = () => (
    <div className='rounded-md bg-white p-6 shadow-sm'>
      <h3 className='mb-4 text-lg font-semibold text-gray-900'>Thẻ phổ biến</h3>
      <div className='flex flex-wrap gap-2'>
        {popularTags.map((tag, idx) => (
          <Button key={idx} variant='outline' size='sm' className='gap-1 rounded-full'>
            <Tag className='h-3 w-3' /> {tag}
          </Button>
        ))}
      </div>
    </div>
  );

  const SearchBox = () => (
    <div className='rounded-md bg-white p-6 shadow-sm'>
      <h3 className='mb-4 text-lg font-semibold text-gray-900'>Tìm kiếm</h3>
      <div className='relative'>
        <Input placeholder='Nhập từ khóa...' className='pl-10' />
        <Search className='absolute top-3 left-3 h-4 w-4 text-gray-400' />
      </div>
    </div>
  );

  return (
    <div className='mx-auto max-w-7xl py-8'>
      <Breadcrumb items={[{ label: 'Tin tức', path: '/news' }]} />
      <div className='my-8 rounded-md bg-white p-8'>
        <Headline text1='cập nhật xu hướng mới nhất' text2='TIN TỨC THỜI TRANG' />
      </div>

      <div className='flex flex-col gap-8 lg:flex-row'>
        <div className='space-y-8 lg:w-3/4'>
          <FeaturedArticle article={mockNewsData.featured} />

          <div>
            <h2 className='mb-6 text-xl font-semibold text-gray-900'>
              Tất cả bài viết <span className='ml-2 text-sm font-normal text-gray-500'>({115} bài viết)</span>
            </h2>

            {mockNewsData.articles.length > 0 ? (
              <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
                {mockNewsData.articles.map((article) => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </div>
            ) : (
              <div className='rounded-md bg-white p-12 text-center shadow-sm'>
                <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100'>
                  <Search className='h-8 w-8 text-gray-400' />
                </div>
                <h3 className='mb-2 text-lg font-medium text-gray-900'>Không tìm thấy bài viết</h3>
                <p className='text-gray-600'>Thử thay đổi từ khóa tìm kiếm hoặc chọn danh mục khác.</p>
                <Button variant='ghost' className='mt-4' onClick={() => setSelectedCategory('all')}>
                  Xóa bộ lọc
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className='space-y-6 lg:w-1/4'>
          <SearchBox />
          <CategorySidebar />
          <PopularTags />
        </div>
      </div>
    </div>
  );
}
