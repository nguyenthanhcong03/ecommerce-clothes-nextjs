import { API_ENDPOINTS } from '@/constants/api';
import { http } from '@/lib/http';
import { User } from '@/types/authType';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

export async function POST(request: Request) {
  const body = await request.json();
  const cookieStore = await cookies();
  try {
    const response = await http.post<{
      user: User;
      accessToken: string;
      refreshToken: string;
    }>(`${API_ENDPOINTS.AUTH.LOGIN}`, body);
    console.log('response :>> ', response);
    const { accessToken, refreshToken } = response.data;

    const decodedAccessToken = jwt.decode(accessToken) as { exp: number };
    const decodedRefreshToken = jwt.decode(refreshToken) as { exp: number };

    cookieStore.set('accessToken', accessToken, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      expires: new Date(decodedAccessToken.exp * 1000)
    });
    cookieStore.set('refreshToken', refreshToken, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      expires: new Date(decodedRefreshToken.exp * 1000)
    });
    return Response.json(response);
  } catch {
    return Response.json(
      {
        message: 'Có lỗi xảy ra khi đăng nhập'
      },
      {
        status: 500
      }
    );
  }
}
