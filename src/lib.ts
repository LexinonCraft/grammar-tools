import {v4 as uuidv4} from "uuid"

export type RightSide = {
    type: "twoVariables"
    var1: string
    var2: string
} | {
    type: "literal"
    char: string
}

export type Production = {
    uuid: string
    leftSideVariable: string
    rightSide: RightSide
}

export function newProduction(leftSideVariable: string, rightSide: RightSide): Production {
    return {
        uuid: uuidv4(),
        leftSideVariable,
        rightSide
    }
}

export type Grammar = {
    startSymbol: string
    produceEpsilon: boolean
    productions: Production[]
}

function validateVariableName(variable: string) {
    return variable.length != 0 && !new RegExp(".*\s.*").test(variable)
}

export function validateGrammar(grammar: Grammar) {
    if (!validateVariableName(grammar.startSymbol))
        return false;

    return grammar.productions.every((production) => {
        if (production.rightSide.type == "twoVariables")
            return validateVariableName(production.rightSide.var1) && validateVariableName(production.rightSide.var2)
                && production.rightSide.var1 != grammar.startSymbol && production.rightSide.var2 != grammar.startSymbol
        else
            return production.rightSide.char.length == 1
    })
}

export type CYKRef = {
    type: "twoVariables"
    var1: string
    var2: string
    splitLength: number
} | {
    type: "literal"
    char: string
}

export type CYKTableCell = {
    variables: string[]
    refs: Record<string, CYKRef>
}

export type CYKResult = {
    table: CYKTableCell[][]
    wordCanBeDerived: boolean
    uuid: string
}

export function cyk(grammar: Grammar, word: string): CYKResult {
    if (word.length == 0)
        return {
            table: [],
            wordCanBeDerived: grammar.produceEpsilon,
            uuid: uuidv4()
        }

    const table: (CYKTableCell | undefined)[][] = Array.apply(null, Array(word.length)).map((_, i) => Array(word.length - i).fill(undefined))
    console.log(JSON.stringify(table))

    for (let i = 0; i < word.length; i++) {
        let refs: Record<string, CYKRef> = {}

        grammar.productions.forEach((production) => {
            if (!(production.leftSideVariable in refs) && production.rightSide.type == "literal" && production.rightSide.char == word[i])
                refs[production.leftSideVariable] = { ...production.rightSide }
        })

        table[0][i] = { variables: Object.keys(refs), refs }
    }

    for (let i = 1; i < word.length; i++)
        for (let j = 0; j < word.length - i; j++) {
            let refs: Record<string, CYKRef> = {}

            for (let k = 0; k < i; k++)
                grammar.productions.forEach((production) => {
                    if (!(production.leftSideVariable in refs) && production.rightSide.type == "twoVariables" && production.rightSide.var1 in (table[k][j] as CYKTableCell).refs && production.rightSide.var2 in (table[i - k - 1][j + k + 1] as CYKTableCell).refs)
                        refs[production.leftSideVariable] = { ...production.rightSide, splitLength: k }
                })

            table[i][j] = { variables: Object.keys(refs), refs }
        }

    const wordCanBeDerived = grammar.startSymbol in (table[word.length - 1][0] as CYKTableCell).refs

    return { table: table as CYKTableCell[][], wordCanBeDerived, uuid: uuidv4() }
}
