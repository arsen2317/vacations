import { createRoot } from 'react-dom/client'
import { FONT_CSS } from '../../src/ds/fonts'
import VacationDemo from './VacationDemo'
import demoCss from './style.css?inline'

const styles = document.createElement('style')
styles.textContent = FONT_CSS + demoCss
document.head.append(styles)

createRoot(document.getElementById('root')).render(<VacationDemo />)
