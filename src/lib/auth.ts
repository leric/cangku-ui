import { writable } from 'svelte/store';
import { goto } from '$app/navigation';
import { browser } from '$app/environment';

const tokenStore = writable<string | null>(null);

export const auth = {
  async login(username: string, password: string) {
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: username, password })
      });
      
      if (response.ok) {
        const token = await response.json();
        tokenStore.set(token);
        localStorage.setItem('token', token);
        return true;
      }
    } catch (error) {
      console.error('Login failed:', error);
    }
    return false;
  },

  isAuthenticated() {
    return !!this.getToken();
  },

  requireAuth(url: string) {
    if (!this.isAuthenticated()) {
      goto(`/login?redirect=${encodeURIComponent(url)}`);
      return false;
    }
    return true;
  },

  logout() {
    tokenStore.set(null);
    localStorage.removeItem('token');
  },

  getToken() {
    if (browser) {
      return localStorage.getItem('token');
    }
    return null;
  }
};

export { tokenStore };