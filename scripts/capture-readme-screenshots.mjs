import { mkdirSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const endpoint = 'http://127.0.0.1:9223'
const pageUrl = 'http://127.0.0.1:5173/Red-Army-Street/'
const outputDirectory = resolve('docs/images')

async function wait(milliseconds) {
  await new Promise((resolveWait) => setTimeout(resolveWait, milliseconds))
}

async function connect(webSocketUrl) {
  const socket = new WebSocket(webSocketUrl)
  await new Promise((resolveOpen, rejectOpen) => {
    socket.addEventListener('open', resolveOpen, { once: true })
    socket.addEventListener('error', rejectOpen, { once: true })
  })

  let sequence = 0
  const pending = new Map()
  socket.addEventListener('message', (event) => {
    const message = JSON.parse(event.data)
    if (!message.id || !pending.has(message.id)) return
    const { resolveCommand, rejectCommand } = pending.get(message.id)
    pending.delete(message.id)
    if (message.error) rejectCommand(new Error(message.error.message))
    else resolveCommand(message.result)
  })

  return {
    close: () => socket.close(),
    send(method, params = {}) {
      sequence += 1
      const id = sequence
      socket.send(JSON.stringify({ id, method, params }))
      return new Promise((resolveCommand, rejectCommand) => {
        pending.set(id, { resolveCommand, rejectCommand })
      })
    },
  }
}

async function capture(client, filename) {
  const { data } = await client.send('Page.captureScreenshot', {
    format: 'png',
    captureBeyondViewport: false,
    fromSurface: true,
  })
  writeFileSync(resolve(outputDirectory, filename), Buffer.from(data, 'base64'))
}

async function clickLandmark(client, landmarkId) {
  await client.send('Runtime.evaluate', {
    expression: `document.querySelector('[data-landmark-id="${landmarkId}"]').click()`,
    returnByValue: true,
  })
  await wait(5000)
}

mkdirSync(outputDirectory, { recursive: true })

const target = await fetch(`${endpoint}/json/new?${encodeURIComponent(pageUrl)}`, {
  method: 'PUT',
}).then((response) => response.json())
const client = await connect(target.webSocketDebuggerUrl)

try {
  await client.send('Page.enable')
  await client.send('Runtime.enable')
  await client.send('Emulation.setDeviceMetricsOverride', {
    width: 1440,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false,
  })
  await client.send('Page.navigate', { url: pageUrl })
  await wait(5000)
  await capture(client, 'red-army-street-map.png')

  await clickLandmark(client, 'red-army-gate')
  await capture(client, 'red-army-gate.png')

  await client.send('Runtime.evaluate', {
    expression: `document.querySelector('.modal-close').click()`,
    returnByValue: true,
  })
  await wait(800)
  await clickLandmark(client, 'guandi-temple')
  await capture(client, 'guandi-temple.png')
} finally {
  client.close()
  await fetch(`${endpoint}/json/close/${target.id}`)
}
