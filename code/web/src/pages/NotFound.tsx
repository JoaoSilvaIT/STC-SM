import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import styles from './NotFound.module.css'

export default function NotFound() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  return (
    <div className={styles.page}>
      <div className={styles.code}>404</div>
      <div className={styles.title}>{t('notFound.title')}</div>
      <div className={styles.sub}>{t('notFound.sub')}</div>
      <button className={styles.btn} onClick={() => navigate('/dashboard', { replace: true })}>
        {t('notFound.button')}
      </button>
    </div>
  )
}
