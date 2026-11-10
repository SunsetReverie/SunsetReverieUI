import { srWithInstall } from '../../utils/with-install'
import MusicPlayer from './src/music-player.vue'

/** 音乐播放器 */
export const SrMusicPlayer = srWithInstall(MusicPlayer)

export * from './src/music-player'
export * from './src/types'
export * from './src/api'
export * from './src/lrc'
export default SrMusicPlayer
