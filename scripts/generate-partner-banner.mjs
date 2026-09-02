import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const endpoint = 'http://127.0.0.1:9223'
const outputPath = resolve('docs/images/university-partnership.png')

function imageData(path, mimeType) {
  return `data:${mimeType};base64,${readFileSync(resolve(path)).toString('base64')}`
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

const tyutLogo = imageData('public/assets/partners/tyut-emblem.svg', 'image/svg+xml')
const nwnuLogo = imageData('public/assets/partners/nwnu-logo-hq.jpg', 'image/jpeg')
const html = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    <style>
      * { box-sizing: border-box; }
      html, body { width: 1600px; height: 300px; margin: 0; overflow: hidden; }
      body {
        display: grid;
        place-items: center;
        background-color: #0d1117;
        background-image:
          linear-gradient(rgba(255,255,255,.035) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,.035) 1px, transparent 1px);
        background-size: 48px 48px;
        border-top: 1px solid #30363d;
        border-bottom: 1px solid #30363d;
      }
      .partnership {
        display: grid;
        grid-template-columns: 610px 120px 610px;
        align-items: center;
        justify-items: center;
        gap: 18px;
      }
      .logo {
        display: flex;
        width: 610px;
        height: 180px;
        gap: 28px;
        align-items: center;
        justify-content: center;
      }
      .logo img, .logo canvas {
        display: block;
        flex: 0 0 148px;
        width: 148px;
        height: 148px;
        object-fit: contain;
        filter: grayscale(1) brightness(0) invert(1);
      }
      .logo-copy { display: grid; gap: 12px; text-align: left; }
      .logo-copy strong { color: #f0f3f6; font: 700 34px/1.1 'Microsoft YaHei', Arial, sans-serif; letter-spacing: 1px; }
      .logo-copy span { color: #b7c0ca; font: 500 17px/1.1 Arial, sans-serif; letter-spacing: 1px; white-space: nowrap; }
      .mark {
        color: #f2cc60;
        font: 700 56px/1 Arial, sans-serif;
        text-shadow: 0 0 22px rgba(242, 204, 96, .16);
      }
    </style>
  </head>
  <body>
    <main class="partnership">
      <div class="logo">
        <img src="${tyutLogo}" alt="太原理工大学校徽">
        <div class="logo-copy"><strong>太原理工大学</strong><span>TAIYUAN UNIVERSITY OF TECHNOLOGY</span></div>
      </div>
      <div class="mark">×</div>
      <div class="logo">
        <canvas id="nwnu" width="316" height="316"></canvas>
        <div class="logo-copy"><strong>西北师范大学</strong><span>NORTHWEST NORMAL UNIVERSITY</span></div>
      </div>
    </main>
  </body>
</html>`

const target = await fetch(`${endpoint}/json/new?about:blank`, { method: 'PUT' }).then((response) =>
  response.json(),
)
const client = await connect(target.webSocketDebuggerUrl)

try {
  await client.send('Page.enable')
  await client.send('Emulation.setDeviceMetricsOverride', {
    width: 1600,
    height: 300,
    deviceScaleFactor: 2,
    mobile: false,
  })
  await client.send('Page.setDocumentContent', { frameId: target.id, html }).catch(async () => {
    await client.send('Runtime.evaluate', {
      expression: `document.open();document.write(${JSON.stringify(html)});document.close();`,
    })
  })
  await client.send('Runtime.evaluate', {
    expression: `(() => {
      const image = new Image();
      image.src = ${JSON.stringify(nwnuLogo)};
      image.onload = () => {
        const canvas = document.querySelector('#nwnu');
        const context = canvas.getContext('2d');
        context.drawImage(image, 0, 0);
        const pixels = context.getImageData(0, 0, canvas.width, canvas.height);
        const data = pixels.data;
        for (let index = 0; index < data.length; index += 4) {
          const darkness = 255 - Math.min(data[index], data[index + 1], data[index + 2]);
          data[index] = 255;
          data[index + 1] = 255;
          data[index + 2] = 255;
          data[index + 3] = Math.min(255, darkness * 1.35);
        }
        context.putImageData(pixels, 0, 0);
      };
    })()`
  })
  await new Promise((resolveWait) => setTimeout(resolveWait, 1200))
  const { data } = await client.send('Page.captureScreenshot', {
    format: 'png',
    captureBeyondViewport: false,
    fromSurface: true,
  })
  writeFileSync(outputPath, Buffer.from(data, 'base64'))
} finally {
  client.close()
  await fetch(`${endpoint}/json/close/${target.id}`)
}
