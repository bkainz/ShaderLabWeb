import CallbackRegistry from './CallbackRegistry'

const callbacks = new CallbackRegistry('')
const signals = 'SIGINT SIGTERM'.split(' ')

async function signalHandler(signal) {
  process.stdout.write('\n')
  await run()
  process.kill(process.pid, signal)
}

async function exceptionHandler(exception) {
  console.error(exception)
  const ignoreFurtherExceptions = () => {}
  process.on('uncaughtException', ignoreFurtherExceptions)
  await run()
  process.removeListener('uncaughtException', ignoreFurtherExceptions)
  process.exit(1)
}

async function run() {
  for (const signal of signals) process.removeListener(signal, signalHandler)
  process.removeListener('uncaughtException', exceptionHandler)
  await callbacks.call()
}

for (const signal of signals) process.on(signal, signalHandler)
process.on('uncaughtException', exceptionHandler)

export default callbacks