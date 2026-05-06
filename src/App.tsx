import { useState } from "react"
import Input from "./Input"
import type { Config } from "./lib"

export default function App() {
    const [result, setResult] = useState()

    function run(config: Config) {

    }

    return <>
        <h1>GrammarTools by lexinon</h1>
        <p>This application allows you to transform context free grammars in different ways and run the CYK algorithm on them.</p>
        <Input run={run}/>
    </>
}