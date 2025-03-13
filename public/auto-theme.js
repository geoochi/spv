;(function () {
  const themeListener = () => {
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.body.classList.add('dark')
    } else {
      document.body.classList.remove('dark')
    }
  }
  themeListener()
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', themeListener)
})()
