import type { CYKResult, Grammar } from "@/lib";
import { useState } from "react";

export default function Result({ grammar, word, result: { table, wordCanBeDerived } }: { grammar: Grammar, word: string, result: CYKResult }) {
    const [selectedVariable, setSelectedVariable] = useState<string>()
    const [selectedLength, setSelectedLength] = useState<number>()
    const [selectedStartIndex, setSelectedStartIndex] = useState<number>()

    function determineVariableClassName(variable: string, i: number, j: number) {
        if (selectedVariable == undefined || selectedLength == undefined || selectedStartIndex == undefined)
            return ""

        if (selectedVariable == variable && selectedLength == i && selectedStartIndex == j)
            return "selected-variable"

        const ref = table[selectedLength][selectedStartIndex].refs[selectedVariable]
        if (ref.type == "twoVariables" && (ref.var1 == variable && ref.splitLength == i && selectedStartIndex == j || ref.var2 == variable && selectedLength - ref.splitLength - 1 == i && selectedStartIndex + ref.splitLength + 1 == j))
            return "referred-variable"

        return ""
    }

    function determineWordCharClassName(i: number) {
        return selectedLength == 0 && selectedStartIndex == i ? "referred-word-char" : ""
    }

    return <div className="card">
        <h2>Result</h2>
        {word.length == 0 ?
            <p>
                The word <code>{word}</code> is empty and {wordCanBeDerived ? "can" : "cannot"} be derived in the given grammar since it
                does {!grammar.produceEpsilon && "not"} contain the production <code>{grammar.startSymbol}</code> &rarr; &epsilon;.
            </p>
        : <>
            <p>The word <code>{Array.from(word).map((char, i) => <span className={determineWordCharClassName(i)}>{char}</span>)}</code> {wordCanBeDerived ? "can" : "cannot"} be derived in the given grammar:</p>
            <div>
                <table>
                    <tr>
                        <td>length \ start index:</td>
                        {[...Array(word.length)].map((_, i) => <td key={i}>{i}</td>)}
                    </tr>
                    {[...Array(word.length)].map((_, i) => <tr key={i}>
                        <td>{i + 1}</td>
                        {[...Array(word.length)].map((_, j) => <td className={`table-cell ${word.length - i <= j && "unused-cell"}`} key={j}>
                            {j < word.length - i ?
                                <div className="variables-list">
                                    {table[i][j]?.variables.map((variable) =>
                                        <div onClick={() => {
                                            setSelectedVariable(variable)
                                            setSelectedLength(i)
                                            setSelectedStartIndex(j)
                                        }} className={`variable ${determineVariableClassName(variable, i, j)}`}>
                                            <code>{variable}</code>
                                        </div>
                                    )}
                                    {table[i][j].variables.length == 0 && <span>--</span>}
                                </div>
                            :
                                <span></span>
                            }
                        </td>)}
                    </tr>)}
                </table>
            </div>
            <p>Click on a variable to find out which variable you have to replace it with to derive the word.</p>
        </>}
    </div>
}