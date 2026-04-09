import { describe, it, expect, beforeEach } from 'vitest';
import { setupLogin } from '../../src/scripts/login.js';

describe('Login Integration', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <form id="login-form">
        <input id="email" value="fel@mail.com" />
        <input id="password" value="fel_lösen" />
        <div id="error-msg" style="display:none;"></div>
        <button type="submit">Logga in</button>
      </form>
    `;
  });

  it('ska visa felmeddelande vid ogiltig inloggning', () => {
    const form = document.getElementById('login-form');
    setupLogin(form);
    form.dispatchEvent(new Event('submit'));
    
    const errorMsg = document.getElementById('error-msg');
    expect(errorMsg.textContent).toBe('Felaktiga inloggningsuppgifter');
    expect(errorMsg.style.display).toBe('block');
  });
});