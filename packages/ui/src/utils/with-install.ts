import type { App, Plugin } from 'vue'

/**
 * 给组件附加 install 方法
 *
 * 让组件既能局部 import 使用，也能 app.use(SrButton) 全局注册。
 * @param component 组件对象（需含 name）
 * @returns 带 install 的组件
 */
export function srWithInstall<T extends { name?: string }>(component: T): T & Plugin {
  const target = component as T & Plugin
  target.install = (app: App): void => {
    if (target.name) app.component(target.name, target)
  }
  return target
}
