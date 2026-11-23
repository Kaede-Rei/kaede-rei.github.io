const closingPanels = new WeakMap<HTMLDialogElement, Animation[]>()

export function presentModal(panel: HTMLDialogElement, pointer = false) {
  panel.toggleAttribute('data-modal-entering', pointer)
  panel.showModal()
}

export function dismissModal(panel?: HTMLDialogElement, pointer = false, afterClose?: () => void) {
  if (!panel?.open) return

  const finish = () => {
    closingPanels.delete(panel)
    panel.removeAttribute('data-modal-leaving')
    if (!panel.isConnected || !panel.open) return
    panel.close()
    afterClose?.()
  }

  if (!pointer || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    finish()
    return
  }
  if (closingPanels.has(panel)) return

  panel.setAttribute('data-modal-leaving', '')
  const transitions = panel.getAnimations?.() ?? []
  if (!transitions.length) {
    finish()
    return
  }

  // The native dialog and page scroll lock stay active through the visible exit.
  closingPanels.set(panel, transitions)
  void Promise.allSettled(transitions.map(transition => transition.finished)).then(() => {
    if (closingPanels.get(panel) === transitions) finish()
  })
}
