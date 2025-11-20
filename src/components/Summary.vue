<template>
  <div class="container-fluid py-4">
    <!-- Breadcrumb -->
    <nav aria-label="breadcrumb" class="mb-3">
      <ol class="breadcrumb">
        <li class="breadcrumb-item">
          <router-link to="/dashboard" class="text-decoration-none">
            <i class="bi bi-house-door"></i> Dashboard
          </router-link>
        </li>
        <li class="breadcrumb-item active">Test Run Summary</li>
      </ol>
    </nav>

    <!-- Page Header -->
    <div class="row mb-4">
      <div class="col-12">
        <div class="card shadow-sm border-0">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-center flex-wrap gap-3">
              <div>
                <h1 class="mb-2 fw-bold">
                  <i class="bi bi-file-earmark-text text-primary me-2"></i>
                  Test Run Summary
                </h1>
                <p class="text-muted mb-0">Detailed analysis of test execution results</p>
              </div>
              <button @click="goBack" class="btn btn-outline-secondary">
                <i class="bi bi-arrow-left me-1"></i>Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="row">
      <div class="col-12">
        <div class="card shadow-sm border-0">
          <div class="card-body text-center py-5">
            <div class="spinner-border text-primary mb-3"></div>
            <p class="text-muted mb-0">Loading summary...</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Error State -->
    <div v-if="error && !loading" class="row">
      <div class="col-12">
        <div class="alert alert-danger shadow-sm">
          <div class="d-flex align-items-center">
            <i class="bi bi-exclamation-triangle-fill fs-3 me-3"></i>
            <div class="flex-grow-1">
              <h4 class="alert-heading">Error Loading Summary</h4>
              <p class="mb-2">{{ error }}</p>
              <button @click="loadSummary" class="btn btn-danger btn-sm">
                <i class="bi bi-arrow-clockwise me-1"></i>Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Content -->
    <div v-if="summary && !loading">
      
      <!-- Build Information -->
      <div class="row mb-4">
        <div class="col-12">
          <div class="card shadow-sm border-0">
            <div class="card-header bg-primary bg-gradient text-white">
              <h5 class="mb-0 fw-bold">
                <i class="bi bi-info-circle me-2"></i>Build Information
              </h5>
            </div>
            <div class="card-body">
              <div class="row g-3">
                <div class="col-12 col-md-6 col-lg-4">
                  <div class="p-3 bg-light rounded">
                    <div class="d-flex align-items-center">
                      <i class="bi bi-server text-primary fs-3 me-3"></i>
                      <div>
                        <small class="text-muted d-block">Server</small>
                        <strong>{{ summary.server }}</strong>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div class="col-12 col-md-6 col-lg-4">
                  <div class="p-3 bg-light rounded">
                    <div class="d-flex align-items-center">
                      <i class="bi bi-git text-primary fs-3 me-3"></i>
                      <div>
                        <small class="text-muted d-block">Branch</small>
                        <strong>{{ summary.branch }}</strong>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div class="col-12 col-md-6 col-lg-4">
                  <div class="p-3 bg-light rounded">
                    <div class="d-flex align-items-center">
                      <i class="bi bi-hash text-primary fs-3 me-3"></i>
                      <div>
                        <small class="text-muted d-block">Build Number</small>
                        <strong>#{{ summary.buildNumber }}</strong>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div class="col-12 col-md-6 col-lg-4">
                  <div class="p-3 bg-light rounded">
                    <div class="d-flex align-items-center">
                      <i class="bi bi-calendar3 text-primary fs-3 me-3"></i>
                      <div>
                        <small class="text-muted d-block">Build Date</small>
                        <strong>{{ summary.buildDate }}</strong>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div class="col-12 col-md-6 col-lg-4">
                  <div class="p-3 bg-light rounded">
                    <div class="d-flex align-items-center">
                      <i class="bi bi-stopwatch text-primary fs-3 me-3"></i>
                      <div>
                        <small class="text-muted d-block">Duration</small>
                        <strong>{{ summary.buildDuration }}</strong>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Overall Statistics -->
      <div class="row mb-4">
        <div class="col-12">
          <div class="card shadow-sm border-0">
            <div class="card-header bg-primary bg-gradient text-white">
              <h5 class="mb-0 fw-bold">
                <i class="bi bi-bar-chart me-2"></i>Overall Statistics
              </h5>
            </div>
            <div class="card-body">
              <div class="row g-3 mb-4">
                <div class="col-6 col-md-3">
                  <div class="text-center p-3 bg-light rounded">
                    <i class="bi bi-box-seam text-primary fs-1"></i>
                    <h3 class="mb-0 mt-2 fw-bold">{{ totalTests }}</h3>
                    <small class="text-muted text-uppercase">Total Tests</small>
                  </div>
                </div>
                
                <div class="col-6 col-md-3">
                  <div class="text-center p-3 bg-success bg-opacity-10 rounded">
                    <i class="bi bi-check-circle text-success fs-1"></i>
                    <h3 class="mb-0 mt-2 fw-bold text-success">{{ totalPassed }}</h3>
                    <small class="text-muted text-uppercase">Passed</small>
                  </div>
                </div>
                
                <div class="col-6 col-md-3">
                  <div class="text-center p-3 bg-danger bg-opacity-10 rounded">
                    <i class="bi bi-x-circle text-danger fs-1"></i>
                    <h3 class="mb-0 mt-2 fw-bold text-danger">{{ totalFailed }}</h3>
                    <small class="text-muted text-uppercase">Failed</small>
                  </div>
                </div>
                
                <div class="col-6 col-md-3">
                  <div class="text-center p-3 bg-info bg-opacity-10 rounded">
                    <i class="bi bi-percent text-info fs-1"></i>
                    <h3 class="mb-0 mt-2 fw-bold text-info">{{ passRate }}%</h3>
                    <small class="text-muted text-uppercase">Pass Rate</small>
                  </div>
                </div>
              </div>

              <!-- Progress Bar -->
              <div class="mb-4">
                <div class="d-flex justify-content-between mb-2">
                  <span class="text-success fw-semibold">
                    <i class="bi bi-check-circle me-1"></i>{{ totalPassed }} Passed
                  </span>
                  <span class="text-danger fw-semibold">
                    <i class="bi bi-x-circle me-1"></i>{{ totalFailed }} Failed
                  </span>
                </div>
                <div class="progress" style="height: 25px;">
                  <div class="progress-bar bg-success" 
                       :style="{ width: `${(totalPassed / totalTests) * 100}%` }">
                    {{ totalPassed }}
                  </div>
                  <div class="progress-bar bg-danger" 
                       :style="{ width: `${(totalFailed / totalTests) * 100}%` }">
                    {{ totalFailed }}
                  </div>
                </div>
              </div>

              <button v-if="totalFailed > 0" @click="viewFailures" class="btn btn-danger w-100">
                <i class="bi bi-exclamation-triangle me-2"></i>
                View Failure Analysis
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Module Results -->
      <div class="row mb-4">
        <div class="col-12">
          <div class="card shadow-sm border-0">
            <div class="card-header bg-primary bg-gradient text-white">
              <div class="d-flex justify-content-between align-items-center">
                <h5 class="mb-0 fw-bold">
                  <i class="bi bi-folder2-open me-2"></i>Module Results
                </h5>
                <div class="btn-group btn-group-sm">
                  <button class="btn" 
                          :class="selectedView === 'grid' ? 'btn-light' : 'btn-outline-light'"
                          @click="selectedView = 'grid'">
                    <i class="bi bi-grid-3x3-gap me-1"></i>Grid
                  </button>
                  <button class="btn"
                          :class="selectedView === 'list' ? 'btn-light' : 'btn-outline-light'"
                          @click="selectedView = 'list'">
                    <i class="bi bi-list-ul me-1"></i>List
                  </button>
                </div>
              </div>
            </div>
            <div class="card-body">
              
              <!-- Grid View -->
              <div v-if="selectedView === 'grid'" class="row g-3">
                <div v-for="result in sortedModules" :key="result.name" 
                     class="col-12 col-md-6 col-lg-4">
                  <div class="card h-100 module-card cursor-pointer" 
                       :class="result.failed === 0 ? 'border-success' : 'border-danger'"
                       @click="viewModuleDetails(result.name)">
                    <div class="card-body">
                      <div class="d-flex justify-content-between align-items-start mb-3">
                        <h6 class="card-title fw-bold mb-0">
                          <i class="bi bi-folder me-2"></i>{{ result.name }}
                        </h6>
                        <span class="badge" :class="getPassRateBadge(getModulePassRate(result))">
                          {{ getModulePassRate(result) }}%
                        </span>
                      </div>
                      
                      <div class="row g-2 mb-3">
                        <div class="col-4 text-center">
                          <i class="bi bi-check-circle text-success fs-4"></i>
                          <div class="fw-bold">{{ result.passed }}</div>
                          <small class="text-muted">Passed</small>
                        </div>
                        <div class="col-4 text-center">
                          <i class="bi bi-x-circle text-danger fs-4"></i>
                          <div class="fw-bold">{{ result.failed }}</div>
                          <small class="text-muted">Failed</small>
                        </div>
                        <div class="col-4 text-center">
                          <i class="bi bi-collection text-primary fs-4"></i>
                          <div class="fw-bold">{{ result.passed + result.failed }}</div>
                          <small class="text-muted">Total</small>
                        </div>
                      </div>

                      <div class="progress mb-2" style="height: 8px;">
                        <div class="progress-bar bg-success" 
                             :style="{ width: `${getModulePassRate(result)}%` }">
                        </div>
                      </div>

                      <div class="d-flex justify-content-between align-items-center">
                        <small class="text-muted">
                          <i class="bi bi-clock me-1"></i>{{ result.duration }}
                        </small>
                        <small class="text-primary fw-semibold">
                          View Details <i class="bi bi-arrow-right"></i>
                        </small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- List View -->
              <div v-if="selectedView === 'list'" class="table-responsive">
                <table class="table table-hover mb-0">
                  <thead class="table-light">
                    <tr>
                      <th>Module</th>
                      <th class="text-center">Passed</th>
                      <th class="text-center">Failed</th>
                      <th class="text-center">Total</th>
                      <th>Pass Rate</th>
                      <th>Duration</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="result in sortedModules" :key="result.name" class="cursor-pointer">
                      <td>
                        <i class="bi bi-folder text-primary me-2"></i>
                        <strong>{{ result.name }}</strong>
                      </td>
                      <td class="text-center">
                        <span class="badge bg-success">{{ result.passed }}</span>
                      </td>
                      <td class="text-center">
                        <span class="badge bg-danger">{{ result.failed }}</span>
                      </td>
                      <td class="text-center">{{ result.passed + result.failed }}</td>
                      <td>
                        <div class="d-flex align-items-center gap-2">
                          <div class="progress flex-grow-1" style="height: 8px;">
                            <div class="progress-bar bg-success" 
                                 :style="{ width: `${getModulePassRate(result)}%` }">
                            </div>
                          </div>
                          <span class="fw-semibold">{{ getModulePassRate(result) }}%</span>
                        </div>
                      </td>
                      <td>{{ result.duration }}</td>
                      <td>
                        <button @click="viewModuleDetails(result.name)" 
                                class="btn btn-sm btn-outline-primary">
                          <i class="bi bi-eye me-1"></i>View
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Rerun History -->
      <div v-if="rerunSummaries.length > 0" class="row">
        <div class="col-12">
          <div class="card shadow-sm border-0">
            <div class="card-header bg-info bg-gradient text-white">
              <h5 class="mb-0 fw-bold">
                <i class="bi bi-arrow-repeat me-2"></i>Rerun History
              </h5>
            </div>
            <div class="card-body">
              <div class="accordion" id="rerunAccordion">
                <div v-for="(rerun, i) in rerunSummaries" :key="i" class="accordion-item">
                  <h2 class="accordion-header" :id="'heading' + i">
                    <button class="accordion-button collapsed" 
                            type="button" 
                            data-bs-toggle="collapse" 
                            :data-bs-target="'#collapse' + i">
                      <span class="badge bg-info me-3">{{ i + 1 }}</span>
                      <strong>Build #{{ rerun.buildNumber }}</strong>
                      <span class="ms-auto me-3 text-muted">
                        {{ rerun.buildDate }} | {{ rerun.buildDuration }}
                      </span>
                    </button>
                  </h2>
                  <div :id="'collapse' + i" 
                       class="accordion-collapse collapse">
                    <div class="accordion-body">
                      <div class="row g-2">
                        <div v-for="result in rerun.results" :key="result.name" 
                             class="col-12 col-md-6">
                          <div class="p-2 bg-light rounded">
                            <strong>{{ result.name }}:</strong>
                            <span class="text-success ms-2">
                              <i class="bi bi-check-circle"></i> {{ result.passed }}
                            </span>
                            <span class="text-danger ms-2">
                              <i class="bi bi-x-circle"></i> {{ result.failed }}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import testRunService from '../services/testRunService'

const route = useRoute()
const router = useRouter()

const summary = ref(null)
const rerunSummaries = ref([])
const loading = ref(false)
const error = ref(null)
const selectedView = ref('grid')

const server = route.params.server
const runType = route.params.runType
const branch = route.params.branch
const buildNumber = route.params.buildNumber

// Computed
const totalTests = computed(() => {
  if (!summary.value) return 0
  return summary.value.results.reduce((sum, r) => sum + r.passed + r.failed + (r.skipped || 0), 0)
})

const totalPassed = computed(() => {
  if (!summary.value) return 0
  return summary.value.results.reduce((sum, r) => sum + r.passed, 0)
})

const totalFailed = computed(() => {
  if (!summary.value) return 0
  return summary.value.results.reduce((sum, r) => sum + r.failed, 0)
})

const passRate = computed(() => {
  if (totalTests.value === 0) return 0
  return Math.round((totalPassed.value / totalTests.value) * 100)
})

const sortedModules = computed(() => {
  if (!summary.value) return []
  return [...summary.value.results].sort((a, b) => {
    if (b.failed !== a.failed) return b.failed - a.failed
    return a.name.localeCompare(b.name)
  })
})

// Methods
const loadSummary = async () => {
  loading.value = true
  error.value = null
  
  try {
    const response = await testRunService.getTestRunSummary(server, runType, branch, buildNumber)
    summary.value = response.data
  } catch (err) {
    error.value = 'Failed to load test run summary'
    console.error('Summary error:', err)
  } finally {
    loading.value = false
  }
}

const loadRerunSummaries = async () => {
  try {
    const response = await testRunService.getRerunSummary(server, runType, branch, buildNumber)
    rerunSummaries.value = response.data
  } catch (err) {
    console.error('Rerun summaries error:', err)
  }
}

const viewModuleDetails = (moduleName) => {
  router.push({
    name: 'module-details',
    params: { server, runType, branch, buildNumber, module: moduleName }
  })
}

const viewFailures = () => {
  router.push({
    name: 'failures',
    params: { server, runType, branch, buildNumber }
  })
}

const goBack = () => {
  router.push('/dashboard')
}

const getModulePassRate = (result) => {
  const total = result.passed + result.failed + (result.skipped || 0)
  if (total === 0) return 0
  return Math.round((result.passed / total) * 100)
}

const getPassRateBadge = (rate) => {
  if (rate >= 90) return 'bg-success'
  if (rate >= 70) return 'bg-warning text-dark'
  return 'bg-danger'
}

onMounted(() => {
  loadSummary()
  loadRerunSummaries()
})
</script>

<style scoped>
.module-card {
  transition: all 0.3s ease;
  border-width: 2px !important;
  cursor: pointer;
}

.module-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;
}

.module-card.border-success {
  border-left: 4px solid #198754 !important;
}

.module-card.border-danger {
  border-left: 4px solid #dc3545 !important;
}

.cursor-pointer {
  cursor: pointer;
}

tbody tr {
  transition: all 0.2s ease;
}

tbody tr:hover {
  background-color: rgba(0, 123, 255, 0.05);
}
</style>