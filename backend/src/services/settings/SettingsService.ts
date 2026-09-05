import { Settings } from "../../models/Settings.Model"

const getOrCreateSettings = async () => {
  let settings = await Settings.findOne()

  if (!settings) {
    settings = await Settings.create({
      recoveryEngineEnabled: true,
      aiEnabled: true,
    })
  }

  return settings
}

export const getSettings = async () => {
  return getOrCreateSettings()
}

export const setRecoveryEngineStatus = async (enabled: boolean) => {
  const settings = await getOrCreateSettings()
  settings.recoveryEngineEnabled = enabled
  await settings.save()
  return settings
}

export const setAiStatus = async (enabled: boolean) => {
  const settings = await getOrCreateSettings()
  settings.aiEnabled = enabled
  await settings.save()
  return settings
}