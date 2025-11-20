<template>
  <div class="failures-container">
    <h2>Failed Test Cases</h2>
    
    <div v-if="loading" class="loading">Loading failed tests...</div>
    
    <div v-else-if="error" class="error">
      {{ error }}
    </div>
    
    <div v-else-if="!failureData || failureData.failureGroups.length === 0" class="no-data">
      No failed tests found.
    </div>
    
    <div v-else class="failures-content">
      <div class="summary-stats">
        <h3>Total Failures: {{ failureData.totalFailures }}</h3>
      </div>
      
      <div 
        v-for="group in failureData.failureGroups" 
        :key="group.failureReason"
        class="failure-group"
      >
        <div class="group-header">
          <h3>{{ group.failureReason || 'Unknown Error' }}</h3>
          <span class="count-badge">{{ group.count }} failures</span>
        </div>
        
        <div class="scenarios-list">
          <div 
            v-for="scenario in group.scenarios" 
            :key="scenario.id || scenario.name"
            class="scenario-item"
          >
            <div class="scenario-name">{{ scenario.name }}</div>
            <div class="scenario-details">
              <span class="scenario-uri">{{ scenario.uri }}:{{ scenario.lineNumber }}</span>
              <span v-if="scenario.lastFailedOn" class="last-failed">
                Last failed: {{ formatDate(scenario.lastFailedOn) }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useTestRunStore } from '@/stores/testRunStore'
import type { FailuresByReasonResponse } from '@/types'

const route = useRoute()
const store = useTestRunStore()

const loading = ref(true)
const error = ref<string | null>(null)
const failureData = ref<FailuresByReasonResponse | null>(null)

onMounted(async () => {
  try {
    const server = route.params.server as string
    const runType = route.params.runType as string
    const branch = route.params.branch as string
    const buildNumber = Number(route.params.buildNumber)
    
    if (server && runType && branch && buildNumber) {
      failureData.value = await store.fetchFailuresByReason(server, runType, branch, buildNumber)
    } else {
      error.value = 'Missing required parameters'
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to load failure data'
  } finally {
    loading.value = false
  }
})

const formatDate = (date: string): string => {
  return new Date(date).toLocaleString()
}
</script>

<style scoped>
.failures-container {
  padding: 20px;
}

h2 {
  margin-bottom: 20px;
  color: #2c3e50;
}

.loading, .error, .no-data {
  padding: 20px;
  text-align: center;
  border-radius: 8px;
  background-color: #f8f9fa;
}

.error {
  background-color: #fee;
  color: #c33;
}

.failures-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.failure-item {
  border: 1px solid #e74c3c;
  border-radius: 8px;
  padding: 16px;
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.failure-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid #eee;
}

.failure-header h3 {
  margin: 0;
  color: #2c3e50;
  font-size: 1.1rem;
}

.module-badge {
  padding: 4px 12px;
  background-color: #3498db;
  color: white;
  border-radius: 12px;
  font-size: 0.85rem;
}

.failure-details {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.detail-row {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.label {
  font-weight: 600;
  color: #666;
  font-size: 0.9rem;
}

.value {
  color: #2c3e50;
}

.error-message {
  color: #e74c3c;
  font-weight: 500;
}

.stack-trace {
  background-color: #f8f9fa;
  padding: 12px;
  border-radius: 4px;
  overflow-x: auto;
  font-family: 'Courier New', monospace;
  font-size: 0.85rem;
  color: #666;
  margin: 0;
}
</style>
