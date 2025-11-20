<template>
  <div class="module-details-container">
    <div v-if="loading" class="loading">Loading module details...</div>
    
    <div v-else-if="error" class="error">
      {{ error }}
    </div>
    
    <div v-else-if="!module" class="no-data">
      Module not found.
    </div>
    
    <div v-else class="module-content">
      <div class="module-header">
        <h2>{{ module.moduleName }}</h2>
        <button @click="goBack" class="back-button">← Back to Dashboard</button>
      </div>
      
      <div class="module-stats">
        <div class="stat-card">
          <div class="stat-value">{{ totalTests }}</div>
          <div class="stat-label">Total Tests</div>
        </div>
        <div class="stat-card passed">
          <div class="stat-value">{{ module.passed }}</div>
          <div class="stat-label">Passed</div>
        </div>
        <div class="stat-card failed">
          <div class="stat-value">{{ module.failed }}</div>
          <div class="stat-label">Failed</div>
        </div>
        <div class="stat-card skipped">
          <div class="stat-value">{{ module.skipped || 0 }}</div>
          <div class="stat-label">Skipped</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ passRate }}%</div>
          <div class="stat-label">Pass Rate</div>
        </div>
      </div>
      
      <div class="test-results">
        <h3>Test Results</h3>
        
        <div class="filters">
          <button 
            :class="['filter-btn', { active: filter === 'all' }]"
            @click="filter = 'all'"
          >
            All ({{ totalTests }})
          </button>
          <button 
            :class="['filter-btn', { active: filter === 'passed' }]"
            @click="filter = 'passed'"
          >
            Passed ({{ module.passed }})
          </button>
          <button 
            :class="['filter-btn', { active: filter === 'failed' }]"
            @click="filter = 'failed'"
          >
            Failed ({{ module.failed }})
          </button>
          <button 
            :class="['filter-btn', { active: filter === 'skipped' }]"
            @click="filter = 'skipped'"
          >
            Skipped ({{ module.skipped || 0 }})
          </button>
        </div>
        
        <div class="test-list">
          <div 
            v-for="test in filteredTests" 
            :key="test.scenarioName"
            :class="['test-item', test.status.toLowerCase()]"
          >
            <div class="test-header">
              <span :class="['status-badge', test.status.toLowerCase()]">
                {{ test.status }}
              </span>
              <h4>{{ test.scenarioName }}</h4>
              <span class="duration">{{ test.duration }}</span>
            </div>
            
            <div class="test-location">
              <i class="bi bi-file-code"></i> {{ test.scenarioUri }}:{{ test.lineNumber }}
            </div>
            
            <div v-if="test.failureReason" class="test-error">
              <strong>Failure Reason:</strong> {{ test.failureReason }}
            </div>
            
            <div v-if="test.tags && test.tags.length > 0" class="test-tags">
              <span v-for="tag in test.tags" :key="tag" class="tag">{{ tag }}</span>
            </div>
            
            <div v-if="test.steps && test.steps.length > 0" class="test-steps">
              <details>
                <summary>Steps ({{ test.steps.length }})</summary>
                <div class="steps-list">
                  <div v-for="(step, idx) in test.steps" :key="idx" :class="['step', step.status.toLowerCase()]">
                    <span class="step-status">{{ step.status }}</span>
                    <span class="step-name">{{ step.name }}</span>
                    <span v-if="step.duration" class="step-duration">{{ step.duration }}</span>
                    <div v-if="step.errorMessage" class="step-error">{{ step.errorMessage }}</div>
                  </div>
                </div>
              </details>
            </div>
            
            <div class="test-meta">
              <span><i class="bi bi-clock"></i> Started: {{ formatDate(test.datetimeStart) }}</span>
              <span v-if="test.lastFailedOn"><i class="bi bi-exclamation-triangle"></i> Last Failed: {{ formatDate(test.lastFailedOn) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTestRunStore } from '@/stores/testRunStore'
import type { ModuleDetailsResponse, DetailedScenarioResult } from '@/types'

const route = useRoute()
const router = useRouter()
const store = useTestRunStore()

const loading = ref(true)
const error = ref<string | null>(null)
const filter = ref<'all' | 'passed' | 'failed' | 'skipped'>('all')
const moduleDetails = ref<ModuleDetailsResponse | null>(null)

const module = computed(() => moduleDetails.value?.moduleSummary)

const totalTests = computed(() => {
  if (!module.value) return 0
  return module.value.passed + module.value.failed + (module.value.skipped || 0)
})

const passRate = computed(() => {
  if (totalTests.value === 0) return 0
  return Math.round((module.value!.passed / totalTests.value) * 100)
})

const filteredTests = computed(() => {
  if (!moduleDetails.value) return []
  
  const scenarios = moduleDetails.value.moduleScenarios
  
  if (filter.value === 'all') {
    return scenarios
  }
  
  const statusMap = {
    passed: 'PASSED',
    failed: 'FAILED',
    skipped: 'SKIPPED'
  }
  
  return scenarios.filter(
    scenario => scenario.status.toUpperCase() === statusMap[filter.value]
  )
})

onMounted(async () => {
  try {
    const server = route.params.server as string
    const runType = route.params.runType as string
    const branch = route.params.branch as string
    const buildNumber = Number(route.params.buildNumber)
    const moduleName = route.params.module as string
    
    if (server && runType && branch && buildNumber && moduleName) {
      moduleDetails.value = await store.fetchModuleDetails(
        server, 
        runType, 
        branch, 
        buildNumber, 
        moduleName
      )
    } else {
      error.value = 'Missing required parameters'
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to load module details'
  } finally {
    loading.value = false
  }
})

const formatDuration = (ms: number): string => {
  if (ms < 1000) return `${ms}ms`
  return `${(ms / 1000).toFixed(2)}s`
}

const formatDate = (dateString: string): string => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleString()
}

const goBack = () => {
  router.push('/')
}
</script>

<style scoped>
.module-details-container {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

.loading, .error, .no-data {
  padding: 40px;
  text-align: center;
  border-radius: 8px;
  background-color: #f8f9fa;
}

.error {
  background-color: #fee;
  color: #c33;
}

.module-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.module-header h2 {
  margin: 0;
  color: #2c3e50;
}

.back-button {
  padding: 8px 16px;
  background-color: #6c757d;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.95rem;
}

.back-button:hover {
  background-color: #5a6268;
}

.module-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
  margin-bottom: 32px;
}

.stat-card {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.stat-card.passed {
  border-left: 4px solid #27ae60;
}

.stat-card.failed {
  border-left: 4px solid #e74c3c;
}

.stat-card.skipped {
  border-left: 4px solid #f39c12;
}

.stat-value {
  font-size: 2rem;
  font-weight: bold;
  color: #2c3e50;
}

.stat-label {
  color: #666;
  margin-top: 8px;
  font-size: 0.9rem;
}

.test-results h3 {
  margin-bottom: 16px;
  color: #2c3e50;
}

.filters {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.filter-btn {
  padding: 8px 16px;
  border: 1px solid #ddd;
  background-color: white;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.filter-btn:hover {
  background-color: #f8f9fa;
}

.filter-btn.active {
  background-color: #3498db;
  color: white;
  border-color: #3498db;
}

.test-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.test-item {
  background: white;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.test-item.passed {
  border-left: 4px solid #27ae60;
}

.test-item.failed {
  border-left: 4px solid #e74c3c;
}

.test-item.skipped {
  border-left: 4px solid #f39c12;
}

.test-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.test-header h4 {
  flex: 1;
  margin: 0;
  color: #2c3e50;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.85rem;
  font-weight: 600;
  text-transform: uppercase;
}

.status-badge.passed {
  background-color: #d4edda;
  color: #155724;
}

.status-badge.failed {
  background-color: #f8d7da;
  color: #721c24;
}

.status-badge.skipped {
  background-color: #fff3cd;
  color: #856404;
}

.duration {
  color: #666;
  font-size: 0.9rem;
}

.test-error {
  background-color: #fee;
  padding: 12px;
  border-radius: 4px;
  margin-top: 8px;
  color: #c33;
}

.test-stack {
  margin-top: 8px;
}

.test-stack summary {
  cursor: pointer;
  color: #3498db;
  font-weight: 500;
}

.test-stack pre {
  background-color: #f8f9fa;
  padding: 12px;
  border-radius: 4px;
  overflow-x: auto;
  margin-top: 8px;
  font-size: 0.85rem;
}

.test-location {
  color: #666;
  font-size: 0.9rem;
  margin-top: 8px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.test-tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-top: 8px;
}

.tag {
  padding: 2px 8px;
  background-color: #e9ecef;
  border-radius: 3px;
  font-size: 0.8rem;
  color: #495057;
}

.test-steps {
  margin-top: 12px;
}

.test-steps summary {
  cursor: pointer;
  color: #3498db;
  font-weight: 500;
  user-select: none;
}

.steps-list {
  margin-top: 8px;
  padding-left: 12px;
}

.step {
  padding: 8px;
  margin: 4px 0;
  background-color: #f8f9fa;
  border-radius: 4px;
  display: grid;
  grid-template-columns: 80px 1fr auto;
  gap: 8px;
  align-items: center;
}

.step.passed {
  border-left: 3px solid #27ae60;
}

.step.failed {
  border-left: 3px solid #e74c3c;
}

.step-status {
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
}

.step-name {
  color: #2c3e50;
}

.step-duration {
  color: #666;
  font-size: 0.85rem;
}

.step-error {
  grid-column: 1 / -1;
  color: #e74c3c;
  font-size: 0.85rem;
  padding: 4px 8px;
  background-color: #fee;
  border-radius: 3px;
}

.test-meta {
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid #eee;
  color: #666;
  font-size: 0.85rem;
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.test-meta span {
  display: flex;
  align-items: center;
  gap: 4px;
}
</style>
