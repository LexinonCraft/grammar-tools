import { useState, useTransition } from "react"
import Input from "./Input"
import { cyk, type CYKResult, type Grammar } from "@/lib"
import Result from "@/Result"

export default function App() {
    const [grammar, setGrammar] = useState<Grammar>()
    const [word, setWord] = useState<string | undefined>()
    const [result, setResult] = useState<CYKResult>()
    const [isRunningCYK, startCYKTransition] = useTransition()

    function run(grammar: Grammar, word: string) {
        setGrammar(grammar)
        setWord(word)
        startCYKTransition(() => {
            setResult(cyk(grammar, word))
        })
    }

    return <>
        <div className="card">
            <h1>GrammarTools by lexinon</h1>
            <p>This application allows you to run the CYK algorithm on a grammar in Chomsky normal form. More might follow later.</p>
        </div>
        <Input run={run} running={isRunningCYK} />
        {result &&
            <Result grammar={grammar as Grammar} word={word as string} result={result} />
        }
    </>
}