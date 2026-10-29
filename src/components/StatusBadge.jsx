import { StatusBadge as DSStatusBadge } from '../ds/index'

// Legacy wrapper: status badges come from the DS
export default function StatusBadge({ status }) {
  return <DSStatusBadge type={status} />
}
