import ora from 'ora'
import chalk from 'chalk'
import { MockConnector } from '@fin-engine/connector-mock'
import { FinancialEngine } from '@fin-engine/core'
import { displayResult } from '../ui/display'

export async function runDemo(): Promise<void> {
  console.log()
  console.log(chalk.bold.green('🚀  FinEngine OSS — Modo Demo'))
  console.log(chalk.gray('  Usando dados financeiros simulados para demonstração\n'))

  const spinner = ora({ text: 'Gerando dados simulados...', color: 'green' }).start()

  try {
    const connector = new MockConnector()
    await connector.connect()
    const transactions = await connector.getTransactions()

    spinner.text = 'Analisando transações...'
    await new Promise((r) => setTimeout(r, 400)) // brief pause for UX

    const engine = new FinancialEngine()
    const result = engine.analyze(transactions)

    spinner.succeed(chalk.green(`${transactions.length} transações analisadas`))

    displayResult(result)
  } catch (err) {
    spinner.fail(chalk.red('Erro ao executar demo'))
    console.error(err)
    process.exit(1)
  }
}
