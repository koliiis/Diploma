import { Link } from 'react-router-dom'

export function LoginPage() {
  return (
    <div>
      <h1>Login Page</h1>
      <p>Тут буде сторінка входу</p>

      <Link to="/dashboard">Увійти</Link>
    </div>
  )
}