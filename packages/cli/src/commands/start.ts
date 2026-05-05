import { select, input } from '@inquirer/prompts'
import chalk from 'chalk'
import { CsvConnector } from '@fin-engine/connector-csv'
import { FinancialEngine } from '@fin-engine/core'
import { displayResult } from '../ui/display'
import { runDemo } from './demo'
import ora from 'ora'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'

export async function runStart(): Promise<void> {
  console.log()
  console.log(
    chalk.bold.green('💰  Bem-vindo ao FinEngine OSS'),
  )
  console.log(chalk.gray('  Motor de inteligência financeira open source\n'))

  const choice = await select({
    message: 'O que você deseja fazer?',
    choices: [
      { name: '🎮  Demo  (dados simulados, sem configuração)', value: 'demo' },
      { name: '📄  Importar CSV', value: 'csv' },
      { name: '🔌  Conectar banco (Pluggy) — em breve', value: 'pluggy', disabled: true },
      { name: '❌  Sair', value: 'exit' },
    ],
  })

  switch (choice) {
    case 'demo':
      await runDemo()
      break

    case 'csv': {
      const filePath = await input({
        message: 'Caminho do arquivo CSV:',
        default: 'examples/sample.csv',
        validate: (v) => {
          const resolved = resolve(v)
          return existsSync(resolved) ? true : `Arquivo não encontrado: ${resolved}`
        },
      })

      const spinner = ora({ text: 'Lendo arquivo CSV...', color: 'cyan' }).start()
      try {
        const connector = new CsvConnector(resolve(filePath))
        await connector.connect()
        const transactions = await connector.getTransactions()

        spinner.text = 'Analisando transações...'
        await new Promise((r) => setTimeout(r, 300))

        const engine = new FinancialEngine()
        const result = engine.analyze(transactions)

        spinner.succeed(chalk.green(`${transactions.length} transações importadas`))
        displayResult(result)
      } catch (err) {
        spinner.fail(chalk.red('Erro ao processar CSV'))
        if (err instanceof Error) {
          console.error(chalk.red(`\n  ${err.message}`))
        }
        process.exit(1)
      }
      break
    }

    case 'exit':
      console.log(chalk.gray('\n  Até mais! 👋\n'))
      process.exit(0)
  }
}
