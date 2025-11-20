// src/types/index.ts - TypeScript type definitions

export interface TestRun {
  id?: number
  server: string
  runType: string
  branch: string
  buildNumber: number
  status?: string
  datetimeStart?: string
  datetimeEnd?: string
  childRun?: TestRun
}

export interface TestRunView {
  id: number
  server: string
  runType: string
  branch: string
  buildNumber: number
  status: string
  datetimeStart: string
  datetimeEnd: string
}

export interface RunTypeGroup {
  runType: string
  builds: TestRunView[]
}

export interface DashboardResponse {
  runTypes: RunTypeGroup[]
}

export interface GroupedTestResult {
  name: string
  passed: number
  failed: number
  skipped?: number
  duration: string
}

export interface TestRunSummary {
  branch: string
  buildDate: string
  buildDuration: string
  buildNumber: number
  server: string
  results: GroupedTestResult[]
}

export interface Step {
  name: string
  status: string
  duration?: string
  errorMessage?: string
}

export interface DetailedScenarioResult {
  scenarioName: string
  scenarioUri: string
  lineNumber: number
  status: string
  failureReason?: string
  lastFailedOn?: string
  datetimeStart: string
  datetimeEnd: string
  duration: string
  screenshotFilepath?: string
  tags: string[]
  steps: Step[]
}

export interface ModuleDetailsResponse {
  moduleSummary: GroupedTestResult
  moduleScenarios: DetailedScenarioResult[]
}

export interface Scenario {
  id?: number
  name: string
  uri: string
  lineNumber: number
  lastFailedOn?: string
}

export interface FailureReasonGroup {
  failureReason: string
  count: number
  scenarios: Scenario[]
}

export interface FailuresByReasonResponse {
  totalFailures: number
  failureGroups: FailureReasonGroup[]
}

export interface ScenarioTag {
  tag: string
}

export interface ScenarioResult {
  scenario: Scenario
  status: string
  failedReason?: string
  startTime: string
  endTime: string
  screenshotFilepath?: string
  tags: string[]
  steps: Step[]
}

// Enums
export enum TestStatus {
  PASSED = 'PASSED',
  FAILED = 'FAILED',
  SKIPPED = 'SKIPPED',
  RUNNING = 'RUNNING',
  PENDING = 'PENDING'
}

export enum ScenarioStatus {
  PASSED = 'PASSED',
  FAILED = 'FAILED',
  SKIPPED = 'SKIPPED'
}