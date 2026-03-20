<template>
    <!-- 弹幕调度\弹幕渲染\轨道控制 -->
    <div ref="layerRef" class="danmaku-layer"></div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount } from "vue"
import type { Danmaku } from "@/types/danmaku"
import { useUserStore } from "@/store";

const props = defineProps<{
    video: HTMLVideoElement | null // 视频元素引用，用于获取当前播放时间
    dmList: Danmaku[]
    enabled: boolean
}>()

const layerRef = ref<HTMLDivElement | null>(null) // 弹幕层的 DOM 引用

// 配置项：轨道高度、轨道数量、同时最大弹幕数——可按需调节
const trackHeight = 36
const trackCount = 5
const maxDanmaku = 50

// 当前视频的弹幕索引（表示下一条待渲染弹幕在 props.dmList 的位置）
let dmIndex = 0

// 用于移除事件监听的引用
let timeUpdateHandler: ((this: HTMLVideoElement, ev: Event) => any) | null = null
let lastVideo: HTMLVideoElement | null = null
let lastTime = 0

// 活跃的弹幕列表（正在屏幕上移动的弹幕）
type ActiveDm = {
    el: HTMLDivElement
    elWidth: number
    top: number
    startVideoTime: number
    duration: number
    trackIndex?: number
}
const activeDms: ActiveDm[] = []
// 每个轨道的占用结束时间（以 video.currentTime 为时间基准），用于避免弹幕重叠
const trackEndTimes: number[] = new Array(trackCount).fill(0)
let rafId: number | null = null
function unwrapVideo(v: any): HTMLVideoElement | null {
    if (!v) return null
    if (Object.prototype.hasOwnProperty.call(v, 'value')) return v.value as HTMLVideoElement | null
    return v as HTMLVideoElement | null
}

function startRafLoop() {
    if (rafId !== null) return
    const loop = () => {
        const video = unwrapVideo(props.video)
        // 每次循环结束时决定是否继续调度下一帧
        if (!video || !layerRef.value) {
            rafId = null
            return
        }

        const nowVideoTime = video.currentTime
        const layerWidth = layerRef.value.clientWidth

        for (let i = activeDms.length - 1; i >= 0; i--) {
            const item = activeDms[i]
            const elapsed = nowVideoTime - item.startVideoTime
            const progress = elapsed / item.duration
            // x 从 layerWidth -> -(item.elWidth)
            const totalDistance = layerWidth + item.elWidth
            const x = layerWidth - progress * totalDistance

            // 如果元素已经移动到屏幕左侧之外一点点，则移除（保证完全移出）
            if (x <= -item.elWidth - 1 || progress >= 1.05) {
                // 释放该轨道占用（设置为当前时间，或保留已有更大值）
                if (typeof item.trackIndex === 'number' && item.trackIndex >= 0 && item.trackIndex < trackCount) {
                    trackEndTimes[item.trackIndex] = Math.max(trackEndTimes[item.trackIndex], nowVideoTime)
                }
                item.el.remove()
                activeDms.splice(i, 1)
                continue
            }

            // 使用 transform 保证 GPU 加速
            item.el.style.transform = `translateX(${x}px)`
        }

        // 如果还有活跃弹幕并且视频没有暂停，继续下一帧；否则停止 RAF
        if (activeDms.length > 0 && !video.paused) {
            rafId = requestAnimationFrame(loop)
        } else {
            rafId = null
        }
    }
    rafId = requestAnimationFrame(loop)
}

function stopRafLoop() {
    if (rafId !== null) {
        cancelAnimationFrame(rafId)
        rafId = null
    }
}

/**
 * 随机生成一个轨道位置，避免连续弹幕重叠。
 * 说明：轨道是指弹幕垂直方向上的 "槽"，
 * 我们给每条弹幕随机分配一个轨道，轨道间隔为 trackHeight 像素。
 */
/**
 * 分配轨道（尽量避免重叠）：选择最先可用的轨道。
 * 依据：查看每个轨道的 trackEndTimes（以 video.currentTime 为基准），
 * 如果某轨道可马上使用（endTime <= now），则优先使用，否则选 endTime 最小的轨道。
 */
function allocateTrack(nowVideoTime: number) {
    let best = 0
    for (let i = 0; i < trackCount; i++) {
        if (trackEndTimes[i] <= nowVideoTime) return i
        if (trackEndTimes[i] < trackEndTimes[best]) best = i
    }
    return best
}

/**
 * 创建并渲染一个弹幕元素。
 * 提示：这里不依赖外部弹幕库，直接操作 DOM 创建元素并通过 CSS 动画移动。
 * - 会做基本的存在性检查（弹幕层、是否启用）和数量上限控制。
 * - 为避免异常，给 fontSize 和 color 提供默认值并限制范围。
 */
function renderDanmaku(dm: Danmaku) {
    if (!layerRef.value || !props.enabled) return // 如果弹幕层不存在或弹幕功能未开启，则不渲染

    // 限制同屏弹幕总数，防止页面卡顿（以 activeDms 为准）
    if (activeDms.length >= maxDanmaku) return

    const el = document.createElement('div')
    el.className = 'danmaku-item'
    el.innerText = dm.content || ''

    // 位置与样式：分配轨道，避免重叠
    const v = unwrapVideo(props.video)
    const nowVideoTime = v ? v.currentTime : 0
    const trackIndex = allocateTrack(nowVideoTime)
    const top = trackIndex * trackHeight
    el.style.top = top + 'px'

    // 字号默认 20，限制在 [12, 48] 避免过小或过大
    const fontSize = typeof dm.fontSize === 'number' ? Math.max(12, Math.min(48, dm.fontSize)) : 20
    el.style.fontSize = fontSize + 'px'
    el.style.lineHeight = fontSize + 'px'
    el.style.padding = '1px'

    // 颜色默认白色，确保是字符串
    el.style.color = (dm.color && String(dm.color)) || '#FFFFFF'

    // 如果是当前用户发的弹幕，用文字描边/阴影和轻微背景替代 border，以避免多个弹幕相邻时出现边框叠加的问题
    if (dm.uid === useUserStore().user?.id) {
        el.style.border = '1px solid white'
    }

    // 动画时长将在测量完 elWidth 后根据宽度计算（见下面）

    // 初始样式：放到层中后用 requestAnimationFrame 驱动位置变化
    el.style.position = 'absolute'
    el.style.whiteSpace = 'nowrap'
    el.style.willChange = 'transform'
    // 将元素先放入 DOM，以便测量宽度
    layerRef.value.appendChild(el)

    const elWidth = el.offsetWidth
    // startVideoTime 使用当前视频时间（或 0）作为时间基准，这样动画的进度可依赖于视频 currentTime
    const startVideoTime = v ? v.currentTime : 0

    // 动画时长：根据层宽和元素宽计算，保证文本较长时速度合适
    const baseSpeed = 80 // px/s 基础速度
    const layerW = layerRef.value ? layerRef.value.clientWidth : 800
    const duration = Math.max(3, (layerW + elWidth) / baseSpeed)

    // 记录轨道占用时间，留出少量缓冲（避免刚好重叠）
    // 计算一个基于文本宽度的安全间隔，单位秒，防止前后弹幕视觉上接触
    const safety = Math.min(1.2, Math.max(0.2, (elWidth / baseSpeed) * 0.6))
    trackEndTimes[trackIndex] = startVideoTime + duration * 0.9 + safety

    // 把弹幕推入活跃队列，由 RAF loop 控制位置和移除
    activeDms.push({ el, elWidth, top, startVideoTime, duration, trackIndex })

    // 立刻设置初始位置（在右侧之外），防止首次 RAF 跳帧导致闪烁
    el.style.transform = `translateX(${layerW}px)`

    // 确保 raf loop 在运行
    // 如果视频处于暂停状态，不自动启动 RAF，等待 play 事件恢复
    if (!v || v.paused) {
        // 不启动 RAF，等待 play 触发 startRafLoop
    } else {
        startRafLoop()
    }
}

/**
 * 启动弹幕调度循环：监听视频的 timeupdate 事件并按时间点逐条渲染。
 * 注意点：
 * - 浏览器的 timeupdate 并不是每帧触发，频率可能较低；这里为简单实现。
 * - 当用户 seek（跳转）到更早位置时，需要根据当前时间回退 dmIndex，
 *   否则之前未播放的弹幕会被跳过。
 */
function startLoop() {
    const video = unwrapVideo(props.video)
    if (!video) return

    // 如果之前绑定了同一个 video 的 handler，先移除，避免重复绑定
    if (timeUpdateHandler && lastVideo) {
        lastVideo.removeEventListener('timeupdate', timeUpdateHandler)
        timeUpdateHandler = null
    }

    lastVideo = video
    lastTime = video.currentTime || 0

    // 定义一个可移除的事件处理器（便于在组件卸载或 video 切换时移除）
    timeUpdateHandler = () => {
        try {
            const v = lastVideo
            if (!v || !props.enabled) return
            const current = v.currentTime

            // 如果用户回退（seek to earlier time），则将 dmIndex 回退到第一个时间点大于 current 的位置
            if (current < lastTime) {
                // 二分查找性能更好，尤其是弹幕列表较大时
                let l = 0, r = props.dmList.length
                while (l < r) {
                    const m = (l + r) >> 1
                    if (props.dmList[m].timePoint <= current) l = m + 1
                    else r = m
                }
                dmIndex = l
            }

            // 从当前索引开始渲染所有时间点 <= current 的弹幕
            while (dmIndex < props.dmList.length && props.dmList[dmIndex].timePoint <= current) {
                renderDanmaku(props.dmList[dmIndex])
                dmIndex++
            }

            lastTime = current
        } catch (e) {
            // 容错：不要让任意错误阻塞后续时间更新
            // eslint-disable-next-line no-console
            console.warn('danmaku timeupdate handler error', e)
        }
    }

    video.addEventListener('timeupdate', timeUpdateHandler)
}

// 附加视频事件监听：处理 seek（跳转）场景和 pause/play
function attachVideoEvents(videoRefOrEl: any) {
    const video = unwrapVideo(videoRefOrEl)
    if (!video) return () => {}

    // 在 seeked 时，清空当前活跃弹幕并重置索引
    const onSeeked = () => {
        // 移除所有活跃元素
        while (activeDms.length) {
            const it = activeDms.pop()!
            it.el.remove()
        }
        // 使用二分查找确定新的 dmIndex，使后续渲染从当前时间点之后的弹幕开始
        const cur = video.currentTime
        let l = 0, r = props.dmList.length
        while (l < r) {
            const m = (l + r) >> 1
            if (props.dmList[m].timePoint <= cur) l = m + 1
            else r = m
        }
        dmIndex = l
        lastTime = cur
    }

    const onPlay = () => {
        // 恢复 RAF 循环
        startRafLoop()
    }

    const onPause = () => {
        // 当视频暂停时，停止 RAF 循环以节省 CPU（视觉上弹幕会停止，因为 video.currentTime 不变）
        stopRafLoop()
    }

    video.addEventListener('seeked', onSeeked)
    video.addEventListener('play', onPlay)
    video.addEventListener('pause', onPause)

    // 返回一个解绑函数，便于在 video 变化或组件卸载时清理
    return () => {
        video.removeEventListener('seeked', onSeeked)
        video.removeEventListener('play', onPlay)
        video.removeEventListener('pause', onPause)
    }
}

// 当 video 引用变化时（比如路由切换或组件复用），重新绑定事件
let detachVideoEvents: (() => void) | null = null
watch(
    () => props.video,
    (video) => {
        // 当 video 引用变化时（比如路由切换或组件复用），重新绑定事件
        if (timeUpdateHandler && lastVideo) {
            lastVideo.removeEventListener('timeupdate', timeUpdateHandler)
            timeUpdateHandler = null
        }
        if (detachVideoEvents && lastVideo) {
            detachVideoEvents()
            detachVideoEvents = null
        }

        if (video) {
            const videoEl = unwrapVideo(video)
            if (videoEl) {
                dmIndex = 0
                // 重置轨道占用信息，避免旧视频的占用影响到新视频
                for (let i = 0; i < trackCount; i++) trackEndTimes[i] = 0
                startLoop()
                detachVideoEvents = attachVideoEvents(video)
                lastVideo = videoEl
            }
        } else {
            lastVideo = null
            // 清理活跃弹幕
            while (activeDms.length) {
                const it = activeDms.pop()!
                it.el.remove()
            }
            // 重置轨道占用
            for (let i = 0; i < trackCount; i++) trackEndTimes[i] = 0
        }
    },
    { immediate: true }
)

/**
 * 实时渲染方法：外部（父组件）可调用此方法将收到的实时弹幕立即渲染在屏幕上，
 * 同时会根据视频当前时间做一个简单的容差判断，避免明显不同步的弹幕。
 */
function renderRealtime(dm: Danmaku) {
    console.log('renderRealtime called with dm', dm)
    const v = unwrapVideo(props.video)
    if (!v) return

    const diff = Math.abs(v.currentTime - dm.timePoint) // 计算弹幕时间点与当前视频时间的差值

    // 容差 1s 内则直接显示；这个阈值可根据需求调整
    if (diff < 1) {
        renderDanmaku(dm)
    }
}

// 对外暴露：清理当前所有弹幕（用于切换视频或强制刷新）
function clear() {
    while (activeDms.length) {
        const it = activeDms.pop()!
        it.el.remove()
    }
    for (let i = 0; i < trackCount; i++) trackEndTimes[i] = 0
}

// 在组件卸载时清理事件监听，防止内存泄漏
onBeforeUnmount(() => {
    if (timeUpdateHandler && lastVideo) {
        lastVideo.removeEventListener('timeupdate', timeUpdateHandler)
        timeUpdateHandler = null
    }
    if (detachVideoEvents && lastVideo) {
        detachVideoEvents()
        detachVideoEvents = null
    }
    // 清理并移除所有活跃弹幕
    while (activeDms.length) {
        const it = activeDms.pop()!
        it.el.remove()
    }
    stopRafLoop()
})

defineExpose({
    renderRealtime,
    clear
})
</script>

<style scoped>
.danmaku-layer {
    position: absolute;
    width: 100%;
    height: 100%;
    pointer-events: none;
    overflow: hidden;
}

.danmaku-item {
    position: absolute;
    white-space: nowrap;
    font-weight: bold;
    text-shadow: 1px 1px 2px black;
}

</style>
