import { authService } from '@/services/authService';
import { API_ENDPOINTS } from '@/lib/config';
import { http } from '@/lib/http';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

export async function POST() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get('refreshToken')?.value;
  if (!refreshToken) {
    return Response.json(
      {
        message: 'Không tìm thấy refreshToken'
      },
      {
        status: 401
      }
    );
  }
  try {
    const response = await http.post<{
      accessToken: string;
    }>(`${API_ENDPOINTS.AUTH.REFRESH_TOKEN}`, null, {
      headers: {
        'Content-Type': 'application/json',
        Cookie: `refreshToken=${refreshToken}`
      }
    });
    if (!response.data?.accessToken) {
      throw new Error('Refresh token thất bại');
    }
    const newAccessToken = response.data?.accessToken;

    const decodedAccessToken = jwt.decode(newAccessToken) as {
      exp: number;
    };

    // Set cookies với token mới
    cookieStore.set('accessToken', newAccessToken, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      expires: new Date(decodedAccessToken.exp * 1000)
    });

    return Response.json(newAccessToken);
  } catch (error: unknown) {
    console.log(error);
    const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra';
    return Response.json(
      {
        message: errorMessage
      },
      {
        status: 401
      }
    );
  }
}
