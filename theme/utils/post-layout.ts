export type LayoutMode = 'image' | 'text' | 'alternate'
export interface PostLayouts {
  version: 2
  desktop: LayoutMode
  mobile: Exclude<LayoutMode, 'alternate'>
}

export function readPostLayouts(): PostLayouts {
  const defaults: PostLayouts = { version: 2, desktop: 'image', mobile: 'image' }
  try {
    const storage = window.localStorage
    const key = 'kaede-post-layout-v2'
    const isDesktop = (mode: unknown): mode is LayoutMode => mode === 'image' || mode === 'text' || mode === 'alternate'
    const isMobile = (mode: unknown): mode is PostLayouts['mobile'] => mode === 'image' || mode === 'text'
    const saved = storage.getItem(key)
    if (saved !== null) {
      const value = JSON.parse(saved)
      return {
        version: 2,
        desktop: value?.version === 2 && isDesktop(value.desktop) ? value.desktop : 'image',
        mobile: value?.version === 2 && isMobile(value.mobile) ? value.mobile : 'image',
      }
    }

    const legacy = storage.getItem('kaede-post-layout')
    const migrated: PostLayouts = {
      version: 2,
      desktop: isDesktop(legacy) ? legacy : 'image',
      mobile: isMobile(legacy) ? legacy : 'image',
    }
    if (legacy !== null) storage.setItem(key, JSON.stringify(migrated))
    return migrated
  }
  catch {
    return defaults
  }
}

export function applyPostLayouts(layouts: PostLayouts) {
  document.documentElement.dataset.desktopPostLayout = layouts.desktop
  document.documentElement.dataset.mobilePostLayout = layouts.mobile
}

// Set the CSS attributes before first paint without changing the SSG markup.
export const postLayoutBootstrap = `(${applyPostLayouts.toString()})((${readPostLayouts.toString()})())`
