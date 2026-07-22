import { ADMIN_INPUT, ADMIN_LABEL } from './AdminField'

export default function AdminSelectField({ label, children, ...props }) {
  return (
    <div>
      {label && <label className={ADMIN_LABEL}>{label}</label>}
      <select className={ADMIN_INPUT} {...props}>
        {children}
      </select>
    </div>
  )
}
