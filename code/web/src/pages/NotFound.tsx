import { useNavigate } from 'react-router-dom'
import styles from './NotFound.module.css'

export default function NotFound() {
  const navigate = useNavigate()
  return (
    <div className={styles.page}>
      <div className={styles.code}>404</div>
      <div className={styles.title}>Page Not Found</div>
      <div className={styles.sub}>This route does not exist in the system.</div>
      <button className={styles.btn} onClick={() => navigate('/dashboard', { replace: true })}>
        Return to Dashboard
      </button>
    </div>
  )
}
