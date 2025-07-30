const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) return false;

      const data: AuthResponse = await response.json();
      if (!data.accessToken || !data.refreshToken || !data.expiresIn || !data.user) {
        throw new Error('Invalid authentication response format');
      }

      const expiresAt = Date.now() + data.expiresIn * 1000;

      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      localStorage.setItem('expiresAt', expiresAt.toString());
      localStorage.setItem('user', JSON.stringify(data.user));

      return true;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  }

  static logout(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('expiresAt');
    localStorage.removeItem('user');
  }

  static isAuthenticated(): boolean {
    const expiresAt = Number(localStorage.getItem('expiresAt'));
    return !!localStorage.getItem('accessToken') && Date.now() < expiresAt;
  }

  static async refreshToken(): Promise<boolean> {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      this.logout();
      return false;
    }

    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken })
      });

      if (!response.ok) {
        this.logout();
        return false;
      }

      const data: AuthResponse = await response.json();
      if (!data.accessToken || !data.expiresIn) {
        throw new Error('Invalid token refresh response format');
      }

      const expiresAt = Date.now() + data.expiresIn * 1000;
      
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('expiresAt', expiresAt.toString());
      
      if (data.refreshToken) {
        localStorage.setItem('refreshToken', data.refreshToken);
      }

      return true;
    } catch (error) {
      console.error('Token refresh failed:', error);
      this.logout();
      return false;
    }
  }
}

export default AuthGateway;