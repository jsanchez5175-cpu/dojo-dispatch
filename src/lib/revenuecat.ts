// DOJO PRO — real billing via RevenueCat (Capacitor has a native layer,
// so unlike the TWA fleet, RevenueCat IS the right path here).
//
// Setup (one-time):
//   npm install @revenuecat/purchases-capacitor
//   npx cap sync android
//   RevenueCat dashboard: create project "Dojo Dispatch" → Android app
//   (com.aethelaps.dojodispatch) → paste Play service-account JSON →
//   create Entitlement "pro" → attach product "dojo_pro" (create the
//   in-app product in Play Console first: Monetize → Products →
//   In-app products → dojo_pro, $4.99, one-time).
//   Then put the RevenueCat PUBLIC Android SDK key below.

import { Purchases, LOG_LEVEL } from '@revenuecat/purchases-capacitor'

const RC_ANDROID_KEY = 'goog_REPLACE_WITH_YOUR_KEY'   // RevenueCat public key — safe to ship
const ENTITLEMENT = 'pro'

let ready = false
export async function initBilling() {
  if (ready) return
  try {
    await Purchases.setLogLevel({ level: LOG_LEVEL.WARN })
    await Purchases.configure({ apiKey: RC_ANDROID_KEY })
    ready = true
  } catch { /* web preview / not native — quietly skip */ }
}

export async function isPro(): Promise<boolean> {
  if (localStorage.getItem('dojo_pro') === 'true') return true   // cached
  try {
    const { customerInfo } = await Purchases.getCustomerInfo()
    const active = !!customerInfo.entitlements.active[ENTITLEMENT]
    if (active) localStorage.setItem('dojo_pro', 'true')
    return active
  } catch { return false }
}

export async function buyPro(): Promise<boolean> {
  try {
    const offerings = await Purchases.getOfferings()
    const pkg = offerings.current?.availablePackages?.[0]
    if (!pkg) throw new Error('No offering configured in RevenueCat')
    const { customerInfo } = await Purchases.purchasePackage({ aPackage: pkg })
    const active = !!customerInfo.entitlements.active[ENTITLEMENT]
    if (active) localStorage.setItem('dojo_pro', 'true')
    return active
  } catch (e: any) {
    if (e?.userCancelled) return false
    throw e
  }
}

export async function restorePro(): Promise<boolean> {
  try {
    const { customerInfo } = await Purchases.restorePurchases()
    const active = !!customerInfo.entitlements.active[ENTITLEMENT]
    if (active) localStorage.setItem('dojo_pro', 'true')
    return active
  } catch { return false }
}
