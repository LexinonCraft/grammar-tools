import { useState } from "react"
import he from "he"
import type { Config, TransformationOption } from "./lib"

interface TransformationOptionDetails {
    description: string
    requires?: TransformationOption[]
}

const transformationOptionsDetails: Record<TransformationOption, TransformationOptionDetails> = {
    epsilon: {
        description: "Remove &epsilon; productions"
    },
    chains: {
        description: "Remove chain productions"
    },
    shorten: {
        description: "Shorten right sides"
    },
    literals: {
        description: "Replace literals that do not appear alone"
    },
    cnf: {
        description: "Transform grammar to Chomsky normal form",
        requires: ["epsilon", "chains", "shorten", "literals"]
    },
    useless: {
        description: "Remove useless symbols"
    },
    unreachable: {
        description: "Remove unreachable symbols"
    },
    cyk: {
        description: "Run the CYK algorithm to check if a word can be derived in the grammar",
        requires: ["cnf"]
    }
}

const transformationOptions: TransformationOption[] = ["useless", "unreachable", "epsilon", "chains", "shorten", "literals", "cnf", "cyk"]

type CheckboxesState = Record<TransformationOption, boolean>

interface CheckboxProps {
    option: TransformationOption
    state: CheckboxesState
    setState: (_: (_: CheckboxesState) => CheckboxesState) => void
}

function Checkbox({ option, state, setState }: CheckboxProps) {
    function handleToggle(newState: boolean) {
        if (newState) {
            const optionsToToggleOn = new Set([option])
            const optionsToCheckRequiredOptions = new Set([option])
            
            let option2: TransformationOption
            while (option2 = optionsToCheckRequiredOptions.values().next().value) {
                transformationOptionsDetails[option2].requires?.forEach((option3) => {
                    if (!optionsToToggleOn.has(option3)) {
                        optionsToToggleOn.add(option3)
                        optionsToCheckRequiredOptions.add(option3)
                    }
                })
                optionsToCheckRequiredOptions.delete(option2)
            }

            setState((oldState) => {
                const newState = {...oldState}
                optionsToToggleOn.forEach((option2) => newState[option2] = true)
                return newState
            })
        } else {
            const optionsToToggleOff = new Set([option])
            let changed = true
            
            while (changed) {
                changed = false
                let option2: TransformationOption
                for (option2 in state) {
                    if (!optionsToToggleOff.has(option2)) {
                        transformationOptionsDetails[option2].requires?.forEach((option3) => {
                            if (optionsToToggleOff.has(option3)) {
                                optionsToToggleOff.add(option2)
                                changed = true
                            }
                        })
                    }
                }
            }

            setState((oldState) => {
                const newState = {...oldState}
                optionsToToggleOff.forEach((option2) => newState[option2] = false)
                return newState
            })
        }
    }

    return <>
        <input type="checkbox" id={`checkbox-${option}`} name={`checkbox-${option}`} onChange={(e) => handleToggle(e.target.checked)} checked={state[option]} />
        <label htmlFor={`checkbox-${option}`}>{he.decode(transformationOptionsDetails[option].description)}</label>
    </>
}

interface InputProps {
    run: (_: Config) => void
}

export default function Input({ run }: InputProps) {
    const [grammarInput, setGrammarInput] = useState("")
    const [startVariable, setStartVariable] = useState("")
    const [checkboxValues, setCheckboxValues] = useState<CheckboxesState>({
        epsilon: false,
        chains: false,
        shorten: false,
        literals: false,
        cnf: false,
        useless: false,
        unreachable: false,
        cyk: false
    })
    const [word, setWord] = useState("")
    const [error, setError] = useState<string | undefined>(undefined)

    function onRun(e: React.SubmitEvent<HTMLFormElement>) {
        e.preventDefault()


    }

    return <>
        <h2>Input and configuration</h2>
        <form onSubmit={onRun}>
            <label htmlFor="grammar-input">Enter a context free grammar:</label><br />
            <textarea id="grammar-input" value={grammarInput} onChange={(e) => setGrammarInput(e.target.value)} /><br /><br />
            <label>This is an example grammar:</label><br />
            <code>
                A -&gt; B | "a"<br />
                B -&gt; | B "b"
            </code><br /><br />
            <label htmlFor="start-symbol">Enter your start symbol:</label><br />
            <input id="start-symbol" value={startVariable} onChange={(e) => setStartVariable(e.target.value)} /><br /><br />
            <label>What should be done?</label>
            <div className="checkbox-grid">
                {transformationOptions.map((option) => <Checkbox option={option} state={checkboxValues} setState={setCheckboxValues} key={option} />)}
            </div><br />
            {checkboxValues.cyk &&
                <>
                    <label htmlFor="word-input">Word to check:</label><br />
                    <input id="word-input" value={word} onChange={(e) => setWord(e.target.value)} /><br /><br />
                </>
            }
            <button type="submit">Run</button>
        </form>
    </>
}