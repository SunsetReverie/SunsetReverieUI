import type { Component } from 'vue'

/**
 * 组件演示注册表
 *
 * 一组件一页。新增组件时只需要：写一个 `xxx/XxxDemo.vue`，再把这一行的
 * `demo` 指向它。路由、侧栏、Props 表都由这张表驱动。
 *
 * `api` 字段对应 `props.json` 里的键（由 `pnpm gen:demo-props` 从组件源码提取），
 * 所以 API 表永远不会和代码脱节。
 */
export interface DemoEntry {
  /** 路由与侧栏用的唯一标识 */
  key: string
  /** 组件名 */
  name: string
  /** 一句话说明，显示在页面顶部 */
  description: string
  /** props.json 里的键；与 key 相同可省略 */
  api?: string
  /** 演示组件，懒加载 */
  demo: () => Promise<Component>
}

/** 侧栏分组 */
export interface DemoGroup {
  title: string
  items: DemoEntry[]
}

export const demoGroups: DemoGroup[] = [
  {
    title: '基础',
    items: [
      {
        key: 'button',
        name: 'SrButton',
        description: '按钮。变体只改 CSS 变量的值，结构与交互完全共用。',
        demo: () => import('./button/ButtonDemo.vue'),
      },
      {
        key: 'icon',
        name: 'SrIcon',
        description: '图标。编译期子集化，运行时不发请求。',
        demo: () => import('./icon/IconDemo.vue'),
      },
      {
        key: 'spinner',
        name: 'SrSpinner',
        description: '环形加载指示器。',
        demo: () => import('./spinner/SpinnerDemo.vue'),
      },
      {
        key: 'progress',
        name: 'SrProgress',
        description: '进度条。四种状态、条纹流动、文字内外两态。',
        demo: () => import('./progress/ProgressDemo.vue'),
      },
      {
        key: 'descriptions',
        name: 'SrDescriptions',
        description: '描述列表。详情页的字段名与值排版，支持列数、边框与跨列。',
        demo: () => import('./descriptions/DescriptionsDemo.vue'),
      },
      {
        key: 'steps',
        name: 'SrSteps',
        description: '步骤条。横向纵向、简洁模式、可点击切换与出错状态。',
        demo: () => import('./steps/StepsDemo.vue'),
      },
      {
        key: 'alert',
        name: 'SrAlert',
        description: '警告提示。四种类型、可关闭、通栏与富内容。',
        demo: () => import('./alert/AlertDemo.vue'),
      },
      {
        key: 'tag',
        name: 'SrTag',
        description: '状态标签。六种语义色、深浅两档。',
        demo: () => import('./tag/TagDemo.vue'),
      },
    ],
  },
  {
    title: '表单',
    items: [
      {
        key: 'input',
        name: 'SrInput',
        description: '输入框。前后缀、清空、密码可见、字数统计、校验态。',
        demo: () => import('./input/InputDemo.vue'),
      },
      {
        key: 'slider',
        name: 'SrSlider',
        description: '滑块。单值或区间、步长吸附、间断点、纵向。',
        demo: () => import('./slider/SliderDemo.vue'),
      },
      {
        key: 'input-number',
        name: 'SrInputNumber',
        description: '数字输入。范围、步长、精度控制。',
        demo: () => import('./input-number/InputNumberDemo.vue'),
      },
      {
        key: 'qrcode',
        name: 'SrQRCode',
        description: '二维码。零依赖自研编码，支持纠错等级、中心图标与失效状态。',
        demo: () => import('./qrcode/QrcodeDemo.vue'),
      },
      {
        key: 'color-picker',
        name: 'SrColorPicker',
        description: '颜色选择器。饱和度面板、色相条、透明度与预设色板。',
        demo: () => import('./color-picker/ColorPickerDemo.vue'),
      },
      {
        key: 'transfer',
        name: 'SrTransfer',
        description: '穿梭框。双列表选择，支持搜索、全选与禁用。',
        demo: () => import('./transfer/TransferDemo.vue'),
      },
      {
        key: 'cascader',
        name: 'SrCascader',
        description: '级联选择。多级联动、可搜索、支持多选。',
        demo: () => import('./cascader/CascaderDemo.vue'),
      },
      {
        key: 'select',
        name: 'SrSelect',
        description: '选择器。单选、多选、可搜索、可清空。',
        demo: () => import('./select/SelectDemo.vue'),
      },
      {
        key: 'checkbox',
        name: 'SrCheckbox',
        description: '多选框。单用与组用两种模式，支持半选。',
        demo: () => import('./checkbox/CheckboxDemo.vue'),
      },
      {
        key: 'segmented',
        name: 'SrSegmented',
        description: '分段控制器。等分选项、滑动指示器，适合视图切换。',
        demo: () => import('./segmented/SegmentedDemo.vue'),
      },
      {
        key: 'radio',
        name: 'SrRadio',
        description: '单选框。组内互斥，方向键切换。',
        demo: () => import('./radio/RadioDemo.vue'),
      },
      {
        key: 'switch',
        name: 'SrSwitch',
        description: '开关。正常、禁用、加载三态。',
        demo: () => import('./switch/SwitchDemo.vue'),
      },
      {
        key: 'date-picker',
        name: 'SrDatePicker',
        description: '日期选择。单日、区间、带时间、范围限制与快捷选项。',
        demo: () => import('./date-picker/DatePickerDemo.vue'),
      },
      {
        key: 'form',
        name: 'SrForm',
        description: '表单容器与校验。规则支持异步，三种标签布局。',
        demo: () => import('./form/FormDemo.vue'),
      },
    ],
  },
  {
    title: '数据',
    items: [
      {
        key: 'virtual-list',
        name: 'SrVirtualList',
        description: '虚拟列表。长列表只渲染可视区，一万条也不卡。',
        demo: () => import('./virtual-list/VirtualListDemo.vue'),
      },
      {
        key: 'table',
        name: 'SrTable',
        description: '数据表格。排序、多选、展开、固定列、分页、懒加载。',
        demo: () => import('./table/TableDemo.vue'),
      },
      {
        key: 'pagination',
        name: 'SrPagination',
        description: '分页。页码收敛、每页条数、跳页。',
        demo: () => import('./pagination/PaginationDemo.vue'),
      },
      {
        key: 'load-more',
        name: 'SrLoadMore',
        description: '加载更多。三态枚举，可自动触发。',
        demo: () => import('./load-more/LoadMoreDemo.vue'),
      },
      {
        key: 'tree',
        name: 'SrTree',
        description: '树形控件。展开折叠、复选联动、半选、虚拟滚动。',
        demo: () => import('./tree/TreeDemo.vue'),
      },
      {
        key: 'upload',
        name: 'SrUpload',
        description: '文件上传。点击或拖拽、进度、多文件、图片预览与各种限制。',
        demo: () => import('./upload/UploadDemo.vue'),
      },
    ],
  },
  {
    title: '展示',
    items: [
      {
        key: 'card',
        name: 'SrCard',
        description: '卡片。头部 / 主体 / 底部三段，内边距可调。',
        demo: () => import('./card/CardDemo.vue'),
      },
      {
        key: 'timeline',
        name: 'SrTimeline',
        description: '时间轴。节点类型、图标、左右布局与倒序。',
        demo: () => import('./timeline/TimelineDemo.vue'),
      },
      {
        key: 'collapse',
        name: 'SrCollapse',
        description: '折叠面板组。可多开或手风琴，支持禁用与自定义内容。',
        demo: () => import('./collapse/CollapseDemo.vue'),
      },
      {
        key: 'panel',
        name: 'SrPanel',
        description: '分区面板。轻量容器，可折叠。',
        demo: () => import('./panel/PanelDemo.vue'),
      },
      {
        key: 'carousel',
        name: 'SrCarousel',
        description: '轮播。滑动与淡入淡出、自动播放、触摸滑动。',
        demo: () => import('./carousel/CarouselDemo.vue'),
      },
      {
        key: 'badge',
        name: 'SrBadge',
        description: '徽标。数字角标与状态点。',
        demo: () => import('./badge/BadgeDemo.vue'),
      },
      {
        key: 'avatar',
        name: 'SrAvatar',
        description: '头像。图片失败回退，底色按 alt 自动取色。',
        demo: () => import('./avatar/AvatarDemo.vue'),
      },
      {
        key: 'skeleton',
        name: 'SrSkeleton',
        description: '骨架屏。加载时占住布局，避免内容出现时整块跳变。',
        demo: () => import('./skeleton/SkeletonDemo.vue'),
      },
      {
        key: 'result',
        name: 'SrResult',
        description: '结果页。四种状态的整页反馈，支持额外信息与操作区。',
        demo: () => import('./result/ResultDemo.vue'),
      },
      {
        key: 'empty',
        name: 'SrEmpty',
        description: '空状态。图标 / 插图 / 虚线框 / 操作区。',
        demo: () => import('./empty/EmptyDemo.vue'),
      },
    ],
  },
  {
    title: '导航',
    items: [
      {
        key: 'nav',
        name: 'SrNav',
        description: '导航。水平与垂直、分组、子菜单、收起态浮层。',
        demo: () => import('./nav/NavDemo.vue'),
      },
      {
        key: 'tabs',
        name: 'SrTabs',
        description: '标签页。四种外观、垂直方向、懒加载。',
        demo: () => import('./tabs/TabsDemo.vue'),
      },
      {
        key: 'breadcrumb',
        name: 'SrBreadcrumb',
        description: '面包屑。图标分隔符、超长折叠、禁用项。',
        demo: () => import('./breadcrumb/BreadcrumbDemo.vue'),
      },
      {
        key: 'dropdown',
        name: 'SrDropdown',
        description: '下拉菜单。内置菜单与自定义面板。',
        demo: () => import('./dropdown/DropdownDemo.vue'),
      },
    ],
  },
  {
    title: '反馈',
    items: [
      {
        key: 'modal',
        name: 'SrModal',
        description: '弹窗。遮罩、焦点陷阱、嵌套、全屏。',
        demo: () => import('./modal/ModalDemo.vue'),
      },
      {
        key: 'drawer',
        name: 'SrDrawer',
        description: '抽屉。四方向、尺寸预设、圆角形态。',
        demo: () => import('./drawer/DrawerDemo.vue'),
      },
      {
        key: 'tooltip',
        name: 'SrTooltip',
        description: '文字提示。12 方向、自动翻转。',
        demo: () => import('./tooltip/TooltipDemo.vue'),
      },
      {
        key: 'confirm',
        name: 'SrConfirm',
        description: '确认框。命令式调用，Promise 化。',
        demo: () => import('./confirm/ConfirmDemo.vue'),
      },
      {
        key: 'toast',
        name: 'SrToast',
        description: '轻提示。命令式，六种位置。',
        demo: () => import('./toast/ToastDemo.vue'),
      },
      {
        key: 'message',
        name: 'SrMessage',
        description: '全局消息。顶部居中，比 Toast 更安静。',
        demo: () => import('./message/MessageDemo.vue'),
      },
      {
        key: 'notification',
        name: 'SrNotification',
        description: '通知。带标题与详情的角落卡片。',
        demo: () => import('./notification/NotificationDemo.vue'),
      },
    ],
  },
  {
    title: '布局与配置',
    items: [
      {
        key: 'row',
        name: 'SrRow / SrCol',
        api: 'row',
        description: '24 栅格。响应式 span 全部由 CSS 媒体查询完成。',
        demo: () => import('./row/RowDemo.vue'),
      },
      {
        key: 'config-provider',
        name: 'SrConfigProvider',
        description: '全局配置。尺寸与弹层层级下发。',
        demo: () => import('./config-provider/ConfigProviderDemo.vue'),
      },
      {
        key: 'transition',
        name: 'SrTransition',
        description: '过渡。五套预设，统一处理 reduced-motion。',
        demo: () => import('./transition/TransitionDemo.vue'),
      },
    ],
  },
]

/** 扁平化后的清单，供路由查找 */
export const demoEntries: DemoEntry[] = demoGroups.flatMap((group) => group.items)

/**
 * 按 key 找组件条目
 * @param key 路由参数
 * @returns 条目或 undefined
 */
export function findDemo(key: string): DemoEntry | undefined {
  return demoEntries.find((entry) => entry.key === key)
}
