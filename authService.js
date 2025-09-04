class AuthService {
  constructor() {
    this.token = null;
    this.user = null;
  }

  async login() {
    return new Promise((resolve, reject) => {
      chrome.identity.getAuthToken({ interactive: true }, (token) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
          return;
        }
        this.token = token;
        resolve(token);
      });
    });
  }

  async fetchUserInfo() {
    const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { 'Authorization': `Bearer ${this.token}` }
    });
    this.user = await response.json();
    return this.user;
  }

  async isAuthenticated() {
    this.token = await new Promise(resolve => {
      chrome.identity.getAuthToken({ interactive: false }, resolve);
    });
    return !!this.token;
  }

  async logout() {
    if (this.token) {
      await fetch(`https://accounts.google.com/o/oauth2/revoke?token=${this.token}`);
      chrome.identity.removeCachedAuthToken({ token: this.token });
      this.token = null;
      this.user = null;
    }
  }
}

const authService = new AuthService();
export default authService;