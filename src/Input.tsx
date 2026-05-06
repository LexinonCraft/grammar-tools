import React, { useState } from "react"
import { type Grammar, type Production, type RightSide, newProduction, validateGrammar } from "@/lib"

function ProductionWidget({ production, setProduction, deleteProduction }: { production: Production, setProduction: (_: Production) => void, deleteProduction: () => void }) {
    return <div className="input-buttons">
        <label>Variable: </label>
        <input value={production.leftSideVariable} onChange={(e) => setProduction({ ...production, leftSideVariable: e.target.value })} />
        <span>&rarr;</span>
        {production.rightSide.type == "twoVariables" ? <>
            <label>Variable: </label>
            <input value={production.rightSide.var1} onChange={(e) => setProduction({ ...production, rightSide: { ...production.rightSide, var1: e.target.value } as RightSide })} />
            <label> Variable: </label>
            <input value={production.rightSide.var2} onChange={(e) => setProduction({ ...production, rightSide: { ...production.rightSide, var2: e.target.value } as RightSide })} />
        </> : <>
            <label>Literal: </label>
            <input value={production.rightSide.char} onChange={(e) => setProduction({ ...production, rightSide: { ...production.rightSide, char: e.target.value } as RightSide })} />
        </>}
        <button onClick={deleteProduction}>Delete</button>
    </div>
}

export default function Input({ run, running }: { run: (grammar: Grammar, word: string) => void, running: boolean }) {
    const [startSymbol, setStartSymbol] = useState("S")
    const [produceEpsilon, setProduceEpsilon] = useState(false)
    const [productions, setProductions] = useState<Production[]>([])
    const [word, setWord] = useState("")
    const [invalid, setInvalid] = useState(false)

    function validateAndRun() {
        const grammar = { startSymbol, produceEpsilon, productions }
        const validatedSuccessfully = validateGrammar(grammar)
        setInvalid(!validatedSuccessfully)
        if (validatedSuccessfully)
            run(window.structuredClone(grammar), word)
    }

    function addProductionWithTwoVariables() {
        setProductions((productions) => [...productions, newProduction("A", { type: "twoVariables", var1: "B", var2: "C" })])
    }

    function addProductionWithLiteral() {
        setProductions((productions) => [...productions, newProduction("A", { type: "literal", char: "b" })])
    }

    function updateProduction(production: Production) {
        setProductions((productions) => productions.map((production2) => production.uuid == production2.uuid ? production : production2))
    }

    function deleteProduction(production: Production) {
        setProductions((productions) => productions.filter((production2) => production.uuid != production2.uuid))
    }

    function setExampleGrammar() {
        setStartSymbol("S")
        setProduceEpsilon(false)
        setProductions([
            newProduction("S", { type: "twoVariables", var1: "T", var2: "T" }),
            newProduction("S", { type: "twoVariables", var1: "A", var2: "B" }),
            newProduction("T", { type: "twoVariables", var1: "T", var2: "T" }),
            newProduction("T", { type: "twoVariables", var1: "A", var2: "B" }),
            newProduction("A", { type: "twoVariables", var1: "A", var2: "T" }),
            newProduction("A", { type: "twoVariables", var1: "A", var2: "A" }),
            newProduction("A", { type: "literal", char: "a" }),
            newProduction("B", { type: "twoVariables", var1: "T", var2: "B" }),
            newProduction("B", { type: "twoVariables", var1: "B", var2: "B" }),
            newProduction("B", { type: "literal", char: "b" })
        ])
    }

    function onSubmit(e: React.SubmitEvent<HTMLFormElement>) {
        e.preventDefault()
    }
    
    return <div className="card">
        <h2>Input</h2>
        <form onSubmit={onSubmit} className="input-form">
            <div className="input-form-field">
                <button onClick={setExampleGrammar}>Example grammar</button>
            </div>
            <div className="input-form-field">
                <label htmlFor="input-start-symbol">What is the start symbol for your context free grammar?</label>
                <input id="input-start-symbol" value={startSymbol} onChange={(e) => setStartSymbol(e.target.value)} />
            </div>
            <div className="input-form-field">
                <label htmlFor="input-productions">Which productions does your grammar include?</label>
                {produceEpsilon &&
                    <div className="input-buttons">
                        <span><code>{startSymbol}</code> &rarr; &epsilon;</span>
                        <button onClick={() => setProduceEpsilon(false)}>Delete</button>
                    </div>
                }
                {productions.map((production) =>
                    <ProductionWidget production={production} setProduction={updateProduction} deleteProduction={() => deleteProduction(production)} key={production.uuid} />
                )}
                <div className="input-buttons">
                    <button onClick={() => setProduceEpsilon(true)} disabled={produceEpsilon}>Add production {startSymbol} &rarr; &epsilon;</button>
                    <button onClick={() => addProductionWithTwoVariables()}>Add production of form <code>A</code> &rarr; <code>BC</code></button>
                    <button onClick={() => addProductionWithLiteral()}>Add production of form <code>A</code> &rarr; <code>b</code></button>
                </div>
            </div>
            <div className="input-form-field">
                <label htmlFor="input-word">Enter a word:</label>
                <input id="input-word" value={word} onChange={(e) => setWord(e.target.value)} />
            </div>
            <div className="input-form-field">
                <button onClick={validateAndRun} disabled={running}>{running ? "Running..." : "Run"}</button>
                {invalid &&
                    <span>The grammar is invalid!</span>
                }
            </div>
        </form>
    </div>
}