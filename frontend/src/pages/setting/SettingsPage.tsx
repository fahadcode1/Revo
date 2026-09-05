import { useState, useEffect } from "react";
import { useSettings } from "../../hooks/useSettings";
import type { Settings } from "../../components/types/settings";

export default function SettingsPage() {
  const { getSettings, setEngineStatus, setAiStatus, loading, error } = useSettings();
  const [settings, setSettings] = useState<Settings | null>(null);
  const [updating, setUpdating] = useState<"engine" | "ai" | null>(null);

  useEffect(() => {
    (async () => {
      const result = await getSettings();
      setSettings(result);
    })();
  }, []);

  const handleToggleEngine = async () => {
    if (!settings) return;
    setUpdating("engine");
    const result = await setEngineStatus(!settings.recoveryEngineEnabled);
    if (result) setSettings(result);
    setUpdating(null);
  };

  const handleToggleAi = async () => {
    if (!settings) return;
    setUpdating("ai");
    const result = await setAiStatus(!settings.aiEnabled);
    if (result) setSettings(result);
    setUpdating(null);
  };

  return (
    <main className="mx-auto max-w-2xl px-6 py-8 text-white">
      <div className="mb-8">
        <p className="mb-2 text-sm text-[#666]">Revenue Recovery</p>
        <h1 className="text-2xl font-semibold text-white">Settings</h1>
        <p className="mt-2 text-sm text-[#777]">
          Control whether Revo's recovery engine and AI are active.
        </p>
      </div>

      {loading && !settings && (
        <p className="text-sm text-[#666]">Loading settings…</p>
      )}

      {error && <p className="mb-4 text-sm text-red-400">{error}</p>}

      {settings && (
        <div className="space-y-4">
          {/* Recovery engine toggle */}
          <div className="flex items-center justify-between rounded-xl border border-[#292929] bg-[#151515] p-5">
            <div>
              <p className="text-sm font-medium text-white">Recovery engine</p>
              <p className="mt-1 text-xs text-[#777]">
                When off, no new recovery workflows will run — manual triggers are also paused.
              </p>
            </div>
                <button
                onClick={handleToggleEngine}
                disabled={updating !== null}
                className={`relative h-6 w-11 shrink-0 rounded-full transition-colors disabled:opacity-50 ${
                    settings.recoveryEngineEnabled ? "bg-green-500" : "bg-[#333]"
                }`}
                >
                <span
                    className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                    settings.recoveryEngineEnabled ? "translate-x-5" : "translate-x-0"
                    }`}
                />
                </button>
          </div>

          <div className="flex items-center justify-between rounded-xl border border-[#292929] bg-[#151515] p-5">
            <div>
              <p className="text-sm font-medium text-white">AI agent</p>
              <p className="mt-1 text-xs text-[#777]">
                When off, customer replies won't be interpreted or acted on automatically.
              </p>
            </div>
                <button
                onClick={handleToggleAi}
                disabled={updating !== null}
                className={`relative h-6 w-11 shrink-0 rounded-full transition-colors disabled:opacity-50 ${
                    settings.aiEnabled ? "bg-green-500" : "bg-[#333]"
                }`}
                >
                <span
                    className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                    settings.aiEnabled ? "translate-x-5" : "translate-x-0"
                    }`}
                />
                </button>
          </div>
        </div>
      )}
    </main>
  );
}