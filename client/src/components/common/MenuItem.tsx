'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

type MenuItemProps = {
  href: string;
  text: string;
  exact?: boolean;
  onClick?: () => void;
};

function MenuItem({ href, text, exact = false, onClick }: MenuItemProps) {
  const pathname = usePathname();
  const isActive = exact ? pathname === href : pathname.startsWith(href);
  return (
    <div className='group relative'>
      <Link
        href={href}
        onClick={onClick}
        className={
          isActive
            ? 'after:block after:h-[3px] after:origin-right after:bg-[#333] after:duration-300 after:content-[""]'
            : 'after:block after:h-[3px] after:origin-right after:scale-0 after:bg-[#333] after:opacity-0 after:duration-300 after:content-[""] hover:after:scale-100 hover:after:opacity-100'
        }
      >
        <div className='flex cursor-pointer items-center justify-center gap-2 pt-0.5 after:absolute after:top-full after:hidden after:h-5 after:w-full after:bg-transparent after:content-[""] after:group-hover:block'>
          <span>{text}</span>
        </div>
      </Link>
    </div>
  );
}

export default MenuItem;
