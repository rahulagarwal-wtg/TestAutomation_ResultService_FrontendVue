<template>
  <div class="failures-container">
    <div class="page-header">
      <h1>Failed Test Cases</h1>
      <p class="subtitle">Analysis of test failures grouped by error type</p>
    </div>
    
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>Loading failed tests...</p>
    </div>
    
    <div v-else-if="error" class="error-state">
      <div class="error-icon">⚠️</div>
      <h3>Error Loading Data</h3>
      <p>{{ error }}</p>
    </div>
    
    <div v-else-if="!failureData || failureData.failureGroups.length === 0" class="empty-state">
      <div class="success-icon">✓</div>
      <h3>No Failures Found</h3>
      <p>All tests passed successfully!</p>
    </div>
    
    <div v-else class="failures-content">
      <div class="summary-card">
        <div class="stat">
          <div class="stat-value">{{ failureData.totalFailures }}</div>
          <div class="stat-label">Total Failures</div>
        </div>
        <div class="stat">
          <div class="stat-value">{{ failureData.failureGroups.length }}</div>
          <div class="stat-label">Unique Errors</div>
        </div>
      </div>
      
      <div class="failure-groups">
        <div 
          v-for="(group, index) in failureData.failureGroups" 
          :key="group.failureReason || index"
          class="failure-group"
        >
          <div class="group-header" @click="toggleGroup(index)">
            <div class="group-title">
              <span class="expand-icon">{{ expandedGroups[index] ? '▼' : '▶' }}</span>
              <h3>{{ group.failureReason || 'Unknown Error' }}</h3>
            </div>
            <div class="count-badge">{{ group.count }} {{ group.count === 1 ? 'failure' : 'failures' }}</div>
          </div>
          
          <transition name="expand">
            <div v-show="expandedGroups[index]" class="scenarios-list">
              <div 
                v-for="(scenario, sIndex) in group.scenarios" 
                :key="scenario.id || `${scenario.name}-${sIndex}`"
                class="scenario-card"
              >
                <div class="scenario-header">
                  <div class="scenario-icon">🔴</div>
                  <div class="scenario-info">
                    <div class="scenario-name">{{ scenario.name }}</div>
                    <div class="scenario-meta">
                      <span class="meta-item">
                        <span class="meta-icon">📁</span>
                        {{ scenario.uri }}
                      </span>
                      <span class="meta-item">
                        <span class="meta-icon">📍</span>
                        Line {{ scenario.lineNumber }}
                      </span>
                      <span v-if="scenario.lastFailedOn" class="meta-item">
                        <span class="meta-icon">🕐</span>
                        {{ formatDate(scenario.lastFailedOn) }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </transition>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import { useRoute } from 'vue-router'
import { useTestRunStore } from '@/stores/testRunStore'
import type { FailuresByReasonResponse } from '@/types'

const route = useRoute()
const store = useTestRunStore()

const loading = ref(true)
const error = ref<string | null>(null)
const failureData = ref<FailuresByReasonResponse | null>(null)
const expandedGroups = reactive<Record<number, boolean>>({})

onMounted(async () => {
  try {
    const server = route.params.server as string
    const runType = route.params.runType as string
    const branch = route.params.branch as string
    const buildNumber = Number(route.params.buildNumber)
    
    if (server && runType && branch && buildNumber) {
      failureData.value = await store.fetchFailuresByReason(server, runType, branch, buildNumber)
      // Expand first group by default
      if (failureData.value?.failureGroups.length) {
        expandedGroups[0] = true
      }
    } else {
      error.value = 'Missing required parameters'
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to load failure data'
  } finally {
    loading.value = false
  }
})

const toggleGroup = (index: number) => {
  expandedGroups[index] = !expandedGroups[index]
}

const formatDate = (date: string): string => {
  return new Date(date).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<style scoped>
.failures-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: 100vh;
}

.page-header {
  text-align: center;
  margin-bottom: 32px;
  padding: 24px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.page-header h1 {
  margin: 0 0 8px 0;
  color: #2c3e50;
  font-size: 2rem;
  font-weight: 600;
}

.subtitle {
  margin: 0;
  color: #7f8c8d;
  font-size: 1rem;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-state, .empty-state {
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.error-icon, .success-icon {
  font-size: 4rem;
  margin-bottom: 16px;
}

.error-state h3 {
  color: #e74c3c;
  margin: 0 0 8px 0;
}

.empty-state h3 {
  color: #27ae60;
  margin: 0 0 8px 0;
}

.error-state p, .empty-state p {
  color: #7f8c8d;
  margin: 0;
}

.summary-card {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

.stat {
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.stat-value {
  font-size: 2.5rem;
  font-weight: 700;
  color: #e74c3c;
  margin-bottom: 8px;
}

.stat-label {
  color: #7f8c8d;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.failure-groups {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.failure-group {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: transform 0.2s;
}

.failure-group:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.group-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  cursor: pointer;
  user-select: none;
}

.group-title {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.expand-icon {
  color: white;
  font-size: 0.8rem;
  transition: transform 0.3s;
}

.group-header h3 {
  margin: 0;
  color: white;
  font-size: 1.1rem;
  font-weight: 500;
}

.count-badge {
  padding: 6px 16px;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  color: white;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.scenarios-list {
  padding: 16px;
  background: #f8f9fa;
}

.scenario-card {
  background: white;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 12px;
  border-left: 4px solid #e74c3c;
  transition: all 0.2s;
}

.scenario-card:last-child {
  margin-bottom: 0;
}

.scenario-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transform: translateX(4px);
}

.scenario-header {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}

.scenario-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.scenario-info {
  flex: 1;
}

.scenario-name {
  font-size: 1rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 8px;
}

.scenario-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.85rem;
  color: #7f8c8d;
}

.meta-icon {
  font-size: 0.9rem;
}

.expand-enter-active,
.expand-leave-active {
  transition: all 0.3s ease;
  max-height: 2000px;
  overflow: hidden;
}

.expand-enter-from,
.expand-leave-to {
  max-height: 0;
  opacity: 0;
}

@media (max-width: 768px) {
  .failures-container {
    padding: 16px;
  }
  
  .page-header h1 {
    font-size: 1.5rem;
  }
  
  .scenario-meta {
    flex-direction: column;
    gap: 8px;
  }
  
  .stat-value {
    font-size: 2rem;
  }
}
</style>
