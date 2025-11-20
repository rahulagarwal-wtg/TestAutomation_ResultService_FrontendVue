// src/stores/testRunStore.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'
import testRunService from '@/services/testRunService'
import type { DashboardResponse, TestRunView, RunTypeGroup } from '@/types'

export const useTestRunStore = defineStore('testRun', () => {
  const dashboardData = ref<DashboardResponse | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchDashboardData(limit: number = 10) {
    loading.value = true
    error.value = null
    try {
      const response = await testRunService.getDashboardData(limit)
      dashboardData.value = response.data
      return response.data
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch dashboard data'
      console.error('Error fetching dashboard data:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchTestRunSummary(
    server: string,
    runType: string,
    branch: string,
    buildNumber: number
  ) {
    try {
      const response = await testRunService.getTestRunSummary(
        server,
        runType,
        branch,
        buildNumber
      )
      return response.data
    } catch (err) {
      console.error('Error fetching test run summary:', err)
      throw err
    }
  }

  async function fetchModuleDetails(
    server: string,
    runType: string,
    branch: string,
    buildNumber: number,
    module: string
  ) {
    try {
      const response = await testRunService.getModuleDetails(
        server,
        runType,
        branch,
        buildNumber,
        module
      )
      return response.data
    } catch (err) {
      console.error('Error fetching module details:', err)
      throw err
    }
  }

  async function fetchFailuresByReason(
    server: string,
    runType: string,
    branch: string,
    buildNumber: number
  ) {
    try {
      const response = await testRunService.getFailuresByReason(
        server,
        runType,
        branch,
        buildNumber
      )
      return response.data
    } catch (err) {
      console.error('Error fetching failures by reason:', err)
      throw err
    }
  }

  function reset() {
    dashboardData.value = null
    loading.value = false
    error.value = null
  }

  return {
    dashboardData,
    loading,
    error,
    fetchDashboardData,
    fetchTestRunSummary,
    fetchModuleDetails,
    fetchFailuresByReason,
    reset
  }
})
