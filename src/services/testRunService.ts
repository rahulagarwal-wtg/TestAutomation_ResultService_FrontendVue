// src/services/testRunService.ts
import axios, { type AxiosInstance } from 'axios'
import type {
  DashboardResponse,
  TestRun,
  TestRunSummary,
  ModuleDetailsResponse,
  FailuresByReasonResponse,
  ScenarioResult
} from '../types'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1'

// Create axios instance with default config
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // You can add auth tokens here if needed
    // config.headers.Authorization = `Bearer ${token}`
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error)
    return Promise.reject(error)
  }
)

export default {
  // Get dashboard data
  getDashboardData(limit: number = 5) {
    return apiClient.get<DashboardResponse>('/test-runs/dashboard', {
      params: { limit }
    })
  },

  // Get test run summary
  getTestRunSummary(
    server: string,
    runType: string,
    branch: string,
    buildNumber: number
  ) {
    return apiClient.get<TestRunSummary>(
      `/test-runs/summary/${server}/${runType}/${branch}/${buildNumber}`
    )
  },

  // Get module details
  getModuleDetails(
    server: string,
    runType: string,
    branch: string,
    buildNumber: number,
    module: string
  ) {
    return apiClient.get<ModuleDetailsResponse>(
      `/test-runs/details/${server}/${runType}/${branch}/${buildNumber}/${module}`
    )
  },

  // Get failures by reason
  getFailuresByReason(
    server: string,
    runType: string,
    branch: string,
    buildNumber: number
  ) {
    return apiClient.get<FailuresByReasonResponse>(
      `/test-runs/failures/${server}/${runType}/${branch}/${buildNumber}`
    )
  },

  // Get rerun summary
  getRerunSummary(
    server: string,
    runType: string,
    branch: string,
    buildNumber: number
  ) {
    return apiClient.get<TestRunSummary[]>(
      `/test-runs/rerun-summary/${server}/${runType}/${branch}/${buildNumber}`
    )
  },

  // Get failure data (from ResultsController)
  getFailureData(
    server: string,
    runType: string,
    branch: string,
    buildNumber: number
  ) {
    return apiClient.get<string>(
      `/getFailureData/${server}/${runType}/${branch}/${buildNumber}`,
      { responseType: 'text' as any }
    )
  },

  // Record scenario result (from ResultsController)
  recordScenarioResult(scenarioResult: ScenarioResult) {
    return apiClient.post<void>('/scenario/record', scenarioResult)
  }
}