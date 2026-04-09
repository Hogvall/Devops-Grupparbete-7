export function setupLogin(formElement) {
  formElement.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorMsg = document.getElementById('error-msg');


    if (email === 'test@example.com' && password === '123') {
      const hardcodedUser = { id: '1', email: 'test@example.com' };
      localStorage.setItem('user', JSON.stringify(hardcodedUser));
      window.location.href = '/calendar.html'; 
    } else {
      errorMsg.textContent = "Felaktiga inloggningsuppgifter";
      errorMsg.style.display = 'block';
    }
  });
}