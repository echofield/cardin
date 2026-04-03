import { type BehaviorScenario, type BehaviorScenarioId } from "@/lib/behavior-engine"

type ScenarioSwitcherProps = {
  scenarios: BehaviorScenario[]
  selectedScenarioId: BehaviorScenarioId
  onChange: (scenarioId: BehaviorScenarioId) => void
}

export function ScenarioSwitcher({ scenarios, selectedScenarioId, onChange }: ScenarioSwitcherProps) {
  return (
    <div>
      <p className="text-xs uppercase tracking-[0.12em] text-[#667068]">Scénario</p>
      <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {scenarios.map((scenario) => {
          const isSelected = scenario.id === selectedScenarioId

          return (
            <button
              className={[
                "rounded-2xl border p-4 text-left transition",
                isSelected
                  ? "border-[#173A2E] bg-[#EFF4EC] shadow-[0_18px_40px_-30px_rgba(23,58,46,0.7)]"
                  : "border-[#D7DED4] bg-[#FEFEFA] hover:border-[#AEB8AB]",
              ].join(" ")}
              key={scenario.id}
              onClick={() => onChange(scenario.id)}
              type="button"
            >
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-medium text-[#173A2E]">{scenario.label}</p>
                <span className="rounded-full border border-[#CDD6CB] px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] text-[#607067]">{scenario.stage}</span>
              </div>
              <p className="mt-2 text-sm text-[#2A3F35]">{scenario.headline}</p>
              <p className="mt-2 text-xs text-[#556159]">{scenario.bestFor}</p>
            </button>
          )
        })}
      </div>
    </div>
  )
}
