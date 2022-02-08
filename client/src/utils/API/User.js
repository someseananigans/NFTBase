const hAuth = {
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem('user')}`
}

const hNorm = {
  "Content-Type": "application/json",
}

const User = {
  getCurrent: () => fetch('/api/user', {
    method: 'GET',
    headers: hAuth
  })
    .then(response => response.json()),
  getAll: () => fetch('/api/users', {
    method: 'GET',
    headers: hNorm
  })
    .then(response => response.json()),
}

export default User
