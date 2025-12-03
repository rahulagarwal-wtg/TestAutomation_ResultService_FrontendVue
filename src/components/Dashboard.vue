<template>
  <div class="container-fluid py-4">
    <!-- Header Section -->
    <div class="row mb-4">
      <div class="col-12">
        <div class="card shadow-sm border-0">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-center flex-wrap gap-3">
              <div>
                <h1 class="mb-2 fw-bold">
                  <i class="bi bi-graph-up-arrow text-primary me-2"></i>
                  Test Automation Dashboard
                </h1>
                <p class="text-muted mb-0">Monitor and analyze your test execution results</p>
              </div>
              <button @click="refreshDashboard" class="btn btn-primary" :disabled="loading">
                <i class="bi" :class="loading ? 'bi-arrow-repeat spinner' : 'bi-arrow-clockwise'"></i>
                {{ loading ? 'Refreshing...' : 'Refresh' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Statistics Cards -->
    <div class="row g-3 mb-4" v-if="!loading && dashboardData">
      <div class="col-12 col-sm-6 col-lg-3">
        <div class="card border-0 shadow-sm h-100 stat-card">
          <div class="card-body">
            <div class="d-flex align-items-center">
              <div class="stat-icon bg-primary bg-gradient rounded-3 p-3 me-3">
                <i class="bi bi-box-seam text-white fs-3"></i>
              </div>
              <div>
                <h2 class="mb-0 fw-bold">{{ totalBuilds }}</h2>
                <small class="text-muted text-uppercase fw-semibold">Total Builds</small>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="col-12 col-sm-6 col-lg-3">
        <div class="card border-0 shadow-sm h-100 stat-card">
          <div class="card-body">
            <div class="d-flex align-items-center">
              <div class="stat-icon bg-success bg-gradient rounded-3 p-3 me-3">
                <i class="bi bi-check-circle text-white fs-3"></i>
              </div>
              <div>
                <h2 class="mb-0 fw-bold text-success">{{ passedBuilds }}</h2>
                <small class="text-muted text-uppercase fw-semibold">Passed</small>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="col-12 col-sm-6 col-lg-3">
        <div class="card border-0 shadow-sm h-100 stat-card">
          <div class="card-body">
            <div class="d-flex align-items-center">
              <div class="stat-icon bg-danger bg-gradient rounded-3 p-3 me-3">
                <i class="bi bi-x-circle text-white fs-3"></i>
              </div>
              <div>
                <h2 class="mb-0 fw-bold text-danger">{{ failedBuilds }}</h2>
                <small class="text-muted text-uppercase fw-semibold">Failed</small>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="col-12 col-sm-6 col-lg-3">
        <div class="card border-0 shadow-sm h-100 stat-card">
          <div class="card-body">
            <div class="d-flex align-items-center">
              <div class="stat-icon bg-info bg-gradient rounded-3 p-3 me-3">
                <i class="bi bi-bar-chart text-white fs-3"></i>
              </div>
              <div>
                <h2 class="mb-0 fw-bold text-info">{{ passRate }}%</h2>
                <small class="text-muted text-uppercase fw-semibold">Pass Rate</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Filters Section -->
    <div class="row mb-4" v-if="!loading && dashboardData">
      <div class="col-12">
        <div class="card shadow-sm border-0">
          <div class="card-header bg-white">
            <div class="d-flex justify-content-between align-items-center">
              <h5 class="mb-0 fw-bold">
                <i class="bi bi-funnel me-2"></i>Filters & Search
              </h5>
              <button v-if="searchTerm || selectedRunType !== 'all'" 
                      @click="clearFilters" 
                      class="btn btn-sm btn-outline-secondary">
                <i class="bi bi-x-circle me-1"></i>Clear Filters
              </button>
            </div>
          </div>
          <div class="card-body">
            <div class="row g-3">
              <div class="col-12 col-md-4">
                <label class="form-label fw-semibold">
                  <i class="bi bi-search me-1"></i>Search
                </label>
                <input 
                  type="text" 
                  class="form-control" 
                  v-model="searchTerm" 
                  placeholder="Search by server, branch, or build number...">
              </div>
              
              <div class="col-12 col-md-4">
                <label class="form-label fw-semibold">
                  <i class="bi bi-collection me-1"></i>Run Type
                </label>
                <select class="form-select" v-model="selectedRunType">
                  <option value="all">All Run Types</option>
                  <option v-for="runType in uniqueRunTypes" :key="runType" :value="runType">
                    {{ runType }}
                  </option>
                </select>
              </div>
              
              <div class="col-12 col-md-4">
                <label class="form-label fw-semibold">
                  <i class="bi bi-list-ol me-1"></i>Show Last
                </label>
                <select class="form-select" v-model="limit" @change="loadDashboard">
                  <option :value="25">25 Builds</option>
                  <option :value="50">50 Builds</option>
                </select>
              </div>
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
            <div class="spinner-border text-primary mb-3" role="status">
              <span class="visually-hidden">Loading...</span>
            </div>
            <p class="text-muted mb-0">Loading dashboard data...</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Error State -->
    <div v-if="error && !loading" class="row">
      <div class="col-12">
        <div class="alert alert-danger shadow-sm" role="alert">
          <div class="d-flex align-items-center">
            <i class="bi bi-exclamation-triangle-fill fs-3 me-3"></i>
            <div class="flex-grow-1">
              <h4 class="alert-heading">Error Loading Dashboard</h4>
              <p class="mb-2">{{ error }}</p>
              <button @click="loadDashboard" class="btn btn-danger btn-sm">
                <i class="bi bi-arrow-clockwise me-1"></i>Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Dashboard Content -->
    <div v-if="dashboardData && !loading && !error">
      <div v-for="runTypeGroup in filteredRunTypes" :key="runTypeGroup.runType" class="mb-4">
        <div class="card shadow-sm border-0">
          <div class="card-header bg-primary bg-gradient text-white">
            <div class="d-flex justify-content-between align-items-center">
              <h4 class="mb-0 fw-bold">
                <i class="bi bi-rocket-takeoff me-2"></i>{{ runTypeGroup.runType }}
              </h4>
              <span class="badge bg-light text-dark">{{ runTypeGroup.builds.length }} builds</span>
            </div>
          </div>
          <div class="card-body p-0">
            <div class="table-responsive">
              <table class="table table-hover mb-0">
                <thead class="table-light">
                  <tr>
                    <th><i class="bi bi-calendar-check me-1"></i>Build Date</th>
                    <th><i class="bi bi-hash me-1"></i>Build Number</th>
                    <th><i class="bi bi-server me-1"></i>Server</th>
                    <th><i class="bi bi-git me-1"></i>Branch</th>
                    <th><i class="bi bi-clock-history me-1"></i>Started</th>
                    <th><i class="bi bi-hourglass-split me-1"></i>Duration</th>
                    <th><i class="bi bi-flag me-1"></i>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="build in getPaginatedBuilds(runTypeGroup.runType, runTypeGroup.builds)" :key="build.id">
                    <td>{{ formatDate(build.datetimeStart, 'short') }}</td>
                    <td>
                      <span class="badge bg-secondary">#{{ build.buildNumber }}</span>
                    </td>
                    <td>{{ build.server }}</td>
                    <td>
                      <span class="badge bg-info">
                        <i class="bi bi-git me-1"></i>{{ build.branch }}
                      </span>
                    </td>
                    <td class="small text-muted">{{ formatDate(build.datetimeStart) }}</td>
                    <td class="small">{{ formatDuration(build.datetimeStart, build.datetimeEnd) }}</td>
                    <td>
                      <span class="badge" :class="getStatusBadgeClass(build.status)">
                        <i class="bi me-1" :class="getStatusIcon(build.status)"></i>
                        {{ build.status }}
                      </span>
                    </td>
                    <td>
                      <button @click="viewSummary(build)" class="btn btn-sm btn-outline-primary">
                        <i class="bi bi-eye me-1"></i>View Details
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <!-- Pagination -->
            <div v-if="runTypeGroup.builds.length > itemsPerPage" class="card-footer bg-white border-top">
              <nav aria-label="Build pagination">
                <ul class="pagination pagination-sm mb-0 justify-content-center">
                  <li class="page-item" :class="{ disabled: (currentPage[runTypeGroup.runType] || 1) === 1 }">
                    <button 
                      class="page-link" 
                      @click="changePage(runTypeGroup.runType, (currentPage[runTypeGroup.runType] || 1) - 1)"
                      :disabled="(currentPage[runTypeGroup.runType] || 1) === 1">
                      <i class="bi bi-chevron-left"></i>
                    </button>
                  </li>
                  
                  <li 
                    v-for="page in getTotalPages(runTypeGroup.builds.length)" 
                    :key="page"
                    class="page-item" 
                    :class="{ active: (currentPage[runTypeGroup.runType] || 1) === page }">
                    <button class="page-link" @click="changePage(runTypeGroup.runType, page)">
                      {{ page }}
                    </button>
                  </li>
                  
                  <li 
                    class="page-item" 
                    :class="{ disabled: (currentPage[runTypeGroup.runType] || 1) === getTotalPages(runTypeGroup.builds.length) }">
                    <button 
                      class="page-link" 
                      @click="changePage(runTypeGroup.runType, (currentPage[runTypeGroup.runType] || 1) + 1)"
                      :disabled="(currentPage[runTypeGroup.runType] || 1) === getTotalPages(runTypeGroup.builds.length)">
                      <i class="bi bi-chevron-right"></i>
                    </button>
                  </li>
                </ul>
              </nav>
              
              <div class="text-center mt-2">
                <small class="text-muted">
                  Showing {{ ((currentPage[runTypeGroup.runType] || 1) - 1) * itemsPerPage + 1 }} 
                  to {{ Math.min((currentPage[runTypeGroup.runType] || 1) * itemsPerPage, runTypeGroup.builds.length) }} 
                  of {{ runTypeGroup.builds.length }} builds
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="filteredRunTypes.length === 0" class="row">
        <div class="col-12">
          <div class="card shadow-sm border-0">
            <div class="card-body text-center py-5">
              <i class="bi bi-search fs-1 text-muted mb-3 d-block"></i>
              <h4 class="text-muted">No Results Found</h4>
              <p class="text-muted mb-3">Try adjusting your filters or search criteria</p>
              <button @click="clearFilters" class="btn btn-primary">
                <i class="bi bi-x-circle me-1"></i>Clear Filters
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import testRunService from '@/services/testRunService'
import type { DashboardResponse, RunTypeGroup, TestRunView } from '@/types'

const router = useRouter()

// Reactive state
const dashboardData = ref<DashboardResponse | null>(null)
const loading = ref<boolean>(false)
const error = ref<string | null>(null)
const limit = ref<number>(25)
const searchTerm = ref<string>('')
const selectedRunType = ref<string>('all')
const currentPage = ref<Record<string, number>>({}) // Track page per run type
const itemsPerPage = 5

// Computed statistics
const totalBuilds = computed((): number => {
  if (!dashboardData.value) return 0
  return dashboardData.value.runTypes.reduce((sum, rt) => sum + rt.builds.length, 0)
})

const passedBuilds = computed((): number => {
  if (!dashboardData.value) return 0
  return dashboardData.value.runTypes.reduce((sum, rt) => {
    return sum + rt.builds.filter(b => ['PASSED', 'SUCCESS'].includes(b.status?.toUpperCase())).length
  }, 0)
})

const failedBuilds = computed((): number => {
  if (!dashboardData.value) return 0
  return dashboardData.value.runTypes.reduce((sum, rt) => {
    return sum + rt.builds.filter(b => ['FAILED', 'FAILURE'].includes(b.status?.toUpperCase())).length
  }, 0)
})

const passRate = computed((): number => {
  if (totalBuilds.value === 0) return 0
  return Math.round((passedBuilds.value / totalBuilds.value) * 100)
})

const uniqueRunTypes = computed((): string[] => {
  if (!dashboardData.value) return []
  return dashboardData.value.runTypes.map(rt => rt.runType)
})

const filteredRunTypes = computed((): RunTypeGroup[] => {
  if (!dashboardData.value) return []
  
  let filtered = dashboardData.value.runTypes
  
  // Filter by run type
  if (selectedRunType.value !== 'all') {
    filtered = filtered.filter(rt => rt.runType === selectedRunType.value)
  }
  
  // Filter by search term
  if (searchTerm.value.trim()) {
    const term = searchTerm.value.toLowerCase()
    filtered = filtered.map(runType => ({
      ...runType,
      builds: runType.builds.filter(build =>
        build.server.toLowerCase().includes(term) ||
        build.branch.toLowerCase().includes(term) ||
        build.buildNumber.toString().includes(term)
      )
    })).filter(runType => runType.builds.length > 0)
  }
  
  return filtered
})

// Paginated builds for each run type
const getPaginatedBuilds = (runType: string, builds: TestRunView[]) => {
  const page = currentPage.value[runType] || 1
  const start = (page - 1) * itemsPerPage
  const end = start + itemsPerPage
  return builds.slice(start, end)
}

const getTotalPages = (buildsLength: number): number => {
  return Math.ceil(buildsLength / itemsPerPage)
}

const changePage = (runType: string, page: number): void => {
  currentPage.value[runType] = page
}

const initializePages = (): void => {
  if (!dashboardData.value) return
  dashboardData.value.runTypes.forEach(rt => {
    if (!currentPage.value[rt.runType]) {
      currentPage.value[rt.runType] = 1
    }
  })
}

// Methods
const loadDashboard = async (): Promise<void> => {
  loading.value = true
  error.value = null
  
  try {
    const response = await testRunService.getDashboardData(limit.value)
    dashboardData.value = response.data
    initializePages()
  } catch (err) {
    error.value = 'Failed to load dashboard data. Please try again.'
    console.error('Dashboard error:', err)
  } finally {
    loading.value = false
  }
}

const refreshDashboard = (): void => {
  loadDashboard()
}

const clearFilters = (): void => {
  searchTerm.value = ''
  selectedRunType.value = 'all'
  // Reset pagination
  Object.keys(currentPage.value).forEach(key => {
    currentPage.value[key] = 1
  })
}

const viewSummary = (build: TestRunView): void => {
  router.push({
    name: 'summary',
    params: {
      server: build.server,
      runType: build.runType,
      branch: build.branch,
      buildNumber: build.buildNumber.toString()
    }
  })
}

const getStatusBadgeClass = (status: string): string => {
  const statusUpper = status?.toUpperCase()
  if (['PASSED', 'SUCCESS'].includes(statusUpper)) return 'bg-success'
  if (['FAILED', 'FAILURE'].includes(statusUpper)) return 'bg-danger'
  if (statusUpper === 'RUNNING') return 'bg-warning text-dark'
  return 'bg-secondary'
}

const getStatusIcon = (status: string): string => {
  const statusUpper = status?.toUpperCase()
  if (['PASSED', 'SUCCESS'].includes(statusUpper)) return 'bi-check-circle'
  if (['FAILED', 'FAILURE'].includes(statusUpper)) return 'bi-x-circle'
  if (statusUpper === 'RUNNING') return 'bi-arrow-repeat'
  return 'bi-question-circle'
}

const formatDate = (dateString: string, format: 'long' | 'short' = 'long'): string => {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  if (format === 'short') {
    return date.toLocaleDateString()
  }
  return date.toLocaleString()
}

const formatDuration = (start: string, end: string): string => {
  if (!start || !end) return 'N/A'
  const diff = new Date(end).getTime() - new Date(start).getTime()
  const hours = Math.floor(diff / 3600000)
  const minutes = Math.floor((diff % 3600000) / 60000)
  const seconds = Math.floor((diff % 60000) / 1000)
  
  if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`
  }
  return `${minutes}m ${seconds}s`
}

// Lifecycle
onMounted(() => {
  loadDashboard()
})
</script>

<style scoped>
.stat-card {
  transition: transform 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-5px);
}

.spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

tbody tr {
  transition: all 0.2s ease;
  cursor: pointer;
}

tbody tr:hover {
  background-color: rgba(0, 123, 255, 0.05);
}

.pagination {
  margin: 0;
}

.page-link {
  color: #0d6efd;
  border-color: #dee2e6;
}

.page-link:hover {
  background-color: #e9ecef;
}

.page-item.active .page-link {
  background-color: #0d6efd;
  border-color: #0d6efd;
}

.page-item.disabled .page-link {
  color: #6c757d;
  pointer-events: none;
  background-color: #fff;
}
</style>