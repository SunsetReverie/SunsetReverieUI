import { srWithInstall } from '../../utils/with-install'
import QRCode from './src/qrcode.vue'

/** 二维码 */
export const SrQRCode = srWithInstall(QRCode)

export * from './src/qrcode'
export { encodeQr, getCapacity, pickVersion, type SrQrLevel, type SrQrMatrix } from './src/encoder'
export default SrQRCode
