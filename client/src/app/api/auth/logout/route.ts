import { API_ENDPOINTS } from '@/constants/api';
import { http } from '@/lib/http';
import { cookies } from 'next/headers';

export async function POST() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('accessToken')?.value;
  const refreshToken = cookieStore.get('refreshToken')?.value;
  cookieStore.delete('accessToken');
  cookieStore.delete('refreshToken');
  if (!accessToken || !refreshToken) {
    return Response.json(
      {
        message: 'Không nhận được access token hoặc refresh token'
      },
      {
        status: 200
      }
    );
  }
  try {
    console.log('accessToken :>> ', accessToken);
    // Gọi API logout tới backend Express
    const response = await http.post(API_ENDPOINTS.AUTH.LOGOUT, null, {
      headers: {
        'Content-Type': 'application/json',
        Cookie: `accessToken=${accessToken}; refreshToken=${refreshToken}`
      }
    });

    return Response.json(response);
  } catch {
    return Response.json(
      {
        message: 'Có lỗi xảy ra khi đăng xuất'
      },
      {
        status: 500
      }
    );
  }
}
