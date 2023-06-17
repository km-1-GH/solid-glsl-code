import { createSignal, createRoot, createEffect } from "solid-js"

function setGlobalState() {
  const [status, setStatus] = createSignal("default")

  // createEffect(() => {
  //   console.log(status());
  // })

  return {
    status, setStatus,
  }
}

export default createRoot(setGlobalState)
