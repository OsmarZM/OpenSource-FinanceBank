import { Command } from 'commander'
import { createRequire } from 'node:module'
import { runDemo } from './commands/demo'
import { runStart } from './commands/start'

const require = createRequire(import.meta.url)
const pkg = require('../package.json') as { version: string }

const program = new Command()

program
  .name('fin-engine')
  .description('💰 FinEngine OSS — Motor de inteligência financeira open source')
  .version(pkg.version)

program
  .command('demo')
  .description('Executa análise com dados simulados (sem configuração necessária)')
  .action(runDemo)

program
  .command('start', { isDefault: true })
  .description('Inicia o modo interativo')
  .action(runStart)

program.parseAsync(process.argv).catch((err: unknown) => {
  console.error(err)
  process.exit(1)
})
