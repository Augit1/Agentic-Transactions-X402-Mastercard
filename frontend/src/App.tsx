import { useState } from 'react'
import { Button } from "@/components/ui/button"

function App() {
  const [log, setLog] = useState<string[]>([])

  const addToLog = (message: string) => {
    setLog(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  const callService = async () => {
    addToLog("Calling service...")

    try {
      const res = await fetch("http://localhost:4001/call-service", {
        method: "POST"
      })

      const data = await res.json()
      addToLog(JSON.stringify(data, null, 2))
    } catch (error) {
      addToLog(`Error: ${error}`)
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">
            Agentic Payments Demo
          </h1>
          <p className="text-lg text-muted-foreground">
            React + TypeScript + shadcn/ui Frontend
          </p>
        </div>

        <div className="flex justify-center">
          <Button onClick={callService} size="lg">
            Call Provider Service
          </Button>
        </div>

        <div className="bg-card border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Service Logs</h2>
          <div className="bg-muted rounded-md p-4 font-mono text-sm max-h-96 overflow-auto">
            {log.length === 0 ? (
              <p className="text-muted-foreground">No logs yet. Click the button to start.</p>
            ) : (
              log.map((entry, index) => (
                <div key={index} className="mb-1">
                  {entry}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
