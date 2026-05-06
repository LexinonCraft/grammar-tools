import { match } from "variant"

export type TransformationOption = "epsilon" | "chains" | "shorten" | "literals" | "cnf" | "useless" | "unreachable" | "cyk"

export interface Config {
    grammar: string
    startSymbol: string
    transformationOptions: Record<TransformationOption, boolean>
    word: string
}

export type Symbol = {type: "variable", identifier: string} | {type: "literal", char: string}

export type Sequence = Symbol[]

export interface GrammarLine {
    leftSideVariable: string
    rightSideSequences: Sequence[]
}

export interface Grammar {
    startVariable: string
    lines: GrammarLine[]
}

type GrammarParsingState =
| "awaitingLeftSideVariable"
| "readingLeftSideVariable"
| "awaitingArrow"
| "expectingArrowHead"
| "awaitingRightSideSymbol"
| "readingRightSideVariable"
| "readingRightSideLiteral"

const validVariableCharacters = "[A-Za-z0-9]"

interface GrammarParsingSuccess {
    type: "success"
    grammar: Grammar
}

interface GrammerParsingFailure {
    type: "failure"
    error: string
}

type GrammarParsingResult = GrammarParsingSuccess | GrammerParsingFailure

export function parseGrammar(grammarInput: string, startVariable: string): GrammarParsingResult {
    let cursor = 0
    let row = 0
    let column = 0
    let state: GrammarParsingState = "awaitingLeftSideVariable"
    let readString = ""
    let line: Partial<GrammarLine> = {}
    let grammar: Grammar = {
        startVariable,
        lines: []
    }

    function unexpectedSymbolError(): GrammerParsingFailure {
        return {
            type: "failure",
            error: `Unexpected symbol at ${row + 1}:${column + 1}`
        }
    }

    while (cursor < grammarInput.length) {
        const char = grammarInput[cursor]

        const actions: Record<GrammarParsingState, () => void> = {
            awaitingLeftSideVariable: () => {
                if (new RegExp(validVariableCharacters).test(char)) {
                    readString = char
                    state = "readingLeftSideVariable"
                } else if (!new RegExp("\\s").test(char))
                    return unexpectedSymbolError()
            },
            readingLeftSideVariable: () => {
                if (new RegExp(validVariableCharacters).test(char))
                    readString += char
                else if (new RegExp("\\-").test(char)) {
                    line.leftSideVariable = readString
                    state = "expectingArrowHead"
                } else if(new RegExp("\\s").test(char)) {
                    line.leftSideVariable = readString
                    state = "awaitingArrow"
                } else
                    return unexpectedSymbolError()
            },
            awaitingArrow: () => {
                if (new RegExp("-"))
                    state = "expectingArrowHead"
                else if (!new RegExp("\\s"))
                    return unexpectedSymbolError()
            },
            expectingArrowHead: () => {
                if (new RegExp(">"))
                    state = "awaitingRightSideSymbol"
                else
                    return unexpectedSymbolError()
            },
            awaitingRightSideSymbol: () => {

            },
            readingRightSideVariable: function (): void {
                throw new Error("Function not implemented.")
            },
            readingRightSideLiteral: function (): void {
                throw new Error("Function not implemented.")
            }
        }
        actions[state]()

        cursor++
        row++
        if (char == "\n" || char == "\r") {
            row++
            column = 0
        }
    }

    return {
        type: "success",
        grammar
    }
}
