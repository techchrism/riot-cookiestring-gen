import {Component, createMemo, createSignal, Show} from 'solid-js'
import {parse as yamlParse} from 'yaml'

type ParsedCookie = {
    name: string
    value: string
}

const App: Component = () => {
    const [parsedCookies, setParsedCookies] = createSignal<ParsedCookie[]>([])
    const [error, setError] = createSignal<string | null>(null)

    const cookieString = createMemo(() => parsedCookies().map((c) => `${c.name}=${c.value}`).join('; '))

    const filterToRelevantCookies = (cookies: ParsedCookie[]) => {
        return cookies.filter(c => ['tdid', 'ssid', 'sub', 'csid', 'clid'].includes(c.name))
    }

    const parseResults = (event: Event) => {
        const target = event.target as HTMLTextAreaElement
        const lines = target.value.split('\n')

        const yamlCookieLineIndex = lines.findIndex((line) => line.endsWith('cookies:'))
        if(yamlCookieLineIndex !== -1) {
            const parsed = yamlParse(target.value)
            const cookies = parsed?.['riot-login']?.persist?.session?.cookies as undefined | [{name: string, value: string}]
            if(cookies === undefined) {
                setError('No cookies found in RiotPrivateSettings.yml')
                return
            }
            setError(null)
            setParsedCookies(filterToRelevantCookies(cookies))
        } else {
            const cookies = lines.map((line) => {
                const [name, value, ...rest] = line.split('\t')
                return {name, value}
            })
            setError(null)
            setParsedCookies(filterToRelevantCookies(cookies))
        }
    }

    return (
        <div class="hero mt-6">
            <div class="hero-content text-center">
                <div class="max-w-2xl">
                    <h1 class="text-5xl font-bold">Riot Cookie String Generator</h1>
                    <p class="pt-6">
                        A simple webapp to extract cookies from <code>RiotPrivateSettings.yml</code> or Chromium devtools cookie inspector.
                        Just paste the contents into the box and get a string suitable for use in a <code>Cookie</code> header.
                    </p>
                    <a href="https://github.com/techchrism/riot-cookiestring-gen" class="link block py-3">Source Code</a>


                    <textarea
                        class="w-full h-64 p-4 text-lg rounded-lg bg-gray-100 text-black dark:bg-gray-800 dark:text-white"
                        placeholder="Paste your RiotPrivateSettings.yml or Chromium devtools cookie table here"
                        onInput={parseResults}
                    ></textarea>

                    <Show when={error() !== null}>
                        <div class="alert alert-error text-lg">
                            {error()}
                        </div>
                    </Show>

                    <Show when={parsedCookies().length !== 0}>
                        <h2 class="text-xl font-bold mt-6">Parsed {parsedCookies().length} Cookies:</h2>
                        <div class="w-full bg-white text-black dark:bg-black dark:text-white">
                            <code class="break-all">
                                {cookieString()}
                            </code>
                        </div>

                    </Show>
                </div>
            </div>
        </div>
    )
}

export default App
